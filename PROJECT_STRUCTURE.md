# Haat Food Delivery App - Project Structure

## 📁 Folder Organization

### `/screens` - Main Screen Components
Contains the main screen components that represent full pages in the app.

- **`MarketsList.tsx`** - Main screen showing list of food markets/categories
- **`MarketDetail.tsx`** - Detailed view of a specific market with categories and items
- **`index.ts`** - Exports all screen components for clean imports

### `/components` - Reusable UI Components
Contains reusable UI components that can be used across different screens.

- **`LoadingSpinner.tsx`** - Animated loading component with food icons
- **`ImageWithFallback.tsx`** - Image component with error handling and fallback
- **`MarketHeader.tsx`** - Header component for market screens with gradient background
- **`CategoryTabs.tsx`** - Horizontal scrollable category navigation tabs
- **`SubCategoryTabs.tsx`** - Horizontal scrollable subcategory navigation tabs
- **`CategoryHeader.tsx`** - Header component for category sections
- **`SubCategoryHeader.tsx`** - Header component for subcategory sections
- **`ItemCard.tsx`** - Individual item display card
- **`ItemsGrid.tsx`** - Grid layout for displaying multiple items
- **`index.ts`** - Exports all reusable components for clean imports

### `/types` - TypeScript Type Definitions
Contains all TypeScript interfaces and type definitions.

- **`index.ts`** - All app types including API types and legacy types

### `/constants` - App Constants
Contains all application constants, configuration values, and reusable values.

- **`index.ts`** - Centralized constants including:
  - API configuration
  - Grid layout settings
  - Animation parameters
  - Scroll behavior constants
  - Color schemes
  - Spacing values
  - Font configurations
  - Shadow styles
  - Error messages
  - Loading messages
  - Placeholder text
  - Emoji icons
  - Timeout values

### `/services` - API and Business Logic
Contains API calls and business logic functions.

- **`api.ts`** - API service functions and data transformation logic

### `/data` - Mock Data and Static Data
Contains mock data and static data files.

- **`mockData.ts`** - Mock data for development and testing

### `/assets` - Static Assets
Contains images, icons, and other static assets.

## 🔄 Import Pattern

### Screen Imports
```typescript
import { MarketsList, MarketDetail } from './screens';
```

### Component Imports
```typescript
import { LoadingSpinner, ImageWithFallback } from './components';
```

### Constants Imports
```typescript
import { COLORS, SPACING, API_CONFIG } from './constants';
```

## 🎯 Benefits of This Structure

1. **Separation of Concerns**: Screens and components are clearly separated
2. **Reusability**: Components can be easily reused across different screens
3. **Maintainability**: Easier to find and update specific functionality
4. **Scalability**: Easy to add new screens and components
5. **Clean Imports**: Index files provide clean, organized imports
6. **Team Development**: Different developers can work on different areas
7. **Testing**: Components can be tested independently
8. **Centralized Constants**: All app constants are in one place for easy management
9. **Consistent Values**: Ensures consistent spacing, colors, and behavior across the app
10. **Easy Configuration**: Simple to update app-wide settings and styling

## 📱 Screen Flow

```
MarketsList → MarketDetail
    ↓              ↓
Categories    SubCategories
    ↓              ↓
SubCategories    Items
    ↓
Items
```

## 🛠️ Development Guidelines

1. **New Screens**: Add to `/screens` folder and export from `index.ts`
2. **New Components**: Add to `/components` folder and export from `index.ts`
3. **Component Props**: Use TypeScript interfaces for all component props
4. **Styling**: Keep styles within each component file
5. **State Management**: Use React hooks for local state
6. **API Calls**: Use services folder for all external data fetching
7. **Types**: Define all types in `/types` folder
8. **Constants**: Use centralized constants from `/constants` folder instead of hardcoded values
9. **Colors & Spacing**: Always use `COLORS` and `SPACING` constants for consistency
10. **Error Messages**: Use predefined error messages from `ERROR_MESSAGES` constants

## 🔧 Adding New Features

### To add a new screen:
1. Create component in `/screens` folder
2. Export from `/screens/index.ts`
3. Add to navigation in `App.tsx`

### To add a new reusable component:
1. Create component in `/components` folder
2. Export from `/components/index.ts`
3. Import and use in screens as needed
