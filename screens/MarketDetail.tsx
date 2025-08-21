import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketDetail as MarketDetailType, Category, SubCategory, Item, CategoryDetail } from '../types';
import { getCategoryDetail } from '../services/api';
import {
  MarketHeader,
  CategoryTabs,
  SubCategoryTabs,
  CategoryHeader,
  SubCategoryHeader,
  ItemsGrid,
} from '../components';
import { SCROLL_CONFIG, FLATLIST_CONFIG, TIMEOUTS, LOADING_MESSAGES, ERROR_MESSAGES, ANIMATION_CONFIG, GRID_CONFIG } from '../constants';

const { width, height } = Dimensions.get('window');



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
  const lastScrollOffset = useRef<number>(0);
  
  const flatListRef = useRef<FlatList>(null);
  const categoryTabsScrollViewRef = useRef<ScrollView>(null);
  const subCategoryTabsScrollViewRef = useRef<ScrollView>(null);



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
        
        // Auto-scroll to the selected category after the component has rendered
        setTimeout(() => {
          scrollToCategory(category.id);
        }, TIMEOUTS.SCROLL_DELAY_LAYOUT);
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

  // Smooth auto-scroll horizontal tabs when visible category changes
  useEffect(() => {
    if (visibleCategory && categoryTabsScrollViewRef.current) {
      // Use a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        smoothScrollCategoryTabsToVisible(visibleCategory);
      }, TIMEOUTS.SCROLL_DELAY_EXTENDED);
      
      return () => clearTimeout(timer);
    }
  }, [visibleCategory]);

  // Smooth auto-scroll subcategory tabs when visible subcategory changes
  useEffect(() => {
    if (visibleSubCategory && subCategoryTabsScrollViewRef.current) {
      // Use a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        smoothScrollSubCategoryTabsToVisible(visibleSubCategory);
      }, TIMEOUTS.SCROLL_DELAY_SMOOTH);
      
      return () => clearTimeout(timer);
    }
  }, [visibleSubCategory]);

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
      let errorMessage: string = ERROR_MESSAGES.CATEGORY_LOAD_FAILED;
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = ERROR_MESSAGES.CATEGORY_NOT_FOUND;
        } else if (error.response.status === 500) {
          errorMessage = ERROR_MESSAGES.SERVER_ERROR_CATEGORY;
        } else if (error.response.status >= 400) {
          errorMessage = ERROR_MESSAGES.REQUEST_FAILED_CATEGORY;
        }
      } else if (error.request) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR_CATEGORY;
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

    console.log('🔄 Building FlatList data...');
    console.log('📊 Categories count:', categories.length);
    console.log('📊 Categories:', categories.map(c => ({ id: c.id, name: c.name })));

    // Show all categories and their products
    if (categories.length === 0) {
      console.log('⚠️ No categories available, returning empty data');
      return data;
    }

    console.log(`🎯 Building data for all ${categories.length} categories`);

    // Reorder categories to put selected category first
    let orderedCategories = [...categories];
    if (selectedCategory) {
      console.log(`🎯 Reordering categories to put selected category "${selectedCategory.name}" first`);
      // Remove selected category from current position
      orderedCategories = orderedCategories.filter(cat => cat.id !== selectedCategory.id);
      // Add selected category at the beginning
      orderedCategories.unshift(selectedCategory);
      console.log(`📊 Reordered categories:`, orderedCategories.map(c => c.name));
    }

    // Process all categories in the new order
    orderedCategories.forEach((category, categoryIndex) => {
      console.log(`📊 Processing category: "${category.name}" (ID: ${category.id})`);
      
      // Add category header
      data.push({
        type: 'category',
        id: `category-${category.id}`,
        category: category,
        index: data.length
      });



      // Add subcategories and products for this category
      if (category.subCategories && category.subCategories.length > 0) {
        console.log(`📋 Processing ${category.subCategories.length} subcategories for category "${category.name}"`);
        
        category.subCategories.forEach((subCategory, subIndex) => {
          console.log(`📋 Adding subcategory: "${subCategory.name}" with ${subCategory.items?.length || 0} items`);
          
          // Add subcategory header
          data.push({
            type: 'subcategory',
            id: `subcategory-${subCategory.id}`,
            category: category,
            subCategory,
            index: data.length
          });

          // Add items grid if there are products
          if (subCategory.items && subCategory.items.length > 0) {
            console.log(`🛍️ Adding ${subCategory.items.length} items for subcategory "${subCategory.name}"`);
            
            data.push({
              type: 'items-grid',
              id: `items-${subCategory.id}`,
              category: category,
              subCategory,
              items: subCategory.items,
              index: data.length
            });


          } else {
            console.log(`⚠️ Subcategory "${subCategory.name}" has no items`);
          }
        });
      } else {
        console.log(`⚠️ Category "${category.name}" has no subcategories`);
      }
    });

    console.log(`✅ Built data with ${data.length} items for all categories`);
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
    const isVisible = visibleCategory && category.id === visibleCategory.id;
    return <CategoryHeader category={category} isVisible={!!isVisible} />;
  };

  const renderSubCategoryHeader = (subCategory: SubCategory) => {
    const isVisible = visibleSubCategory && subCategory.id === visibleSubCategory.id;
    return <SubCategoryHeader subCategory={subCategory} isVisible={!!isVisible} />;
  };

  const renderItemsGrid = (items: Item[]) => (
    <ItemsGrid items={items} />
  );



  const getCurrentSubCategoriesForTabs = () => {
    // If we have a visible category, show its subcategories
    if (visibleCategory) {
      let subCategories = visibleCategory.subCategories || [];
      
      // If we have a selected subcategory, put it first
      if (selectedSubCategory) {
        subCategories = [
          selectedSubCategory,
          ...subCategories.filter(sub => sub.id !== selectedSubCategory.id)
        ];
      }
      
      return subCategories;
    }
    
    // Otherwise, show subcategories from all categories
    const allSubCategories: SubCategory[] = [];
    categories.forEach(category => {
      if (category.subCategories) {
        allSubCategories.push(...category.subCategories);
      }
    });
    
    // If we have a selected subcategory, put it first
    if (selectedSubCategory) {
      return [
        selectedSubCategory,
        ...allSubCategories.filter(sub => sub.id !== selectedSubCategory.id)
      ];
    }
    
    return allSubCategories;
  };

  const updateVisibleItems = (offsetY: number) => {
    // Throttle updates to prevent too frequent state changes
    if (Math.abs(offsetY - (lastScrollOffset.current || 0)) < SCROLL_CONFIG.THROTTLE_THRESHOLD) {
      return;
    }
    
    // Update last scroll offset
    lastScrollOffset.current = offsetY;
    
    const data = getFlatListData();
    let currentVisibleCategory: Category | null = null;
    let currentVisibleSubCategory: SubCategory | null = null;
    
    // Calculate which items are currently visible based on scroll position
    let accumulatedHeight = 0;
    
    for (const item of data) {
      let itemHeight = 0;
      
      if (item.type === 'category') {
        itemHeight = SCROLL_CONFIG.CATEGORY_HEADER_HEIGHT;
      } else if (item.type === 'subcategory') {
        itemHeight = SCROLL_CONFIG.SUBCATEGORY_HEADER_HEIGHT;
      } else if (item.type === 'items-grid') {
        const itemCount = item.items?.length || 0;
        const rows = Math.ceil(itemCount / GRID_CONFIG.COLUMNS);
        itemHeight = rows * SCROLL_CONFIG.ITEM_ROW_HEIGHT;
      }
      
      // Check if this item is currently visible in the viewport
      const itemStart = accumulatedHeight;
      const itemEnd = accumulatedHeight + itemHeight;
      const viewportStart = offsetY;
      const viewportEnd = offsetY + SCROLL_CONFIG.VIEWPORT_HEIGHT;
      
      // Item is visible if it intersects with the viewport
      if (itemStart < viewportEnd && itemEnd > viewportStart) {
        if (item.type === 'category') {
          currentVisibleCategory = item.category;
          console.log(`👁️ Visible category: "${item.category.name}"`);
        } else if (item.type === 'subcategory') {
          currentVisibleCategory = item.category;
          currentVisibleSubCategory = item.subCategory || null;
          console.log(`👁️ Visible subcategory: "${item.subCategory?.name}" in category "${item.category.name}"`);
        } else if (item.type === 'items-grid') {
          currentVisibleCategory = item.category;
          currentVisibleSubCategory = item.subCategory || null;
          console.log(`👁️ Visible items grid for subcategory "${item.subCategory?.name}" in category "${item.category.name}"`);
        }
        break;
      }
      
      accumulatedHeight += itemHeight;
    }
    
    // Update visible category and subcategory if they've changed
    if (currentVisibleCategory !== visibleCategory) {
      console.log(`🔄 Updating visible category from "${visibleCategory?.name || 'none'}" to "${currentVisibleCategory?.name}"`);
      setVisibleCategory(currentVisibleCategory);
    }
    
    if (currentVisibleSubCategory !== visibleSubCategory) {
      console.log(`🔄 Updating visible subcategory from "${visibleSubCategory?.name || 'none'}" to "${currentVisibleSubCategory?.name || 'none'}"`);
      setVisibleSubCategory(currentVisibleSubCategory);
    }
    
    // Log the final state
    if (currentVisibleCategory || currentVisibleSubCategory) {
      console.log(`📍 Final visible state: Category "${currentVisibleCategory?.name}", Subcategory "${currentVisibleSubCategory?.name || 'none'}"`);
    }
    
    // Log the final state
    if (currentVisibleCategory || currentVisibleSubCategory) {
      console.log(`📍 Final visible state: Category "${currentVisibleCategory?.name}", Subcategory "${currentVisibleSubCategory?.name || 'none'}"`);
    }
  };

  const smoothScrollCategoryTabsToVisible = (category: Category) => {
    if (!categoryTabsScrollViewRef.current) {
      return;
    }
    
    // Find the index of the category in the reordered categories array
    const orderedCategories = selectedCategory 
      ? [selectedCategory, ...categories.filter(cat => cat.id !== selectedCategory.id)]
      : categories;
    
    const categoryIndex = orderedCategories.findIndex(cat => cat.id === category.id);
    
    if (categoryIndex !== -1) {
      // Calculate the target scroll position with better centering
      const tabWidth = SCROLL_CONFIG.TAB_WIDTH_CATEGORY;
      const containerWidth = SCROLL_CONFIG.CONTAINER_WIDTH_CATEGORY;
      const targetScrollX = Math.max(0, (categoryIndex * tabWidth) - (containerWidth / 2) + (tabWidth / 2));
      
      console.log(`🎯 Smooth scrolling category tabs to show "${category.name}" at position ${targetScrollX}`);
      
      // Use smooth scrolling with easing
      categoryTabsScrollViewRef.current.scrollTo({
        x: targetScrollX,
        y: 0,
        animated: true,
      });
    }
  };

  const smoothScrollSubCategoryTabsToVisible = (subCategory: SubCategory) => {
    if (!subCategoryTabsScrollViewRef.current) {
      return;
    }
    
    // Find the index of the subcategory in the current subcategories array
    const currentSubCategories = getCurrentSubCategoriesForTabs();
    const subCategoryIndex = currentSubCategories.findIndex(sub => sub.id === subCategory.id);
    
    if (subCategoryIndex !== -1) {
      // Calculate the target scroll position with better centering
      const tabWidth = SCROLL_CONFIG.TAB_WIDTH_SUBCATEGORY;
      const containerWidth = SCROLL_CONFIG.CONTAINER_WIDTH_SUBCATEGORY;
      const targetScrollX = Math.max(0, (subCategoryIndex * tabWidth) - (containerWidth / 2) + (tabWidth / 2));
      
      console.log(`🎯 Smooth scrolling subcategory tabs to show "${subCategory.name}" at position ${targetScrollX}`);
      
      // Use smooth scrolling with easing
      subCategoryTabsScrollViewRef.current.scrollTo({
        x: targetScrollX,
        y: 0,
        animated: true,
      });
    }
  };

  const smoothScrollToOffset = (targetOffset: number, duration: number = 500) => {
    console.log(`🎬 Smooth scrolling to offset ${targetOffset} over ${duration}ms`);
    
    if (!flatListRef.current) {
      console.log('❌ FlatList ref not available');
      return;
    }
    
    // Use FlatList's built-in smooth scrolling
    flatListRef.current.scrollToOffset({
      offset: targetOffset,
      animated: true,
    });
    
    console.log(`✅ Smooth scroll command sent`);
  };

  const scrollToCategory = (categoryId: number) => {
    console.log(`🎯 Attempting to scroll to category ID: ${categoryId}`);
    
    if (!flatListRef.current) {
      console.log('❌ FlatList ref not available');
      return;
    }
    
    // Find the category index in the data
    const data = getFlatListData();
    const categoryIndex = data.findIndex(item =>
      item.type === 'category' && item.category.id === categoryId
    );

    if (categoryIndex !== -1) {
      console.log(`✅ Found category at index: ${categoryIndex}`);
      
      // Use scrollToIndex for more reliable scrolling
      flatListRef.current.scrollToIndex({
        index: categoryIndex,
        animated: true,
        viewPosition: 0, // Align to top
        viewOffset: 0,   // No additional offset
      });
      
      console.log(`✅ Scroll to index ${categoryIndex} initiated`);
    } else {
      console.log(`❌ Category not found in data`);
      console.log(`🔍 Looking for category ID: ${categoryId}`);
      console.log(`📋 Available category IDs:`, data.filter(item => item.type === 'category').map(item => item.category.id));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent animated />
      
      {/* Enhanced Header */}
      <MarketHeader market={market} onBack={onBack} />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        visibleCategory={visibleCategory}
        onCategoryPress={(category) => {
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
          
                  // Scroll to the newly selected category immediately
          scrollToCategory(category.id);
        }}
      />

      {/* Subcategory Tabs */}
      <SubCategoryTabs
        subCategories={getCurrentSubCategoriesForTabs()}
        selectedSubCategory={selectedSubCategory}
        visibleSubCategory={visibleSubCategory}
        onSubCategoryPress={(subCategory) => {
          console.log(`🎯 Subcategory tab pressed: "${subCategory.name}" (ID: ${subCategory.id})`);
          setSelectedSubCategory(subCategory);
          setVisibleSubCategory(subCategory);
        }}
      />

      {/* Loading State for Category */}
      {isLoadingCategory && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{LOADING_MESSAGES.CATEGORY_DETAILS}</Text>
        </View>
      )}

      {/* Error State for Category */}
      {categoryError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{categoryError}</Text>
        </View>
      )}

      {/* Content */}
      <FlatList
        key={`all-categories-${categories.length}-${selectedCategoryId || 'none'}`}
        ref={flatListRef}
        data={getFlatListData()}
        renderItem={({ item }) => {
          switch (item.type) {
           
            case 'items-grid':
              return renderItemsGrid(item.items!);
            default:
              return null;
          }
        }}
        keyExtractor={(item) => item.id}
        getItemLayout={(data, index) => {
          // Calculate the height of each item for reliable scrolling
          if (!data || !data[index]) {
            return { length: 0, offset: 0, index };
          }
          
          const item = data[index];
          let itemHeight = 0;
          
          if (item.type === 'category') {
            itemHeight = SCROLL_CONFIG.CATEGORY_HEADER_HEIGHT;
          } else if (item.type === 'subcategory') {
            itemHeight = SCROLL_CONFIG.SUBCATEGORY_HEADER_HEIGHT;
          } else if (item.type === 'items-grid') {
            const itemCount = item.items?.length || 0;
            const rows = Math.ceil(itemCount / GRID_CONFIG.COLUMNS);
            itemHeight = rows * SCROLL_CONFIG.ITEM_ROW_HEIGHT;
          }
          
          // Calculate offset by summing heights of previous items
          let offset = 0;
          for (let i = 0; i < index; i++) {
            const prevItem = data[i];
            if (prevItem && prevItem.type === 'category') {
              offset += SCROLL_CONFIG.CATEGORY_HEADER_HEIGHT;
            } else if (prevItem && prevItem.type === 'subcategory') {
              offset += SCROLL_CONFIG.SUBCATEGORY_HEADER_HEIGHT;
            } else if (prevItem && prevItem.type === 'items-grid') {
              const prevItemCount = prevItem.items?.length || 0;
              const prevRows = Math.ceil(prevItemCount / GRID_CONFIG.COLUMNS);
              offset += prevRows * SCROLL_CONFIG.ITEM_ROW_HEIGHT;
            }
          }
          
          return {
            length: itemHeight,
            offset: offset,
            index: index,
          };
        }}
        onLayout={() => {
          console.log('📱 FlatList layout completed');
        }}
        onScrollEndDrag={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          updateVisibleItems(offsetY);
        }}
        onMomentumScrollEnd={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          updateVisibleItems(offsetY);
        }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
        removeClippedSubviews={false}
        style={{ flex: 1 }}
        decelerationRate="normal"
        snapToAlignment="start"
        snapToInterval={0}
        scrollEventThrottle={16}
        overScrollMode="auto"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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


});

export default MarketDetail; 