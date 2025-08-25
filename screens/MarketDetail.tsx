import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  SectionList,
  Animated,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketDetail as MarketDetailType, Category, SubCategory, Item } from '../types';
import {
  MarketHeader,
  CategoryTabs,
  SubCategoryTabs,
  CategoryHeader,
  SubCategoryHeader,
  ItemsGrid,
} from '../components';
import { SCROLL_CONFIG, GRID_CONFIG, COLORS } from '../constants';

const { width } = Dimensions.get('window');

// Constants for layout calculations
const ITEM_HEIGHT = 120; // Adjust based on your actual item height
const ITEMS_PER_ROW = 3; // Number of items in a row
const GRID_SPACING = 8; // Space between items
const SUBCATEGORY_HEADER_HEIGHT = 50;

interface MarketDetailProps {
  market: MarketDetailType;
  selectedCategoryId?: number;
  categories: Category[];
  onBack: () => void;
}

interface SectionItem {
  subCategory: SubCategory;
  items: Item[];
}

interface Section {
  category: Category;
  data: SectionItem[];
}

const MarketDetail: React.FC<MarketDetailProps> = ({ market, selectedCategoryId, categories, onBack }) => {
  // Debug logs (temporary)
  try {
    console.log('[MarketDetail] mount', { selectedCategoryId, categoriesCount: categories?.length });
  } catch {}
  // State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [visibleCategory, setVisibleCategory] = useState<Category | null>(null);
  const [visibleSubCategory, setVisibleSubCategory] = useState<SubCategory | null>(null);
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);

  // Refs
  const listRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const initialScrollTimeout = useRef<any>(null);
  const lastVisibleCategory = useRef<Category | null>(null);
  const lastVisibleSubCategory = useRef<SubCategory | null>(null);
  const didInitialScroll = useRef(false);
  const tabsContainerHeightRef = useRef(0);

  // Create animated SectionList
  const AnimatedSectionList = useMemo(() => Animated.createAnimatedComponent(SectionList), []);

  // Transform data for SectionList
  const sections = useMemo(() => {
    if (!categories?.length) return [];

    return categories.map(category => ({
      category,
      data: (category.subCategories || []).map(subCategory => ({
        subCategory,
        items: subCategory.items || []
      }))
    }));
  }, [categories]);

  // Calculate item layout for scrollToIndex
  const getItemLayout = (data: any, index: number) => {
    const itemsPerRow = ITEMS_PER_ROW;
    const itemHeight = ITEM_HEIGHT;
    const spacing = GRID_SPACING;
    
    let totalHeight = 0;
    let currentIndex = 0;

    for (const section of sections) {
      for (const sectionItem of section.data) {
        if (currentIndex === index) {
          return {
            length: SUBCATEGORY_HEADER_HEIGHT + Math.ceil(sectionItem.items.length / itemsPerRow) * (itemHeight + spacing),
            offset: totalHeight,
            index
          };
        }
        totalHeight += SUBCATEGORY_HEADER_HEIGHT + Math.ceil(sectionItem.items.length / itemsPerRow) * (itemHeight + spacing);
        currentIndex++;
      }
    }

    // Fallback
    return {
      length: SUBCATEGORY_HEADER_HEIGHT + itemHeight,
      offset: totalHeight,
      index
    };
  };

  // Handle scroll failures
  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const { index } = info;
    
    // Find the section and item indices
    let currentIndex = 0;
    let targetSectionIndex = 0;
    let targetItemIndex = 0;

    for (let i = 0; i < sections.length; i++) {
      for (let j = 0; j < sections[i].data.length; j++) {
        if (currentIndex === index) {
          targetSectionIndex = i;
          targetItemIndex = j;
          break;
        }
        currentIndex++;
      }
    }

    // Retry scroll with a delay
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToLocation({
          sectionIndex: targetSectionIndex,
          itemIndex: targetItemIndex,
          animated: true,
          viewPosition: 0,
          viewOffset: Platform.select({ ios: 2, android: 1 })
        });
      }
    }, 100);
  };

  const performInitialScroll = useCallback((idToScroll?: number) => {
    if (!listRef.current || didInitialScroll.current || !sections.length) return;
    const idNum = Number(idToScroll ?? selectedCategoryId);
    const idx = sections.findIndex(s => Number(s.category.id) === idNum);
    console.log('[MarketDetail] performInitialScroll', { idNum, idx, sectionsLen: sections.length });
    if (idx === -1) return;
    setIsProgrammaticScroll(true);
    listRef.current.scrollToLocation({
      sectionIndex: idx,
      itemIndex: 0,
      animated: true,
      viewPosition: 0,
      viewOffset: SCROLL_CONFIG.CATEGORY_HEADER_HEIGHT || 0
    });
    didInitialScroll.current = true;
    setTimeout(() => setIsProgrammaticScroll(false), 300);
  }, [sections, selectedCategoryId]);

  // Initialize selected category and scroll to it
  useEffect(() => {
    if (!categories?.length || selectedCategoryId == null) return;

    const selectedIdNum = Number(selectedCategoryId);
    console.log('[MarketDetail] init-effect start', { selectedIdNum, categoriesCount: categories.length });
    const targetCategory = categories.find(cat => Number(cat?.id) === selectedIdNum);
    if (!targetCategory) return;

    setSelectedCategory(targetCategory);
    setVisibleCategory(targetCategory);
    lastVisibleCategory.current = targetCategory;

    // Pick the first subcategory that actually has items
    const firstSubCategory = (targetCategory.subCategories || []).find(sc => (sc.items || []).length > 0) || targetCategory.subCategories?.[0];
    if (firstSubCategory) {
      setSelectedSubCategory(firstSubCategory);
      setVisibleSubCategory(firstSubCategory);
      lastVisibleSubCategory.current = firstSubCategory;
    }

    // Wait for layout to complete
    InteractionManager.runAfterInteractions(() => {
      initialScrollTimeout.current = setTimeout(() => {
        if (listRef.current && isInitialScroll) {
          const sectionIndex = sections.findIndex(s => Number(s.category.id) === selectedIdNum);
          console.log('[MarketDetail] initial scrollToLocation', { selectedIdNum, sectionIndex, sectionsLen: sections.length });
          if (sectionIndex !== -1) {
            setIsProgrammaticScroll(true);
            listRef.current.scrollToLocation({
              sectionIndex,
              itemIndex: 0,
              animated: true,
              viewPosition: 0,
              viewOffset: tabsContainerHeightRef.current || 0
            });
            
            // Reset flags after scroll completes
            setTimeout(() => {
              setIsInitialScroll(false);
              setIsProgrammaticScroll(false);
              didInitialScroll.current = true;
            }, 300);
          }
        }
      }, 150);
    });

    return () => {
      if (initialScrollTimeout.current) {
        clearTimeout(initialScrollTimeout.current);
      }
    };
  }, [selectedCategoryId, categories, sections]);

  // Robust re-try scroll if first attempt missed due to layout timing
  useEffect(() => {
    if (!isInitialScroll || selectedCategoryId == null || !sections.length) return;
    const idNum = Number(selectedCategoryId);
    const idx = sections.findIndex(s => Number(s.category.id) === idNum);
    if (idx === -1) {
      console.log('[MarketDetail] retry-scroll: category not found', { selectedCategoryId });
      return;
    }

    const tryScroll = (delay: number) => setTimeout(() => {
      if (!listRef.current || !isInitialScroll) return;
      setIsProgrammaticScroll(true);
      console.log('[MarketDetail] retry scrollToLocation', { idx, selectedCategoryId });
      listRef.current.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
        viewOffset: SCROLL_CONFIG.CATEGORY_HEADER_HEIGHT || 0
      });
      setTimeout(() => {
        setIsProgrammaticScroll(false);
        setIsInitialScroll(false);
        didInitialScroll.current = true;
      }, 300);
    }, delay);

    tryScroll(0);
    tryScroll(250);
    tryScroll(500);
  }, [sections, isInitialScroll, selectedCategoryId]);

  // Trigger initial scroll once content is measured
  const handleContentSizeChange = useCallback(() => {
    if (!didInitialScroll.current) {
      performInitialScroll();
    }
  }, [performInitialScroll]);

  // Scroll handlers
  const scrollToCategory = (categoryId: number) => {
    if (!listRef.current || !sections?.length) return;

    const sectionIndex = sections.findIndex(section => section?.category?.id === categoryId);
    if (sectionIndex !== -1) {
      setIsProgrammaticScroll(true);
      listRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
        viewOffset: tabsContainerHeightRef.current || 0
      });
      
      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 300);
    }
  };

  const scrollToSubCategory = (categoryId: number, subCategoryId: number) => {
    if (!listRef.current || !sections?.length) return;

    const sectionIndex = sections.findIndex(section => section?.category?.id === categoryId);
    if (sectionIndex !== -1) {
      const itemIndex = sections[sectionIndex].data.findIndex(
        item => item?.subCategory?.id === subCategoryId
      );
      if (itemIndex !== -1) {
        setIsProgrammaticScroll(true);
        listRef.current.scrollToLocation({
          sectionIndex,
          itemIndex,
          animated: true,
          viewPosition: 0,
          viewOffset: tabsContainerHeightRef.current || 0
        });
        
        setTimeout(() => {
          setIsProgrammaticScroll(false);
        }, 300);
      }
    }
  };

  // Viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 1,
    minimumViewTime: 0
  }), []);

  const onViewableItemsChangedHandler = useCallback(({ viewableItems }: any) => {
    if (!viewableItems?.length || isInitialScroll || isProgrammaticScroll) return;

    let maxVisibleSection: any = null;
    let maxVisibleItem: any = null;
    let maxVisiblePercentage = 0;

    viewableItems.forEach(({ item, section, percentVisible }: any) => {
      if (percentVisible && percentVisible > maxVisiblePercentage) {
        maxVisiblePercentage = percentVisible;
        maxVisibleSection = section;
        maxVisibleItem = item;
      }
    });

    if (maxVisibleSection?.category?.id &&
        lastVisibleCategory.current?.id !== maxVisibleSection.category.id) {
      lastVisibleCategory.current = maxVisibleSection.category;
      setVisibleCategory(maxVisibleSection.category);
      setSelectedCategory(maxVisibleSection.category);
    }

    if (maxVisibleItem?.subCategory?.id &&
        lastVisibleSubCategory.current?.id !== maxVisibleItem.subCategory.id) {
      lastVisibleSubCategory.current = maxVisibleItem.subCategory;
      setVisibleSubCategory(maxVisibleItem.subCategory);
      setSelectedSubCategory(maxVisibleItem.subCategory);
    }
  }, [isInitialScroll, isProgrammaticScroll]);

  // More responsive viewability via callback pairs (stable ref)
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 10,
        minimumViewTime: 0,
        waitForInteraction: false,
      },
      onViewableItemsChanged: onViewableItemsChangedHandler,
    },
  ]).current;

  // Early return if no data
  if (!categories?.length || !market) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent animated />
      
      <MarketHeader market={market} onBack={onBack} />

      <View onLayout={(e) => { tabsContainerHeightRef.current = e.nativeEvent.layout.height; }}>
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        visibleCategory={visibleCategory}
        onCategoryPress={(category) => {
          if (!category?.id) return;
          
          setSelectedCategory(category);
          setVisibleCategory(category);
          lastVisibleCategory.current = category;
          
          const firstSubCategory = category.subCategories?.[0];
          if (firstSubCategory) {
            setSelectedSubCategory(firstSubCategory);
            setVisibleSubCategory(firstSubCategory);
            lastVisibleSubCategory.current = firstSubCategory;
          }
          
          scrollToCategory(category.id);
        }}
      />

      <SubCategoryTabs
        subCategories={selectedCategory?.subCategories || []}
        selectedSubCategory={selectedSubCategory}
        visibleSubCategory={visibleSubCategory}
        onSubCategoryPress={(subCategory) => {
          if (!subCategory?.id || !selectedCategory?.id) return;
          
          setSelectedSubCategory(subCategory);
          setVisibleSubCategory(subCategory);
          lastVisibleSubCategory.current = subCategory;
          scrollToSubCategory(selectedCategory.id, subCategory.id);
        }}
      />
      </View>

      <AnimatedSectionList
        ref={listRef}
        sections={sections}
        onContentSizeChange={handleContentSizeChange}
        renderSectionHeader={({ section }) => (
          <CategoryHeader
            category={section.category}
            isVisible={visibleCategory?.id === section.category?.id}
          />
        )}
        renderItem={({ item }) => (
          <View>
            <SubCategoryHeader 
              subCategory={item.subCategory}
              isVisible={visibleSubCategory?.id === item.subCategory?.id}
              style={styles.stickyHeader}
            />
            <ItemsGrid items={item.items || []} />
          </View>
        )}
        keyExtractor={(item, index) => {
          if (!item?.subCategory?.id) {
            return `fallback-${index}`;
          }
          const categoryIdForKey = item.subCategory.categoryId ?? 'x';
          return `sub-${categoryIdForKey}-${item.subCategory.id}`;
        }}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        stickySectionHeadersEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={Platform.OS === 'android'}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingBottom: 20,
  },
  stickyHeader: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  }
});

export default React.memo(MarketDetail);