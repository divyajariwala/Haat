import axios from 'axios';
import { MarketDetail, CategoryDetail, Category, SubCategory, Item } from '../types';

const BASE_URL = 'https://user-new-app-staging.internal.haat.delivery/api';
const IMAGE_BASE_URL = 'https://im-staging.haat.delivery/';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📡 Request Headers:', config.headers);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.config?.url}`);
      console.error('📥 Error Response:', error.response.data);
      console.error('📋 Error Headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      console.error('📡 Request Details:', error.request);
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Transform real API data to component-compatible format
export const transformApiDataToComponentFormat = (apiData: any): { categories: Category[] } => {
  console.log('🔄 Transforming API data to component format...');
  
  try {
    const categories: Category[] = [];
    
    if (apiData.marketCategories && Array.isArray(apiData.marketCategories)) {
      apiData.marketCategories.forEach((marketCategory: any, categoryIndex: number) => {
        // Skip hidden categories
        if (marketCategory.hide) {
          console.log(`⏭️ Skipping hidden category: ${marketCategory.name?.['en-US'] || 'Unknown'}`);
          return;
        }
        
        // Extract the real category name
        const categoryName = marketCategory.name?.['en-US'] || marketCategory.name?.ar || marketCategory.name?.he || marketCategory.name?.fr || `Category ${categoryIndex + 1}`;
        
        // Only use fallback if we don't have any real names
        if (!marketCategory.name?.['en-US'] && !marketCategory.name?.ar && !marketCategory.name?.he && !marketCategory.name?.fr) {
          console.log(`⚠️ No real names found for category ${marketCategory.id}, using fallback: "${categoryName}"`);
        } else {
          console.log(`📝 Category ${marketCategory.id}: "${categoryName}" (English: "${marketCategory.name?.['en-US']}", Arabic: "${marketCategory.name?.ar}", Hebrew: "${marketCategory.name?.he}", French: "${marketCategory.name?.fr}")`);
        }
        
        const category: Category = {
          id: marketCategory.id || categoryIndex + 1,
          name: categoryName,
          image: marketCategory.serverImageUrl || marketCategory.smallImageUrl || `categories/category-${categoryIndex + 1}.jpg`,
          subCategories: []
        };
        
        if (marketCategory.marketSubcategories && Array.isArray(marketCategory.marketSubcategories)) {
          marketCategory.marketSubcategories.forEach((marketSubCategory: any, subCategoryIndex: number) => {
            // Skip hidden subcategories
            if (marketSubCategory.hide) {
              console.log(`⏭️ Skipping hidden subcategory: ${marketSubCategory.name?.['en-US'] || 'Unknown'}`);
              return;
            }
            
            // Extract the real subcategory name
            const subCategoryName = marketSubCategory.name?.['en-US'] || marketSubCategory.name?.ar || marketSubCategory.name?.he || marketSubCategory.name?.fr || `Subcategory ${subCategoryIndex + 1}`;
            
            // Only use fallback if we don't have any real names
            if (!marketSubCategory.name?.['en-US'] && !marketSubCategory.name?.ar && !marketSubCategory.name?.he && !marketSubCategory.name?.fr) {
              console.log(`⚠️ No real names found for subcategory ${marketSubCategory.id}, using fallback: "${subCategoryName}"`);
            } else {
              console.log(`  📝 Subcategory ${marketSubCategory.id}: "${subCategoryName}"`);
            }
            
            const subCategory: SubCategory = {
              id: marketSubCategory.id || subCategoryIndex + 1,
              name: subCategoryName,
              categoryId: category.id,
              items: []
            };
            
            if (marketSubCategory.products && Array.isArray(marketSubCategory.products)) {
              marketSubCategory.products.forEach((product: any, productIndex: number) => {
                // Skip hidden products
                if (product.hide) {
                  console.log(`⏭️ Skipping hidden product: ${product.name?.['en-US'] || 'Unknown'}`);
                  return;
                }
                
                // Extract the real product name
                const productName = product.name?.['en-US'] || product.name?.ar || product.name?.he || product.name?.fr || `Product ${productIndex + 1}`;
                
                // Only use fallback if we don't have any real names
                if (!product.name?.['en-US'] && !product.name?.ar && !product.name?.he && !product.name?.fr) {
                  console.log(`⚠️ No real names found for product ${product.id}, using fallback: "${productName}"`);
                } else {
                  console.log(`    📝 Product ${product.id}: "${productName}" - $${product.discountPrice || product.basePrice || 0}`);
                }
                
                const item: Item = {
                  id: product.id || productIndex + 1,
                  name: productName,
                  description: product.description?.['en-US'] || product.description?.ar || product.description?.he || product.description?.fr || '',
                  price: product.discountPrice || product.basePrice || 0,
                  image: product.productImages?.[0]?.serverImageUrl || product.productImages?.[0]?.smallImageUrl || `items/product-${productIndex + 1}.jpg`,
                  subCategoryId: subCategory.id
                };
                
                subCategory.items.push(item);
              });
            }
            
            // Only add subcategory if it has items
            if (subCategory.items.length > 0) {
              category.subCategories.push(subCategory);
              console.log(`✅ Added subcategory: "${subCategory.name}" to category "${category.name}"`);
            }
          });
        }
        
        // Only add category if it has subcategories
        if (category.subCategories.length > 0) {
          categories.push(category);
          console.log(`✅ Added category: "${category.name}" with ${category.subCategories.length} subcategories`);
        }
      });
    }
    
    console.log(`✅ Transformed ${categories.length} categories with data`);
    console.log('📋 Final category names:', categories.map(cat => `"${cat.name}"`));
    return { categories };
  } catch (error) {
    console.error('❌ Error transforming API data:', error);
    throw new Error('Failed to transform API data');
  }
};

export const getMarketDetail = async (marketId: number): Promise<MarketDetail> => {
  try {
    console.log(`🔄 Fetching market details for ID: ${marketId}`);
    const response = await api.get(`/markets/${marketId}`);
    
    // Validate response data
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    console.log(`✅ Successfully fetched market data for ID: ${marketId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch market details for ID: ${marketId}:`, error);
    throw error;
  }
};

export const getCategoryDetail = async (marketId: number, categoryId: number): Promise<CategoryDetail> => {
  try {
    console.log(`🔄 Fetching category details for market: ${marketId}, category: ${categoryId}`);
    console.log(`📡 API URL: ${BASE_URL}/markets/${marketId}/categories/${categoryId}`);
    
    const response = await api.get(`/markets/${marketId}/categories/${categoryId}`);
    
    // Validate response data
    if (!response.data) {
      throw new Error('No category data received from API');
    }
    
    console.log(`✅ Successfully fetched category data for ID: ${categoryId}`);
    console.log('📥 Category data structure:', {
      id: response.data.id,
      name: response.data.name,
      subcategoriesCount: response.data.marketSubcategories?.length || 0,
      productsCount: response.data.productsCount || 0
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch category details for market: ${marketId}, category: ${categoryId}:`, error);
    
    // Log specific error details
    if (error.response) {
      console.error(`📡 HTTP Status: ${error.response.status}`);
      console.error(`📡 Response Data:`, error.response.data);
    } else if (error.request) {
      console.error('📡 No response received from server');
    } else {
      console.error('📡 Request setup error:', error.message);
    }
    
    throw error;
  }
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    console.log('getImageUrl: No image path provided');
    return '';
  }
  
  if (imagePath.startsWith('http')) {
    console.log('getImageUrl: Full URL provided, using as is:', imagePath);
    return imagePath;
  }
  
  const fullUrl = `${IMAGE_BASE_URL}${imagePath}`;
  console.log('getImageUrl: Constructed URL:', fullUrl);
  return fullUrl;
};

// Helper function to check API connectivity
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log('🏥 Checking API health...');
    const response = await api.get('/health', { timeout: 5000 });
    console.log('✅ API is healthy:', response.status);
    return true;
  } catch (error) {
    console.log('❌ API health check failed:', error);
    return false;
  }
};

// Helper function to get API status
export const getApiStatus = () => {
  return {
    baseUrl: BASE_URL,
    imageBaseUrl: IMAGE_BASE_URL,
    timeout: api.defaults.timeout,
    isConfigured: true,
  };
};

export default api; 