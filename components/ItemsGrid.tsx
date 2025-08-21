import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Item } from '../types';
import ItemCard from './ItemCard';

interface ItemsGridProps {
  items: Item[];
}

const ItemsGrid: React.FC<ItemsGridProps> = ({ items }) => {
  return (
    <View style={styles.itemsGridContainer}>
      <View style={styles.itemsGrid}>
        {items.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemsGridContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ItemsGrid;
