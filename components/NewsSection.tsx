import { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CalendarDays, 
  User, 
  BookOpen, 
  Newspaper, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';
import AuthorDistributionChart from './AuthorDistributionChart';
import { useFilters } from '@/components/contexts/FilterContext';
import { Button } from '@/components/ui/button';

interface NewsArticle {
  title: string;
  author: string;
  publishedAt: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  type: 'news' | 'blog';
}

interface DevToArticle {
  title: string;
  user: {
    name: string;
  };
  published_at: string;
  description: string;
  url: string;
}

interface ApiError {
  source: 'news' | 'blog';
  message: string;
}

export default function NewsSection() {
  const { filters } = useFilters();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const articlesPerPage = 5;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setErrors([]);
      const newErrors: ApiError[] = [];

      try {
        // Fetch news articles from Currents API
        let newsArticles: NewsArticle[] = [];
        try {
          const newsResponse = await axios.get(
            `https://api.currentsapi.services/v1/search?keywords=technology&language=en&apiKey=${process.env.NEXT_PUBLIC_CURRENTS_API_KEY}`,
            { timeout: 8000 }
          );
          newsArticles = newsResponse.data.news.map((article: any) => ({
            title: article.title,
            author: article.author || 'Unknown',
            publishedAt: article.publishedAt,
            description: article.description || '',
            url: article.url,
            source: { name: article.source || 'Currents API' },
            type: 'news'
          }));
        } catch (error) {
          let message = 'Failed to fetch news';
          if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
              message = 'News API request timed out';
            } else if (error.response?.status === 429) {
              message = 'API rate limit exceeded';
            } else if (error.response?.status === 401) {
              message = 'Invalid API key';
            }
          }
          newErrors.push({ source: 'news', message });
        }

        // Fetch blog articles from Dev.to
        let blogArticles: NewsArticle[] = [];
        try {
          const devToResponse = await axios.get(
            'https://dev.to/api/articles?per_page=30',
            { timeout: 8000 }
          );
          blogArticles = devToResponse.data.map((article: DevToArticle) => ({
            title: article.title,
            author: article.user.name,
            publishedAt: article.published_at,
            description: article.description || '',
            url: article.url,
            source: { name: 'dev.to' },
            type: 'blog'
          }));
        } catch (error) {
          newErrors.push({
            source: 'blog',
            message: 'Failed to fetch blog posts'
          });
        }

        // Combine articles
        setArticles([...newsArticles, ...blogArticles]);
        setErrors(newErrors);
      } catch (error) {
        console.error('Error in fetchContent:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [retryCount]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getFilteredArticles = () => {
    let filtered = [...articles];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        (article.author && article.author.toLowerCase().includes(searchLower))
      );
    }

    if (filters.author) {
      filtered = filtered.filter(article => 
        article.author && article.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(article => article.type === filters.type);
    }

    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishedAt);
        const fromDate = filters.dateRange.from;
        const toDate = filters.dateRange.to;

        if (fromDate && toDate) {
          return articleDate >= fromDate && articleDate <= toDate;
        } else if (fromDate) {
          return articleDate >= fromDate;
        } else if (toDate) {
          return articleDate <= toDate;
        }
        return true;
      });
    }

    return filtered;
  };

  const getStats = () => {
    const filteredArticles = getFilteredArticles();
    return {
      totalArticles: filteredArticles.length,
      newsCount: filteredArticles.filter(article => article.type === 'news').length,
      blogCount: filteredArticles.filter(article => article.type === 'blog').length
    };
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          <p className="text-muted-foreground dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredArticles = getFilteredArticles();
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage, 
    currentPage * articlesPerPage
  );
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="px-4 sm:px-6 space-y-2">
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

      <div className="p-4 sm:p-6 border-b dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalArticles}
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total Articles</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.newsCount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">News</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.blogCount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Blogs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <AuthorDistributionChart articles={filteredArticles} />
      </div>

      <div className="px-4 sm:px-6">
        <ScrollArea className="h-[500px] sm:h-[600px]">
          <div className="space-y-4 pr-4">
            {currentArticles.map((article: NewsArticle, index: number) => (
              <a 
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 sm:p-6 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold mb-2 text-base sm:text-lg leading-tight text-gray-900 dark:text-gray-100">
                    {article.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-sm mt-auto">
                  {article.author && (
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{article.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{article.source.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`ml-auto ${
                      article.type === 'blog'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                    }`}
                  >
                    {article.type}
                  </Badge>
                </div>
              </a>
            ))}
            
            {filteredArticles.length === 0 && (
              <div className="flex items-center justify-center h-32 text-center p-4">
                <p className="text-muted-foreground dark:text-gray-400">
                  {errors.length > 0 
                    ? "Some content couldn't be loaded. Please try again or adjust your filters."
                    : "No articles found matching your filters."}
                </p>
              </div>
            )}
          </div>
      
          {filteredArticles.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t dark:border-gray-800">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 sm:h-9 px-2 sm:px-4 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground dark:text-gray-400 px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 sm:h-9 px-2 sm:px-4 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}