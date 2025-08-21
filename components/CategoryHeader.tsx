import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '../types';

interface CategoryHeaderProps {
  category: Category;
  isVisible: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, isVisible }) => {
  // Calculate total items for this category
  const totalItems = category.subCategories?.reduce((total, sub) => {
    return total + (sub.items?.length || 0);
  }, 0) || 0;

  return (
    <View style={[
      styles.categoryHeader,
      isVisible && styles.visibleCategoryHeader
    ]}>
      <LinearGradient
        colors={isVisible
          ? ['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.08)']
          : ['rgba(255,107,53,0.1)', 'rgba(255,107,53,0.05)']
        }
        style={styles.categoryHeaderGradient}
      >
        <Text style={[
          styles.categoryHeaderTitle,
          isVisible && styles.visibleCategoryHeaderTitle
        ]}>
          {category.name}
        </Text>
        <Text style={[
          styles.categoryHeaderSubtitle,
          isVisible && styles.visibleCategoryHeaderSubtitle
        ]}>
          {category.subCategories?.length || 0} subcategories • {totalItems} items
        </Text>
        {isVisible && (
          <View style={styles.visibleIndicator}>
            <Text style={styles.visibleIndicatorText}>👁️ Visible</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeaderGradient: {
    padding: 20,
    alignItems: 'center',
  },
  categoryHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryHeaderSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  visibleCategoryHeader: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  visibleCategoryHeaderTitle: {
    color: '#FF6B35',
  },
  visibleCategoryHeaderSubtitle: {
    color: '#FF6B35',
  },
  visibleIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visibleIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CategoryHeader;
