import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Item } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { GRID_CONFIG, ITEM_CARD, COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_STYLES } from '../constants';

const { width } = Dimensions.get('window');
const ITEM_CARD_WIDTH = (width - (GRID_CONFIG.MARGIN * 2) - (GRID_CONFIG.SPACING * (GRID_CONFIG.COLUMNS - 1))) / GRID_CONFIG.COLUMNS;

interface ItemCardProps {
  item: Item;
  index: number;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, index }) => {
  return (
    <TouchableOpacity
                  style={[
              styles.itemCard,
              {
                width: ITEM_CARD_WIDTH,
                marginRight: (index + 1) % GRID_CONFIG.COLUMNS === 0 ? 0 : GRID_CONFIG.SPACING,
                marginBottom: GRID_CONFIG.SPACING,
              }
            ]}
      activeOpacity={0.8}
    >
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <ImageWithFallback imagePath={item.image} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🍽️</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    ...SHADOW_STYLES.MEDIUM,
    overflow: 'hidden',
    minHeight: ITEM_CARD.MIN_HEIGHT,
  },
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: ITEM_CARD.IMAGE_HEIGHT,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.GRAY.LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZE.XXXL,
  },
  itemInfo: {
    padding: SPACING.LG,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: ITEM_CARD.INFO_MIN_HEIGHT,
  },
  itemName: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.GRAY.DARKER,
    marginBottom: SPACING.MD,
    lineHeight: SPACING.XL,
    minHeight: ITEM_CARD.NAME_MIN_HEIGHT,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.LG,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    flex: 1,
    marginRight: SPACING.MD,
    minHeight: ITEM_CARD.BUTTON_MIN_HEIGHT,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    textAlign: 'center',
  },
});

export default ItemCard;
