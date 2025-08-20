import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '../types';
import { getImageUrl } from '../services/api';

const { width, height } = Dimensions.get('window');

// Grid configuration
const GRID_COLUMNS = 2;
const GRID_SPACING = 16;
const GRID_MARGIN = 20;
const CARD_WIDTH = (width - (GRID_MARGIN * 2) - (GRID_SPACING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;

interface MarketsListProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

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

const MarketsList: React.FC<MarketsListProps> = ({ categories, onCategoryPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);
  
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent animated />
      
      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Haat</Text>
          <Text style={styles.heroSubtitle}>Delicious Food Delivered</Text>
          <Text style={styles.heroDescription}>
            Discover amazing flavors from the best restaurants in town
          </Text>
        </View>
        
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your favorite food..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.trim() && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Search Results' : 'Food Categories'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {searchQuery.trim() 
            ? `Found ${filteredCategories.length} category${filteredCategories.length !== 1 ? 'ies' : 'y'} for "${searchQuery}"`
            : 'What are you craving today?'
          }
        </Text>
      </View>

      {/* Grid Container */}
      <View style={styles.gridContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          {filteredCategories.length === 0 && searchQuery.trim() ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsIcon}>🔍</Text>
              <Text style={styles.noResultsTitle}>No categories found</Text>
              <Text style={styles.noResultsSubtitle}>
                Try searching for something else or browse all categories
              </Text>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {filteredCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { 
                    width: CARD_WIDTH,
                    marginRight: (index + 1) % GRID_COLUMNS === 0 ? 0 : GRID_SPACING,
                    marginBottom: GRID_SPACING,
                  }
                ]}
                onPress={() => onCategoryPress(category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <ImageWithFallback
                      imagePath={category.image}
                      style={styles.categoryImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>🍽️</Text>
                    </View>
                  )}
                  
                  {/* Category Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.categoryOverlay}
                  />

                </View>
                
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryItems}>
                    {category.subCategories?.length || 0} subcategories
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            </View>
          )}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroHeader: {
    height: height * 0.4,
    paddingHorizontal: 20,
    paddingTop: 70,
    position: 'relative',
    overflow: 'hidden',
    marginTop: -50,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingTop: 40,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    paddingHorizontal: 20,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    maxWidth: 500,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  iconCircle: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 120,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle2: {
    top: 200,
    left: 30,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle3: {
    top: 160,
    left: width - 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    zIndex: 3,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#666',
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: GRID_MARGIN,
  },
  gridContent: {
    paddingBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  categoryImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  categoryImage: {
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
    fontSize: 40,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryInfo: {
    padding: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 20,
    textAlign: 'center',
  },
  categoryItems: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomHint: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
});

export default MarketsList; 