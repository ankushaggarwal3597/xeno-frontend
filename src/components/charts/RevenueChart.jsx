import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const RevenueChart = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `$${value.toFixed(2)}`}
          labelStyle={{ color: '#000' }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#0284c7" 
          strokeWidth={2}
          dot={{ fill: '#0284c7' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;