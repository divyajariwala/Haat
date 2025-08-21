import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Category } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_STYLES } from '../constants';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: Category | null;
  visibleCategory: Category | null;
  onCategoryPress: (category: Category) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  visibleCategory,
  onCategoryPress,
}) => {
  const orderedCategories = selectedCategory
    ? [selectedCategory, ...categories.filter(cat => cat.id !== selectedCategory.id)]
    : categories;

  return (
    <View style={styles.categoryTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {orderedCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              visibleCategory?.id === category.id && styles.categoryTabActive
            ]}
            onPress={() => onCategoryPress(category)}
          >
            <Text style={[
              styles.categoryTabText,
              visibleCategory?.id === category.id && styles.categoryTabTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryTabsContainer: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY.MEDIUM,
  },
  categoryTabsContent: {
    paddingHorizontal: SPACING.LG,
  },
  categoryTab: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    marginRight: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.GRAY.LIGHT,
    marginVertical: SPACING.LG,
  },
  categoryTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryTabText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.GRAY.DARK,
  },
  categoryTabTextActive: {
    color: COLORS.WHITE,
  },
});

export default CategoryTabs;
