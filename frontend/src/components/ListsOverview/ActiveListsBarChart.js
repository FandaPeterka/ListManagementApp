'use client';

/**
 * `ActiveListsBarChart`:
 * - Visualizes the count of items in active lists using a bar chart.
 * - Dynamically updates with `ListContext` data and adapts to theme colors.
 */

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useList } from '@/context/ListContext';

const ActiveListsBarChart = () => {
  const { t } = useTranslation();
  const { itemCounts } = useList();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (itemCounts && itemCounts.length > 0) {
      setChartData(itemCounts);
    }
  }, [itemCounts]);

  if (!chartData || chartData.length === 0) return <p>{t('no_item_counts_available')}</p>;

  return (
    <div className="active-lists-bar-chart-container">
      <h3 className="bar-chart-title">{t('active_lists_item_counts')}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="title" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} ${t('items')}`, t('item_count')]} />
          <Bar dataKey="itemCount" fill="var(--primary-color)" name={t('item_count')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActiveListsBarChart;