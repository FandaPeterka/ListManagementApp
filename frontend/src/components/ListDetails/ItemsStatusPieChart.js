/**
 * `ItemsStatusPieChart`:
 * - Displays a pie chart summarizing the status of items (resolved vs unresolved) in the current list.
 * - Dynamically updates data and colors based on the current list and theme changes.
 * - Integrates with `DetailsContext` to access item data and `i18next` for translations.
 * - Reactively adjusts chart colors using CSS variables (`--primary-color`, `--secondary-color`) to match the current theme.
 * - Uses `recharts` for a responsive and visually appealing pie chart visualization.
 * - Automatically updates when the list data or theme changes, ensuring accurate and dynamic presentation.
 */

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDetails } from '@/context/DetailsContext';
import { useTranslation } from 'react-i18next';

const ItemsStatusPieChart = () => {
  const { listData } = useDetails();
  const { t } = useTranslation();
  const [chartData, setChartData] = useState([]);
  const [colors, setColors] = useState({
    primary: '#4a90d9',
    secondary: '#6bb3d6'
  });

  useEffect(() => {
    const updateColors = () => {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4a90d9';
      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#6bb3d6';
      setColors({ primary: primaryColor, secondary: secondaryColor });
    };

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    updateColors();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (listData?.items) {
      const resolvedCount = listData.items.filter(item => item.isResolved).length;
      const unresolvedCount = listData.items.length - resolvedCount;

      setChartData([
        { name: t('resolved'), value: resolvedCount },
        { name: t('unresolved'), value: unresolvedCount },
      ]);
    }
  }, [listData, t]);

  return (
    <div className="items-status-pie-chart-container">
      <h3 className="pie-chart-title">{t('items_status')}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            innerRadius={70}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? colors.primary : colors.secondary} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} ${t('items')}`} />
          <Legend align="center" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ItemsStatusPieChart;