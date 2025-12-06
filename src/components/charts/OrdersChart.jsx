import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const OrdersChart = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip labelStyle={{ color: '#000' }} />
        <Bar dataKey="count" fill="#0284c7" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrdersChart;