import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>🍽️ Haat</Text>
          <Text style={styles.heroSubtitle}>Delicious Food Delivered</Text>
          <Text style={styles.heroDescription}>
            Discover amazing flavors from the best restaurants in town
          </Text>
        </View>
        
        {/* Floating Food Icons */}
        <View style={styles.floatingIcons}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🍕</Text>
          </View>
          <View style={[styles.iconCircle, styles.iconCircle2]}>
            <Text style={styles.iconText}>🍔</Text>
          </View>
          <View style={[styles.iconCircle, styles.iconCircle3]}>
            <Text style={styles.iconText}>🍜</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search for your favorite food...</Text>
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Food Categories</Text>
        <Text style={styles.sectionSubtitle}>What are you craving today?</Text>
      </View>

      {/* Grid Container */}
      <View style={styles.gridContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.gridRow}>
            {categories.map((category, index) => (
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
                  
                  {/* Category Badge */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.badgeText}>New</Text>
                  </View>
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
        </ScrollView>
      </View>

      {/* Bottom Navigation Hint */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>👆 Tap on a category to explore</Text>
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
    height: height * 0.35,
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    top: '20%',
    right: '15%',
  },
  iconCircle2: {
    top: '60%',
    left: '10%',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconCircle3: {
    top: '40%',
    left: '70%',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconText: {
    fontSize: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
    zIndex: 3,
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
  searchText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
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