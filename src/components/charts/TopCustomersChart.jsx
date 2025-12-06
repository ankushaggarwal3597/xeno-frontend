import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

const TopCustomersChart = ({ data }) => {
  const formattedData = data.map((customer, index) => ({
    name: `${customer.first_name} ${customer.last_name}`,
    spent: parseFloat(customer.total_spent),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Bar dataKey="spent">
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopCustomersChart;