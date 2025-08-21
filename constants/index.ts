// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://user-new-app-staging.internal.haat.delivery/api',
  IMAGE_BASE_URL: 'https://im-staging.haat.delivery/',
  TIMEOUT: 5000,
  MARKET_ID: 4532,
} as const;

// Grid Layout Constants
export const GRID_CONFIG = {
  COLUMNS: 2,
  SPACING: 16,
  MARGIN: 16,
  MARGIN_LARGE: 20,
} as const;

// Animation Constants
export const ANIMATION_CONFIG = {
  PULSE_DURATION: 1000,
  ROTATE_DURATION: 3000,
  FADE_DURATION: 800,
  SCROLL_DURATION_MIN: 300,
  SCROLL_DURATION_MAX: 800,
  SCROLL_DISTANCE_FACTOR: 2,
} as const;

// Scroll Constants
export const SCROLL_CONFIG = {
  THROTTLE_THRESHOLD: 50,
  VIEWPORT_HEIGHT: 800,
  CATEGORY_HEADER_HEIGHT: 120,
  SUBCATEGORY_HEADER_HEIGHT: 80,
  ITEM_ROW_HEIGHT: 200,
  TAB_WIDTH_CATEGORY: 120,
  TAB_WIDTH_SUBCATEGORY: 100,
  CONTAINER_WIDTH_CATEGORY: 300,
  CONTAINER_WIDTH_SUBCATEGORY: 250,
} as const;

// FlatList Performance Constants
export const FLATLIST_CONFIG = {
  INITIAL_NUM_TO_RENDER: 3,
  MAX_TO_RENDER_PER_BATCH: 5,
  WINDOW_SIZE: 5,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
  SCROLL_EVENT_THROTTLE: 16,
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#FF6B35',
  SECONDARY: '#F7931E',
  ACCENT: '#FFD93D',
  WHITE: '#fff',
  BLACK: '#000',
  GRAY: {
    LIGHT: '#f8f9fa',
    MEDIUM: '#e1e5e9',
    DARK: '#666',
    DARKER: '#333',
  },
  BACKGROUND: '#f8f9fa',
  SHADOW: 'rgba(0,0,0,0.4)',
  GRADIENT: {
    PRIMARY: ['#FF6B35', '#F7931E'],
    PRIMARY_EXTENDED: ['#FF6B35', '#F7931E', '#FFD93D'],
    CATEGORY_ACTIVE: ['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.08)'],
    CATEGORY_INACTIVE: ['rgba(255,107,53,0.1)', 'rgba(255,107,53,0.05)'],
  },
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  SM: 12,
  MD: 16,
  LG: 20,
  XL: 22,
  CIRCLE: 50,
} as const;

// Font Sizes
export const FONT_SIZE = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 22,
  XXXL: 28,
} as const;

// Font Weights
export const FONT_WEIGHT = {
  NORMAL: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
} as const;

// Shadow Styles
export const SHADOW_STYLES = {
  SMALL: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  LARGE: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// Header Heights
export const HEADER_HEIGHTS = {
  MARKET: 70,
  CONTENT_PADDING: 40,
  BACK_BUTTON: 44,
  CART_BUTTON: 44,
} as const;

// Item Card Dimensions
export const ITEM_CARD = {
  MIN_HEIGHT: 320,
  IMAGE_HEIGHT: 150,
  INFO_MIN_HEIGHT: 140,
  NAME_MIN_HEIGHT: 40,
  DESCRIPTION_MIN_HEIGHT: 36,
  BUTTON_MIN_HEIGHT: 44,
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  DEFAULT: 'Loading...',
  MARKET_DATA: 'Loading Haat Food Delivery...',
  CATEGORY_DETAILS: 'Loading category details...',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  MARKET_DATA_FAILED: 'Failed to load market data. Please try again.',
  MARKET_NOT_FOUND: 'Market not found. Please check the market ID.',
  SERVER_ERROR: 'Server error. Please try again later.',
  REQUEST_FAILED: 'Request failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_LOAD_FAILED: 'Failed to load category details',
  SERVER_ERROR_CATEGORY: 'Server error loading category',
  REQUEST_FAILED_CATEGORY: 'Request failed loading category',
  NETWORK_ERROR_CATEGORY: 'Network error loading category',
} as const;

// Placeholder Text
export const PLACEHOLDER_TEXT = {
  SEARCH: 'Search for your favorite food...',
  MARKET_TITLE: 'Haat Market',
  HERO_TITLE: 'Haat',
  HERO_SUBTITLE: 'Delicious Food Delivered',
  HERO_DESCRIPTION: 'Discover amazing flavors from the best restaurants in town',
} as const;

// Emoji Icons
export const EMOJI_ICONS = {
  FOOD: '🍽️',
  PIZZA: '🍕',
  BURGER: '🍔',
  NOODLES: '🍜',
  CAKE: '🍰',
  SEARCH: '🔍',
  CART: '🛒',
  VISIBLE: '👁️',
  BACK: '←',
} as const;

// Timeouts
export const TIMEOUTS = {
  SCROLL_DELAY: 100,
  SCROLL_DELAY_LONG: 200,
  SCROLL_DELAY_EXTENDED: 300,
  SCROLL_DELAY_SMOOTH: 400,
  SCROLL_DELAY_LAYOUT: 500,
  SCROLL_DELAY_READY: 600,
} as const;
