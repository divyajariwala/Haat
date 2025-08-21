import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SubCategory } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_STYLES } from '../constants';

interface SubCategoryTabsProps {
  subCategories: SubCategory[];
  selectedSubCategory: SubCategory | null;
  visibleSubCategory: SubCategory | null;
  onSubCategoryPress: (subCategory: SubCategory) => void;
}

const SubCategoryTabs: React.FC<SubCategoryTabsProps> = ({
  subCategories,
  selectedSubCategory,
  visibleSubCategory,
  onSubCategoryPress,
}) => {
  if (subCategories.length === 0) return null;

  const orderedSubCategories = selectedSubCategory
    ? [selectedSubCategory, ...subCategories.filter(sub => sub.id !== selectedSubCategory.id)]
    : subCategories;

  return (
    <View style={styles.subCategoryTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subCategoryTabsContent}
      >
        {orderedSubCategories.map((subCategory) => (
          <TouchableOpacity
            key={subCategory.id}
            style={[
              styles.subCategoryTab,
              visibleSubCategory?.id === subCategory.id && styles.subCategoryTabActive
            ]}
            onPress={() => onSubCategoryPress(subCategory)}
          >
            <Text style={[
              styles.subCategoryTabText,
              visibleSubCategory?.id === subCategory.id && styles.subCategoryTabTextActive
            ]}>
              {subCategory.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  subCategoryTabsContainer: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY.MEDIUM,
  },
  subCategoryTabsContent: {
    paddingHorizontal: SPACING.LG,
  },
  subCategoryTab: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    marginRight: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.GRAY.LIGHT,
    marginVertical: SPACING.MD,
  },
  subCategoryTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  subCategoryTabText: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.GRAY.DARK,
  },
  subCategoryTabTextActive: {
    color: COLORS.WHITE,
  },
});

export default SubCategoryTabs;
