import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PayoutChartProps {
  data: {
    author: string;
    payout: number;
    articles: number;
    type: 'news' | 'blog';
  }[];
}

export const PayoutLineChart: React.FC<PayoutChartProps> = ({ data }) => {

  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.payout - a.payout)
      .slice(0, 10);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 50, bottom: 60 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#e0e0e0" 
          className="dark:stroke-gray-700"
        />
        <XAxis 
          dataKey="author" 
          angle={-45} 
          textAnchor="end" 
          interval={0} 
          height={100} 
          tick={{ fontSize: 10, fill: '#666' }} 
          className="dark:fill-gray-400"
        />
        <YAxis 
          label={{  
            angle: -90, 
            position: 'insideLeft', 
            offset: -10 
          }} 
          tick={{ fill: '#666' }}
          className="dark:fill-gray-400"
        />
        <Tooltip 
          formatter={(value, name, props) => [`₹${value.toLocaleString()}`, 'Payout']}
          labelFormatter={(label) => `Author: ${label}`}
          contentStyle={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            color: 'white',
            borderRadius: '0.5rem'
          }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="top" 
          align="center" 
          iconType="circle"
          wrapperStyle={{ color: '#666' }}
          className="dark:text-gray-300"
        />
        <Line 
          type="monotone" 
          dataKey="payout" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          name="Total Payout"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};