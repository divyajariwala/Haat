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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        }, 500);
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
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [visibleCategory]);

  // Smooth auto-scroll subcategory tabs when visible subcategory changes
  useEffect(() => {
    if (visibleSubCategory && subCategoryTabsScrollViewRef.current) {
      // Use a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        smoothScrollSubCategoryTabsToVisible(visibleSubCategory);
      }, 400);
      
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

            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
              )}
              <View style={styles.itemPriceContainer}>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
    if (Math.abs(offsetY - (lastScrollOffset.current || 0)) < 50) {
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
        itemHeight = 120; // Category header height
      } else if (item.type === 'subcategory') {
        itemHeight = 80; // Subcategory header height
      } else if (item.type === 'items-grid') {
        const itemCount = item.items?.length || 0;
        const rows = Math.ceil(itemCount / 2); // 2 columns
        itemHeight = rows * 200; // Approximate height per row
      }
      
      // Check if this item is currently visible in the viewport
      const itemStart = accumulatedHeight;
      const itemEnd = accumulatedHeight + itemHeight;
      const viewportStart = offsetY;
      const viewportEnd = offsetY + 800; // Approximate viewport height
      
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
      const tabWidth = 120;
      const containerWidth = 300; // Approximate container width
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
      const tabWidth = 100;
      const containerWidth = 250; // Approximate container width for subcategories
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
    
    // Simple approach: find the category in the data and calculate offset
    const data = getFlatListData();
    console.log('📊 Data length:', data.length);
    console.log('📊 Data items:', data.map(item => ({ type: item.type, categoryId: item.category?.id, categoryName: item.category?.name })));
    
    const categoryIndex = data.findIndex(item =>
      item.type === 'category' && item.category.id === categoryId
    );

    if (categoryIndex !== -1) {
      console.log(`✅ Found category at index: ${categoryIndex}`);
      
      // Calculate offset based on item heights
      let offset = 0;
      for (let i = 0; i < categoryIndex; i++) {
        const item = data[i];
        if (item.type === 'category') {
          offset += 120; // Category header height
        } else if (item.type === 'subcategory') {
          offset += 80; // Subcategory header height
        } else if (item.type === 'items-grid') {
          const itemCount = item.items?.length || 0;
          const rows = Math.ceil(itemCount / 2); // 2 columns
          offset += rows * 200; // Approximate height per row
        }
      }
      
      console.log(`📏 Calculated offset: ${offset}`);
      
      // Smooth scrolling with easing
      setTimeout(() => {
        console.log(`🔄 Smoothly scrolling to offset ${offset}`);
        
        // Calculate the distance to scroll for duration
        const scrollDistance = Math.abs(offset - 0);
        const animationDuration = Math.min(Math.max(scrollDistance / 2, 300), 800);
        
        console.log(`🎬 Animation duration: ${animationDuration}ms for distance: ${scrollDistance}px`);
        
        // Use the smooth scroll function
        smoothScrollToOffset(offset, animationDuration);
        
      }, 200);
      
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
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <View style={styles.backArrow} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.marketTitle} numberOfLines={1}>
              {market.name?.['en-US'] || market.name?.ar || 'Haat Market'}
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
          ref={categoryTabsScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {(selectedCategory ? [selectedCategory, ...categories.filter(cat => cat.id !== selectedCategory.id)] : categories).map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                visibleCategory?.id === category.id && styles.categoryTabActive
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
                visibleCategory?.id === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subcategory Tabs */}
      {getCurrentSubCategoriesForTabs().length > 0 && (
        <View style={styles.subCategoryTabsContainer}>
          <ScrollView
            ref={subCategoryTabsScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCategoryTabsContent}
          >
            {(selectedSubCategory ? [selectedSubCategory, ...getCurrentSubCategoriesForTabs().filter(sub => sub.id !== selectedSubCategory.id)] : getCurrentSubCategoriesForTabs()).map((subCategory) => (
              <TouchableOpacity
                key={subCategory.id}
                style={[
                  styles.subCategoryTab,
                  visibleSubCategory?.id === subCategory.id && styles.subCategoryTabActive
                ]}
                onPress={() => {
                  console.log(`🎯 Subcategory tab pressed: "${subCategory.name}" (ID: ${subCategory.id})`);
                  setSelectedSubCategory(subCategory);
                  setVisibleSubCategory(subCategory);
                }}
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
      <FlatList
        key={`all-categories-${categories.length}-${selectedCategoryId || 'none'}`}
        ref={flatListRef}
        data={getFlatListData()}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'subcategory':
              return renderSubCategoryHeader(item.subCategory!);
            case 'items-grid':
              return renderItemsGrid(item.items!);
            default:
              return null;
          }
        }}
        keyExtractor={(item) => item.id}
        onLayout={() => {
          console.log('📱 FlatList layout completed');
          if (selectedCategory) {
            console.log('🎯 FlatList ready, selected category is now first, scrolling to top smoothly');
            // Smooth scroll to top with easing
            setTimeout(() => {
              smoothScrollToOffset(0, 600);
            }, 500);
          }
        }}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          updateVisibleItems(offsetY);
        }}
        onScrollEndDrag={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          // Only update tabs when scrolling stops for better UX
          updateVisibleItems(offsetY);
        }}
        onMomentumScrollEnd={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          // Update tabs when momentum scrolling ends
          updateVisibleItems(offsetY);
        }}
        onScrollBeginDrag={() => {
          console.log('🎯 User started scrolling manually');
        }}
        initialNumToRender={5}
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: -50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 24,
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  marketTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  marketSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
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
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 320,
  },
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
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
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTagText: {
    color: '#FF6B35',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemInfo: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
    minHeight: 40,
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
    minHeight: 36,
    flexShrink: 0,
  },
  itemPriceContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 4,
    alignSelf: 'stretch',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    minHeight: 44,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 8,
  },
  summarySubtitle: {
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