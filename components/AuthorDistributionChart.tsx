import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import _ from 'lodash';

interface Article {
  author: string;
  type: 'news' | 'blog';
}

interface ChartProps {
  articles: Article[];
}

const COLORS = [
  '#8b5cf6',
  '#3b82f6', 
  '#06b6d4',
  '#10b981', 
  '#84cc16', 
  '#eab308', 
  '#f97316', 
  '#ef4444', 
  '#ec4899', 
  '#6366f1', 
];

const AuthorDistributionChart = ({ articles = [] }: ChartProps) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const chartData = useMemo(() => {
    const authorCounts = _.groupBy(articles, 'author');
    
    return Object.entries(authorCounts)
      .filter(([author]) => author && author !== 'null' && author !== 'undefined')
      .map(([author, authorArticles]) => ({
        name: author,
        value: authorArticles.length
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); 
  }, [articles]);

  const totalArticles = chartData.reduce((sum, item) => sum + item.value, 0);


  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <ScrollArea className={`w-full ${isMobile ? 'h-40' : 'h-48'}`}>
        <div className="grid gap-2 text-sm pr-4">
          {payload.map((entry: any, index: number) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate font-medium" title={entry.value}>
                {entry.value}
              </span>
              <span className="text-muted-foreground ml-auto">
                {chartData[index].value} articles
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
      <CardTitle className="text-sm text-gray-600 dark:text-gray-300">
          Top Authors Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
          <div className={`w-full ${isMobile ? 'h-64' : 'h-72'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 60 : 80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="opacity-100 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value} articles (${((value / totalArticles) * 100).toFixed(1)}%)`,
                    'Count'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

    
          <div className="w-full">
            <CustomLegend
              payload={chartData.map((entry, index) => ({
                value: entry.name,
                color: COLORS[index % COLORS.length],
                type: 'circle'
              }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorDistributionChart;