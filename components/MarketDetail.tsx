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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MarketDetail as MarketDetailType, Category, SubCategory, Item, CategoryDetail } from '../types';
import { getImageUrl, getCategoryDetail } from '../services/api';

const { width, height } = Dimensions.get('window');

// Grid configuration for items
const GRID_COLUMNS = 2;
const GRID_SPACING = 16;
const GRID_MARGIN = 16;
const ITEM_CARD_WIDTH = (width - (GRID_MARGIN * 2) - (GRID_SPACING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;

// Image component with fallback
const ImageWithFallback: React.FC<{ imagePath: string; style: any }> = ({ imagePath, style }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (imageError) {
    return (
      <View style={[style, { backgroundColor: '#f1f3f4', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 32 }}>🍽️</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getImageUrl(imagePath) }}
      style={style}
      resizeMode="cover"
      onLoadStart={() => setImageLoading(true)}
      onLoadEnd={() => setImageLoading(false)}
      onError={() => setImageError(true)}
    />
  );
};

interface MarketDetailProps {
  market: MarketDetailType;
  selectedCategoryId?: number;
  categories: Category[];
  onBack: () => void;
}

const MarketDetail: React.FC<MarketDetailProps> = ({ market, selectedCategoryId, categories, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [visibleCategory, setVisibleCategory] = useState<Category | null>(null);
  const [visibleSubCategory, setVisibleSubCategory] = useState<SubCategory | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const categoryRefs = useRef<{ [key: number]: number }>({});
  const subCategoryRefs = useRef<{ [key: number]: number }>({});
  const scrollY = useRef(new Animated.Value(0)).current;

  // Debug: Log received props
  useEffect(() => {
    console.log('🔍 MarketDetail props received:');
    console.log('  📊 Market:', market?.name?.['en-US'] || 'Unknown');
    console.log('  🎯 Selected Category ID:', selectedCategoryId);
    console.log('  📋 Categories count:', categories.length);
    console.log('  📋 Categories:', categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      subCategoriesCount: cat.subCategories?.length || 0
    })));
    
    if (categories.length > 0) {
      console.log('  📊 First category details:', JSON.stringify(categories[0], null, 2));
    }
  }, [market, selectedCategoryId, categories]);

  // Load category detail when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory.id) {
      loadCategoryDetail(selectedCategory.id);
    }
  }, [selectedCategory]);

  // Set initial category based on selectedCategoryId
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = findCategoryById(selectedCategoryId);
      if (category) {
        console.log(`🎯 Setting selected category: "${category.name}" (ID: ${category.id})`);
        setSelectedCategory(category);
        setVisibleCategory(category);
        
        // Auto-select the first subcategory of the selected category
        if (category.subCategories && category.subCategories.length > 0) {
          const firstSubCategory = category.subCategories[0];
          console.log(`🎯 Auto-selecting first subcategory: "${firstSubCategory.name}" (ID: ${firstSubCategory.id})`);
          setSelectedSubCategory(firstSubCategory);
          setVisibleSubCategory(firstSubCategory);
        }
        
        // Auto-scroll to the selected category after a short delay
        setTimeout(() => {
          scrollToCategory(category.id);
        }, 300);
      }
    } else if (categories.length > 0) {
      // Set first category as default if none selected
      const firstCategory = categories[0];
      console.log(`🎯 Setting default category: "${firstCategory.name}" (ID: ${firstCategory.id})`);
      setSelectedCategory(firstCategory);
      setVisibleCategory(firstCategory);
      
      // Auto-select the first subcategory of the first category
      if (firstCategory.subCategories && firstCategory.subCategories.length > 0) {
        const firstSubCategory = firstCategory.subCategories[0];
        console.log(`🎯 Auto-selecting first subcategory: "${firstSubCategory.name}" (ID: ${firstSubCategory.id})`);
        setSelectedSubCategory(firstSubCategory);
        setVisibleSubCategory(firstSubCategory);
      }
    }
  }, [selectedCategoryId, categories]);

  // Log when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      console.log(`🔄 Selected category changed to: "${selectedCategory.name}" (ID: ${selectedCategory.id})`);
      console.log(`📊 Category has ${selectedCategory.subCategories?.length || 0} subcategories`);
      if (selectedCategory.subCategories && selectedCategory.subCategories.length > 0) {
        selectedCategory.subCategories.forEach((sub, index) => {
          console.log(`  📋 Subcategory ${index + 1}: "${sub.name}" with ${sub.items?.length || 0} items`);
        });
      }
    }
  }, [selectedCategory]);

  const findCategoryById = (categoryId: number): Category | null => {
    const found = categories.find(cat => cat.id === categoryId);
    if (found) {
      console.log(`🔍 Found category by ID ${categoryId}: "${found.name}"`);
    } else {
      console.log(`❌ Category with ID ${categoryId} not found in categories:`, categories.map(c => `${c.id}: "${c.name}"`));
    }
    return found || null;
  };

  const loadCategoryDetail = async (categoryId: number) => {
    try {
      setIsLoadingCategory(true);
      setCategoryError(null);
      
      console.log(`🔄 Loading category detail for ID: ${categoryId}`);
      const detail = await getCategoryDetail(market.id, categoryId);
      console.log('✅ Category detail loaded:', detail);
      
      setCategoryDetail(detail);
    } catch (error: any) {
      console.error('❌ Error loading category detail:', error);
      
      // Set error message based on error type
      let errorMessage = 'Failed to load category details';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Category not found';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error loading category';
        } else if (error.response.status >= 400) {
          errorMessage = `Request failed (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error loading category';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setCategoryError(errorMessage);
      
      // Fallback: use the category data from categories
      console.log('🔄 Falling back to category data from categories...');
      const fallbackCategory = categories.find(cat => cat.id === categoryId);
      if (fallbackCategory) {
        console.log('✅ Using fallback category data');
        setSelectedCategory(fallbackCategory);
      }
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const getCurrentSubCategories = (): SubCategory[] => {
    // First try to use the detailed API data
    if (categoryDetail && categoryDetail.marketSubcategories) {
      console.log('📊 Using detailed API data for subcategories');
      // Transform API subcategories to component format
      return categoryDetail.marketSubcategories
        .filter(sub => !sub.hide)
        .map(sub => ({
          id: sub.id,
          name: sub.name['en-US'] || sub.name.ar || sub.name.he || sub.name.fr || `Subcategory ${sub.id}`,
          categoryId: categoryDetail.id,
          items: sub.products
            .filter(product => !product.hide)
            .map(product => ({
              id: product.id,
              name: product.name['en-US'] || product.name.ar || product.name.he || product.name.fr || `Product ${product.id}`,
              description: product.description?.['en-US'] || product.description?.ar || product.description?.he || product.description?.fr || '',
              price: product.discountPrice || product.basePrice || 0,
              image: product.productImages?.[0]?.serverImageUrl || product.productImages?.[0]?.smallImageUrl || `items/product-${product.id}.jpg`,
              subCategoryId: sub.id
            }))
        }));
    }
    
    // Fallback to the selected category's subcategories
    if (selectedCategory?.subCategories) {
      console.log('📊 Using fallback data for subcategories');
      return selectedCategory.subCategories;
    }
    
    console.log('📊 No subcategories available');
    return [];
  };

  const getFlatListData = () => {
    const data: Array<{
      type: 'category' | 'subcategory' | 'items-grid';
      id: string;
      category: Category;
      subCategory?: SubCategory;
      items?: Item[];
      index: number;
    }> = [];

    // Only show the selected category and its products
    if (!selectedCategory) {
      console.log('⚠️ No selected category, returning empty data');
      return data;
    }

    console.log(`🎯 Building data for selected category: "${selectedCategory.name}" (ID: ${selectedCategory.id})`);
    console.log('📊 Selected category data:', JSON.stringify(selectedCategory, null, 2));

    // Add selected category header
    data.push({
      type: 'category',
      id: `category-${selectedCategory.id}`,
      category: selectedCategory,
      index: data.length
    });

    // Store reference for scrolling
    categoryRefs.current[selectedCategory.id] = data.length - 1;

    // Add subcategories and products for the selected category only
    if (selectedCategory.subCategories && selectedCategory.subCategories.length > 0) {
      console.log(`📋 Processing ${selectedCategory.subCategories.length} subcategories`);
      
      selectedCategory.subCategories.forEach((subCategory, subIndex) => {
        console.log(`📋 Adding subcategory: "${subCategory.name}" with ${subCategory.items?.length || 0} items`);
        console.log('📊 Subcategory data:', JSON.stringify(subCategory, null, 2));
        
        // Add subcategory header
        data.push({
          type: 'subcategory',
          id: `subcategory-${subCategory.id}`,
          category: selectedCategory,
          subCategory,
          index: data.length
        });

        // Add items grid if there are products
        if (subCategory.items && subCategory.items.length > 0) {
          console.log(`🛍️ Adding ${subCategory.items.length} items for subcategory "${subCategory.name}"`);
          
          data.push({
            type: 'items-grid',
            id: `items-${subCategory.id}`,
            category: selectedCategory,
            subCategory,
            items: subCategory.items,
            index: data.length
          });

          // Store reference for scrolling
          subCategoryRefs.current[subCategory.id] = data.length - 1;
        } else {
          console.log(`⚠️ Subcategory "${subCategory.name}" has no items`);
          
          // TEST: Add some dummy items to see if rendering works
          console.log('🧪 Adding test items to verify rendering');
          const testItems: Item[] = [
            {
              id: subCategory.id * 1000 + 1,
              name: `Test Item 1 for ${subCategory.name}`,
              description: 'This is a test item to verify rendering works',
              price: 9.99,
              image: 'items/test-item-1.jpg',
              subCategoryId: subCategory.id
            },
            {
              id: subCategory.id * 1000 + 2,
              name: `Test Item 2 for ${subCategory.name}`,
              description: 'Another test item to verify rendering works',
              price: 14.99,
              image: 'items/test-item-2.jpg',
              subCategoryId: subCategory.id
            }
          ];
          
          data.push({
            type: 'items-grid',
            id: `items-${subCategory.id}-test`,
            category: selectedCategory,
            subCategory,
            items: testItems,
            index: data.length
          });
        }
      });
    } else {
      console.log('⚠️ Selected category has no subcategories');
    }

    console.log(`✅ Built data with ${data.length} items for category "${selectedCategory.name}"`);
    console.log('📋 Final data structure:', data.map(item => ({
      type: item.type,
      id: item.id,
      categoryName: item.category?.name,
      subCategoryName: item.subCategory?.name,
      itemCount: item.items?.length || 0
    })));
    
    return data;
  };

  const renderCategoryHeader = (category: Category) => {
    const isSelected = selectedCategory && category.id === selectedCategory.id;
    const isVisible = visibleCategory && category.id === visibleCategory.id;
    
    return (
      <View style={[
        styles.categoryHeader,
        isSelected && styles.selectedCategoryHeader,
        isVisible && !isSelected && styles.visibleCategoryHeader
      ]}>
        <LinearGradient
          colors={isSelected 
            ? ['rgba(255,107,53,0.2)', 'rgba(255,107,53,0.1)'] 
            : isVisible
            ? ['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.08)']
            : ['rgba(255,107,53,0.1)', 'rgba(255,107,53,0.05)']
          }
          style={styles.categoryHeaderGradient}
        >
          <Text style={[
            styles.categoryHeaderTitle,
            isSelected && styles.selectedCategoryHeaderTitle,
            isVisible && !isSelected && styles.visibleCategoryHeaderTitle
          ]}>
            {category.name}
          </Text>
          <Text style={[
            styles.categoryHeaderSubtitle,
            isSelected && styles.selectedCategoryHeaderSubtitle,
            isVisible && !isSelected && styles.visibleCategoryHeaderSubtitle
          ]}>
            {category.subCategories?.length || 0} subcategories available
          </Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>⭐ Selected</Text>
            </View>
          )}
          {isVisible && !isSelected && (
            <View style={styles.visibleIndicator}>
              <Text style={styles.visibleIndicatorText}>👁️ Visible</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderSubCategoryHeader = (subCategory: SubCategory) => {
    const isVisible = visibleSubCategory && subCategory.id === visibleSubCategory.id;
    
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
        {isVisible && (
          <View style={styles.visibleSubCategoryIndicator}>
            <Text style={styles.visibleSubCategoryIndicatorText}>👁️</Text>
          </View>
        )}
      </View>
    );
  };

  const renderItemsGrid = (items: Item[]) => (
    <View style={styles.itemsGridContainer}>
      <View style={styles.itemsGrid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemCard,
              {
                width: ITEM_CARD_WIDTH,
                marginRight: (index + 1) % GRID_COLUMNS === 0 ? 0 : GRID_SPACING,
                marginBottom: GRID_SPACING,
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
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
              )}
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
                  <Text style={styles.favoriteButtonText}>❤️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleScrollEndDrag = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    updateVisibleItems(offsetY);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    updateVisibleItems(offsetY);
  };

  const updateVisibleItems = (offsetY: number) => {
    const data = getFlatListData();
    const ITEM_HEIGHT = 200; // Approximate height of each item
    const currentIndex = Math.floor(offsetY / ITEM_HEIGHT);
    
    console.log('📜 Scroll position:', offsetY, 'Current index:', currentIndex);
    
    if (currentIndex >= 0 && currentIndex < data.length) {
      const currentItem = data[currentIndex];
      console.log('📋 Current item:', currentItem.type, 'Category:', currentItem.category?.name);
      
      let newVisibleCategory: Category | null = null;
      let newVisibleSubCategory: SubCategory | null = null;
      
      if (currentItem.type === 'category') {
        newVisibleCategory = currentItem.category;
        console.log('🎯 Visible category:', newVisibleCategory.name);
      } else if (currentItem.type === 'subcategory') {
        newVisibleCategory = currentItem.category;
        newVisibleSubCategory = currentItem.subCategory || null;
        console.log('🎯 Visible subcategory:', newVisibleSubCategory?.name, 'in category:', newVisibleCategory.name);
      } else if (currentItem.type === 'items-grid') {
        newVisibleCategory = currentItem.category;
        newVisibleSubCategory = currentItem.subCategory || null;
        console.log('🎯 Visible items grid for subcategory:', newVisibleSubCategory?.name, 'in category:', newVisibleCategory.name);
      }
      
      // Update visible items
      if (newVisibleCategory !== visibleCategory) {
        setVisibleCategory(newVisibleCategory);
      }
      if (newVisibleSubCategory !== visibleSubCategory) {
        setVisibleSubCategory(newVisibleSubCategory);
      }
    }
  };

  const getCurrentSubCategoriesForTabs = () => {
    return getCurrentSubCategories();
  };

  const scrollToCategory = (categoryId: number) => {
    const targetIndex = categoryRefs.current[categoryId];
    if (targetIndex !== undefined) {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.marketTitle} numberOfLines={1}>
              {market.name?.['en-US'] || market.name?.ar || 'Haat Market'}
            </Text>
            <Text style={styles.marketSubtitle} numberOfLines={1}>
              {market.address?.['en-US'] || market.address?.ar || 'Food Delivery'}
            </Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartButtonText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {categories.filter(cat => !cat.hide).map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory?.id === category.id && styles.categoryTabActive
              ]}
              onPress={() => {
                console.log(`🎯 Category tab pressed: "${category.name}" (ID: ${category.id})`);
                setSelectedCategory(category);
                setVisibleCategory(category);
                
                // Auto-select the first subcategory of the newly selected category
                if (category.subCategories && category.subCategories.length > 0) {
                  const firstSubCategory = category.subCategories[0];
                  console.log(`🎯 Auto-selecting first subcategory: "${firstSubCategory.name}" (ID: ${firstSubCategory.id})`);
                  setSelectedSubCategory(firstSubCategory);
                  setVisibleSubCategory(firstSubCategory);
                } else {
                  setSelectedSubCategory(null);
                  setVisibleSubCategory(null);
                }
                
                // Scroll to the newly selected category
                setTimeout(() => {
                  scrollToCategory(category.id);
                }, 100);
              }}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory?.id === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subcategory Tabs */}
      {selectedCategory && getCurrentSubCategoriesForTabs().length > 0 && (
        <View style={styles.subCategoryTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCategoryTabsContent}
          >
            {getCurrentSubCategoriesForTabs().map((subCategory) => (
              <TouchableOpacity
                key={subCategory.id}
                style={[
                  styles.subCategoryTab,
                  selectedSubCategory?.id === subCategory.id && styles.subCategoryTabActive
                ]}
                onPress={() => {
                  console.log(`🎯 Subcategory tab pressed: "${subCategory.name}" (ID: ${subCategory.id})`);
                  setSelectedSubCategory(subCategory);
                  setVisibleSubCategory(subCategory);
                }}
              >
                <Text style={[
                  styles.subCategoryTabText,
                  selectedSubCategory?.id === subCategory.id && styles.subCategoryTabTextActive
                ]}>
                  {subCategory.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loading State for Category */}
      {isLoadingCategory && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading category details...</Text>
        </View>
      )}

      {/* Error State for Category */}
      {categoryError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{categoryError}</Text>
        </View>
      )}

      {/* Content */}
      {!isLoadingCategory && !categoryError && (
        <FlatList
          key={`category-${selectedCategory?.id || 'none'}`}
          ref={flatListRef}
          data={getFlatListData()}
          renderItem={({ item }) => {
            switch (item.type) {
              case 'category':
                return renderCategoryHeader(item.category);
              case 'subcategory':
                return renderSubCategoryHeader(item.subCategory!);
              case 'items-grid':
                return renderItemsGrid(item.items!);
              default:
                return null;
            }
          }}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  marketTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  marketSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  categoryTabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginVertical: 8,
  },
  categoryTabActive: {
    backgroundColor: '#FF6B35',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  subCategoryTabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  subCategoryTabsContent: {
    paddingHorizontal: 16,
  },
  subCategoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginVertical: 6,
  },
  subCategoryTabActive: {
    backgroundColor: '#FF6B35',
  },
  subCategoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  subCategoryTabTextActive: {
    color: '#fff',
  },
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
  itemsGridContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B35',
    textAlign: 'center',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  selectedCategoryHeader: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  visibleCategoryHeader: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  selectedCategoryHeaderTitle: {
    color: '#FF6B35',
  },
  visibleCategoryHeaderTitle: {
    color: '#FF6B35',
  },
  selectedCategoryHeaderSubtitle: {
    color: '#FF6B35',
  },
  visibleCategoryHeaderSubtitle: {
    color: '#FF6B35',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  visibleSubCategoryIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visibleSubCategoryIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MarketDetail; 