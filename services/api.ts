import axios from 'axios';
import { MarketDetail, CategoryDetail, Category, SubCategory, Item } from '../types';
import { API_CONFIG } from '../constants';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transform real API data to component-compatible format
export const transformApiDataToComponentFormat = (apiData: any): { categories: Category[] } => {
  try {
    const categories: Category[] = [];
    
    if (apiData.marketCategories && Array.isArray(apiData.marketCategories)) {
      apiData.marketCategories.forEach((marketCategory: any, categoryIndex: number) => {
        // Skip hidden categories
        if (marketCategory.hide) return;
        
        // Extract the real category name
        const categoryName = marketCategory.name?.['en-US'] || marketCategory.name?.ar || marketCategory.name?.he || marketCategory.name?.fr || `Category ${categoryIndex + 1}`;
        
        const category: Category = {
          id: marketCategory.id || categoryIndex + 1,
          name: categoryName,
          image: marketCategory.serverImageUrl || marketCategory.smallImageUrl || `categories/category-${categoryIndex + 1}.jpg`,
          subCategories: []
        };
        
        if (marketCategory.marketSubcategories && Array.isArray(marketCategory.marketSubcategories)) {
          marketCategory.marketSubcategories.forEach((marketSubCategory: any, subCategoryIndex: number) => {
            // Skip hidden subcategories
            if (marketSubCategory.hide) return;
            
            // Extract the real subcategory name
            const subCategoryName = marketSubCategory.name?.['en-US'] || marketSubCategory.name?.ar || marketSubCategory.name?.he || marketSubCategory.name?.fr || `Subcategory ${subCategoryIndex + 1}`;
            
            const subCategory: SubCategory = {
              id: marketSubCategory.id || subCategoryIndex + 1,
              name: subCategoryName,
              categoryId: category.id,
              items: []
            };
            
            if (marketSubCategory.products && Array.isArray(marketSubCategory.products)) {
              marketSubCategory.products.forEach((product: any, productIndex: number) => {
                // Skip hidden products
                if (product.hide) return;
                
                // Extract the real product name
                const productName = product.name?.['en-US'] || product.name?.ar || product.name?.he || product.name?.fr || `Product ${productIndex + 1}`;
                
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
            }
          });
        }
        
        // Only add category if it has subcategories
        if (category.subCategories.length > 0) {
          categories.push(category);
        }
      });
    }
    
    return { categories };
  } catch (error) {
    throw new Error('Failed to transform API data');
  }
};

export const getMarketDetail = async (marketId: number): Promise<MarketDetail> => {
  try {
    const response = await api.get(`/markets/${marketId}`);
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryDetail = async (marketId: number, categoryId: number): Promise<CategoryDetail> => {
  try {
    const response = await api.get(`/markets/${marketId}/categories/${categoryId}`);
    
    if (!response.data) {
      throw new Error('No category data received from API');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return '';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${API_CONFIG.IMAGE_BASE_URL}${imagePath}`;
};

// Helper function to check API connectivity
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Helper function to get API status
export const getApiStatus = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    imageBaseUrl: API_CONFIG.IMAGE_BASE_URL,
    timeout: api.defaults.timeout,
    isConfigured: true,
  };
};

export default api;