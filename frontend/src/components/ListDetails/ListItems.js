'use client';

/**
 * `ListItems`:
 * - Renders a list of items belonging to a specific list.
 * - Provides functionality to filter items based on their resolved status.
 * - Displays individual items and integrates with the `AddItemForm` for adding new items.
 * - Uses `DetailsContext` to access and manage list items, ensuring seamless integration with the backend.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDetails } from '@/context/DetailsContext';
import Item from './Item';
import AddItemForm from './AddItemForm';

const ListItems = ({ filterResolved, toggleFilter }) => {
  const { t } = useTranslation();
  const { listData, onToggleItemResolved } = useDetails();

  const filteredItems = filterResolved
    ? listData.items.filter((item) => !item.isResolved)
    : listData.items;

  return (
    <div className="box">
      <div className="list-items-header">
        <h2>{t('items')}</h2>
        <button onClick={toggleFilter} className="toggle-filter-button">
          {filterResolved ? t('show_all') : t('filter_resolved')}
        </button>
      </div>
      <ul className="list-items-list">
        {filteredItems.map((item, index) => (
          <Item
            key={item._id}
            itemId={item._id}
            itemText={item.itemText}
            isResolved={item.isResolved}
            index={index} 
          />
        ))}
      </ul>
      <AddItemForm />
    </div>
  );
};

export default ListItems;