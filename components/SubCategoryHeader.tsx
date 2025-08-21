import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SubCategory } from '../types';

interface SubCategoryHeaderProps {
  subCategory: SubCategory;
  isVisible: boolean;
}

const SubCategoryHeader: React.FC<SubCategoryHeaderProps> = ({ subCategory, isVisible }) => {
  return (
    <View style={[
      styles.subCategoryHeader,
      isVisible && styles.visibleSubCategoryHeader
    ]}>
      <Text style={[
        styles.subCategoryTitle,
        isVisible && styles.visibleSubCategoryTitle
      ]}>
        {subCategory.name}
      </Text>
      <Text style={[
        styles.subCategoryCount,
        isVisible && styles.visibleSubCategoryCount
      ]}>
        {subCategory.items?.length || 0} items
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  subCategoryHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subCategoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subCategoryCount: {
    fontSize: 14,
    color: '#666',
  },
  visibleSubCategoryHeader: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  visibleSubCategoryTitle: {
    color: '#FF6B35',
  },
  visibleSubCategoryCount: {
    color: '#FF6B35',
  },
});

export default SubCategoryHeader;
