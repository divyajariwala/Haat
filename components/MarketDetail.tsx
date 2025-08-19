import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { MarketDetail as MarketDetailType, Category, SubCategory, Item } from '../types';
import { getImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

interface MarketDetailProps {
  market: MarketDetailType;
  selectedCategoryId?: number;
  onBack: () => void;
}

const MarketDetail: React.FC<MarketDetailProps> = ({ market, selectedCategoryId, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);
  const categoryRefs = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    if (selectedCategoryId && market.categories.length > 0) {
      const category = market.categories.find(cat => cat.id === selectedCategoryId);
      if (category) {
        setSelectedCategory(category);
        // Scroll to the selected category
        setTimeout(() => {
          if (categoryRefs.current[category.id] !== undefined) {
            flatListRef.current?.scrollToIndex({
              index: categoryRefs.current[category.id],
              animated: true,
            });
          }
        }, 100);
      }
    } else if (market.categories.length > 0) {
      setSelectedCategory(market.categories[0]);
    }
  }, [selectedCategoryId, market]);

  // Flatten all items with their category and subcategory info for the FlatList
  const getFlatListData = () => {
    const data: Array<{
      type: 'category' | 'subcategory' | 'item';
      id: string;
      category: Category;
      subCategory?: SubCategory;
      item?: Item;
      index: number;
    }> = [];

    let globalIndex = 0;
    market.categories.forEach((category) => {
      // Add category header
      data.push({
        type: 'category',
        id: `category-${category.id}`,
        category,
        index: globalIndex,
      });
      categoryRefs.current[category.id] = globalIndex;
      globalIndex++;

      if (category.subCategories) {
        category.subCategories.forEach((subCategory) => {
          // Add subcategory header
          data.push({
            type: 'subcategory',
            id: `subcategory-${subCategory.id}`,
            category,
            subCategory,
            index: globalIndex,
          });
          globalIndex++;

          if (subCategory.items) {
            subCategory.items.forEach((item) => {
              // Add item
              data.push({
                type: 'item',
                id: `item-${item.id}`,
                category,
                subCategory,
                item,
                index: globalIndex,
              });
              globalIndex++;
            });
          }
        });
      }
    });

    return data;
  };

  const renderCategoryHeader = (category: Category) => (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
    </View>
  );

  const renderSubCategoryHeader = (subCategory: SubCategory) => (
    <View style={styles.subCategoryHeader}>
      <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
    </View>
  );

  const renderItem = (item: Item) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Text style={styles.itemPlaceholderText}>🍽️</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderFlatListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'category':
        return renderCategoryHeader(item.category);
      case 'subcategory':
        return renderSubCategoryHeader(item.subCategory);
      case 'item':
        return renderItem(item.item);
      default:
        return null;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const handleScrollBeginDrag = () => {
    // Handle scroll begin if needed
  };

  const handleScrollEndDrag = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Find which category we're currently viewing based on scroll position
    const data = getFlatListData();
    let currentCategoryIndex = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'category') {
        if (i === data.length - 1 || offsetY < (i + 1) * 100) {
          currentCategoryIndex = i;
          break;
        }
      }
    }
    
    if (data[currentCategoryIndex] && data[currentCategoryIndex].category) {
      setSelectedCategory(data[currentCategoryIndex].category);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.marketTitle}>{market.name}</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {market.categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory?.id === category.id && styles.categoryTabActive,
            ]}
            onPress={() => {
              setSelectedCategory(category);
              if (categoryRefs.current[category.id] !== undefined) {
                flatListRef.current?.scrollToIndex({
                  index: categoryRefs.current[category.id],
                  animated: true,
                });
              }
            }}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory?.id === category.id && styles.categoryTabTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <FlatList
        ref={flatListRef}
        data={getFlatListData()}
        renderItem={renderFlatListItem}
        keyExtractor={(item) => item.id}
        style={styles.contentList}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={getFlatListData()
          .map((item, index) => item.type === 'subcategory' ? index : -1)
          .filter(index => index !== -1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  marketTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  categoryTabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  contentList: {
    flex: 1,
  },
  categoryHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subCategoryHeader: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  subCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemPlaceholderText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

export default MarketDetail; 