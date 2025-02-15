import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PenLine, TrendingUp, Download, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useFilters } from '@/components/contexts/FilterContext';
import { PayoutLineChart } from '@/components/PayoutLineChart';
import { exportToCSV, exportToPDF } from '@/utils/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import axios from 'axios';

interface DevToArticle {
  title: string;
  user: {
    name: string;
  };
  published_at: string;
}

interface NewsArticle {
  author: string;
  type: 'news' | 'blog';
  publishedAt: string;
}

interface PayoutData {
  author: string;
  articles: number;
  payout: number;
  type: 'news' | 'blog';
  publishedAt: string[];
}

interface AuthorStats {
  articles: number;
  payout: number;
  type: 'news' | 'blog';
  publishedAt: string[];
}

interface ApiError {
  source: 'news' | 'blog';
  message: string;
}

export default function PayoutSection() {
  const { filters } = useFilters();
  const [payoutRate, setPayoutRate] = useState<number>(10);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState<number>(10);
  const [payoutData, setPayoutData] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    
    const savedRate = localStorage.getItem('payoutRate');
    if (savedRate) {
      setPayoutRate(Number(savedRate));
      setTempRate(Number(savedRate));
    }
  }, []);
  

  
  useEffect(() => {
    const fetchContentData = async () => {
      setLoading(true);
      setErrors([]);
      const newErrors: ApiError[] = [];

      try {
       
        let newsArticles: NewsArticle[] = [];
        try {
          const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=tech&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`,
            { timeout: 8000 }
          );
          newsArticles = newsResponse.data.articles.map((article: any) => ({
            author: article.author,
            type: 'news',
            publishedAt: article.publishedAt
          }));
        } catch (error) {
          let message = 'Failed to fetch news';
          if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
              message = 'News API request timed out';
            } else if (error.response?.status === 429) {
              message = 'News API rate limit exceeded';
            } else if (error.response?.status === 401) {
              message = 'Invalid News API key';
            }
          }
          newErrors.push({ source: 'news', message });
        }
     
        let blogArticles: NewsArticle[] = [];
        try {
          const devToResponse = await axios.get(
            'https://dev.to/api/articles?per_page=30',
            { timeout: 8000 }
          );
          blogArticles = devToResponse.data.map((article: DevToArticle) => ({
            author: article.user.name,
            type: 'blog',
            publishedAt: article.published_at
          }));
        } catch (error) {
          newErrors.push({
            source: 'blog',
            message: 'Failed to fetch blog posts'
          });
        }

       
        const allArticles = [...newsArticles, ...blogArticles];
        
      
        const authorStats = allArticles.reduce((acc: Record<string, AuthorStats>, article) => {
          if (!article.author) return acc;
          
          if (!acc[article.author]) {
            acc[article.author] = {
              articles: 0,
              payout: 0,
              type: article.type,
              publishedAt: []
            };
          }
          
          acc[article.author].articles++;
          acc[article.author].payout = acc[article.author].articles * payoutRate;
          acc[article.author].publishedAt.push(article.publishedAt);
          
          return acc;
        }, {});

       
        const payouts = Object.entries(authorStats)
          .filter(([author]) => author && author !== 'null' && author !== 'undefined')
          .map(([author, stats]) => ({
            author,
            articles: stats.articles,
            payout: stats.payout,
            type: stats.type,
            publishedAt: stats.publishedAt
          }))
          .sort((a, b) => b.payout - a.payout); 

        setPayoutData(payouts);
        setErrors(newErrors);
      } catch (error) {
        console.error('Error in fetchContent:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [payoutRate, retryCount]);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getFilteredPayouts = () => {
    let filtered = [...payoutData];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(payout => 
        payout.author.toLowerCase().includes(searchLower)
      );
    }

    if (filters.author) {
      const authorLower = filters.author.toLowerCase();
      filtered = filtered.filter(payout => 
        payout.author.toLowerCase().includes(authorLower)
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(payout => payout.type === filters.type);
    }

    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(payout => {
        return payout.publishedAt.some(date => {
          const articleDate = new Date(date);
          if (filters.dateRange.from && filters.dateRange.to) {
            return articleDate >= filters.dateRange.from && articleDate <= filters.dateRange.to;
          } else if (filters.dateRange.from) {
            return articleDate >= filters.dateRange.from;
          } else if (filters.dateRange.to) {
            return articleDate <= filters.dateRange.to;
          }
          return true;
        });
      });

      filtered = filtered.map(payout => {
        const articlesInRange = payout.publishedAt.filter(date => {
          const articleDate = new Date(date);
          if (filters.dateRange.from && filters.dateRange.to) {
            return articleDate >= filters.dateRange.from && articleDate <= filters.dateRange.to;
          } else if (filters.dateRange.from) {
            return articleDate >= filters.dateRange.from;
          } else if (filters.dateRange.to) {
            return articleDate <= filters.dateRange.to;
          }
          return true;
        }).length;

        return {
          ...payout,
          articles: articlesInRange,
          payout: articlesInRange * payoutRate
        };
      });
    }

    return filtered;
  }

  const handleStartEditing = () => {
    setTempRate(payoutRate);
    setIsEditingRate(true);
  };

  const handleSave = () => {
    if (tempRate <= 0) {
      return;
    }
    setPayoutRate(tempRate);
    localStorage.setItem('payoutRate', tempRate.toString());
    setIsEditingRate(false);
  };

  const handleCancel = () => {
    setTempRate(payoutRate);
    setIsEditingRate(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    const exportData = filteredPayouts.map(payout => ({
      author: payout.author,
      articles: payout.articles,
      rate: payoutRate,
      type: payout.type,
      payout: payout.payout,
      lastArticleDate: new Date(
        Math.max(...payout.publishedAt.map(date => new Date(date).getTime()))
      ).toLocaleDateString()
    }));
  
    if (type === 'csv') {
      exportToCSV(exportData);  
    } else {
      exportToPDF(exportData);  
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          <p className="text-muted-foreground dark:text-gray-400">Loading payout data...</p>
        </div>
      </div>
    );
  }

  const filteredPayouts = getFilteredPayouts();
  const totalPages = Math.ceil(filteredPayouts.length / rowsPerPage);
  const currentPayouts = filteredPayouts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPayout = filteredPayouts.reduce((sum, payout) => sum + payout.payout, 0);

  return (
    <div className="space-y-4 sm:space-y-6">

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {error.source === 'news' ? 'News API Error' : 'Blog API Error'}
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="ml-2 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <TrendingUp className="mr-2 sm:mr-3 text-primary dark:text-blue-400" />
            Author Payouts
          </h2>
          <p className="text-sm text-muted-foreground dark:text-gray-400 sm:ml-10">
            Total: <span className="font-semibold text-primary dark:text-blue-400">₹{totalPayout.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-700">
              <DropdownMenuItem 
                onClick={() => handleExport('csv')}
                className="dark:hover:bg-gray-800 dark:text-gray-100"
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')}
                className="dark:hover:bg-gray-800 dark:text-gray-100"
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground dark:text-gray-400 whitespace-nowrap">Rate:</span>
            {isEditingRate ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="number"
                  min="1"
                  value={tempRate}
                  onChange={(e) => setTempRate(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  autoFocus
                />
                <Button 
                  onClick={handleSave}
                  size="sm"
                  className="px-3 dark:bg-blue-800 dark:text-gray-100 dark:hover:bg-blue-700"
                  disabled={tempRate <= 0}
                >
                  Save
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="px-3 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary dark:text-blue-400">₹{payoutRate}</span>
                <button 
                  onClick={handleStartEditing}
                  className="p-1 hover:bg-accent dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <PenLine className="w-4 text-muted-foreground dark:text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

     
      <Card className="w-full dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-0 sm:p-6">
          <PayoutLineChart data={filteredPayouts} />
        </CardContent>
      </Card>

     
      <div className="rounded-lg border shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800">
        <ScrollArea className="h-[350px] sm:h-[420px]">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <TableRow className="dark:border-gray-700">
                <TableHead className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">Author</TableHead>
                <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">Articles</TableHead>
                <TableHead className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPayouts.map((payout) => (
                <TableRow key={payout.author} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                    {payout.author}
                  </TableCell>
                  <TableCell className="text-center text-gray-600 dark:text-gray-300">{payout.articles}</TableCell>
                  <TableCell className="text-right font-medium text-primary dark:text-blue-400">
                    ₹{payout.payout.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {currentPayouts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground dark:text-gray-400">
                    {errors.length > 0 
                      ? "Some data couldn't be loaded. Please try again or adjust your filters."
                      : "No payout data found matching your filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {filteredPayouts.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-2 px-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 text-sm dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 text-sm dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}