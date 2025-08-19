import axios from 'axios';
import { MarketDetail, CategoryDetail } from '../types';

const BASE_URL = 'https://user-new-app-staging.internal.haat.delivery/api';
const IMAGE_BASE_URL = 'https://im-staging.haat.delivery/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const getMarketDetail = async (marketId: number): Promise<MarketDetail> => {
  try {
    const response = await api.get(`/markets/${marketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market detail:', error);
    throw error;
  }
};

export const getCategoryDetail = async (marketId: number, categoryId: number): Promise<CategoryDetail> => {
  try {
    const response = await api.get(`/markets/${marketId}/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category detail:', error);
    throw error;
  }
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${IMAGE_BASE_URL}${imagePath}`;
};

export default api; 