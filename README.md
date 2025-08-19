# Haat Food Delivery App 🍽️

A React Native food delivery app built for the Haat React Native Developer Assignment. This app demonstrates advanced React Native skills including complex scrolling behavior, sticky headers, and smooth navigation.

## Features ✨

### 1. Markets List
- **Category Display**: Beautiful grid layout showing food categories
- **Navigation**: Tap any category to navigate to market details
- **Modern UI**: Clean, card-based design with images and descriptions

### 2. Market Detail with Advanced Scrolling
- **Sticky Sub-Category Headers**: Sub-categories stick to the top while scrolling
- **Automatic Category Updates**: Main categories update automatically during scroll
- **Seamless Navigation**: Smooth scrolling between categories and sub-categories
- **Item Visibility**: Items from adjacent categories visible at boundaries (no pagination)

### 3. Technical Implementation
- **React Navigation**: Stack-based navigation between screens
- **TypeScript**: Full type safety throughout the application
- **API Integration**: Ready for Haat delivery API endpoints
- **Responsive Design**: Works on all screen sizes
- **Performance Optimized**: Efficient FlatList with sticky headers

## Requirements Met ✅

- ✅ Markets list with category display
- ✅ Navigation to market detail page
- ✅ Categories, sub-categories, and items display
- ✅ Sticky sub-category headers
- ✅ Automatic category updates during scroll
- ✅ Smooth scrolling behavior
- ✅ Items from adjacent categories visible at boundaries
- ✅ API integration ready (GET: `/markets/4532` and `/markets/4532/categories/{categoryId}`)
- ✅ Image handling with base URL: `https://im-staging.haat.delivery/`

## Installation & Setup 🚀

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Steps
1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start the Development Server**
   ```bash
   yarn start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure 📁

```
Haat/
├── components/           # React Native components
│   ├── MarketsList.tsx  # Markets list screen
│   ├── MarketDetail.tsx # Market detail with advanced scrolling
│   └── LoadingSpinner.tsx # Loading component
├── services/            # API services
│   └── api.ts          # HTTP client and API functions
├── types/               # TypeScript interfaces
│   └── index.ts        # Data type definitions
├── data/                # Mock data for testing
│   └── mockData.ts     # Sample market data
├── App.tsx              # Main app component
└── package.json         # Dependencies and scripts
```

## API Integration 🔌

The app is configured to work with the Haat delivery API:

- **Base URL**: `https://user-new-app-staging.internal.haat.delivery/api`
- **Image Base URL**: `https://im-staging.haat.delivery/`
- **Endpoints**:
  - `GET /markets/4532` - Get market details
  - `GET /markets/4532/categories/{categoryId}` - Get category details

Currently using mock data for development. To switch to real API:
1. Uncomment the API call in `App.tsx`
2. Comment out the mock data import
3. Ensure your device can access the internal API endpoints

## Key Technical Features 🛠️

### Advanced Scrolling Implementation
- **FlatList with Sticky Headers**: Sub-categories stick to the top
- **Scroll Position Tracking**: Automatic category detection during scroll
- **Smooth Animations**: Animated scroll events and transitions
- **Performance Optimization**: Efficient rendering with proper key extraction

### Navigation & State Management
- **React Navigation v6**: Modern navigation with TypeScript support
- **Route Parameters**: Passing selected category IDs between screens
- **State Management**: React hooks for local state management

### UI/UX Design
- **Modern Design Language**: Clean, card-based interface
- **Responsive Layout**: Adapts to different screen sizes
- **Visual Feedback**: Active states, shadows, and smooth interactions
- **Accessibility**: Proper touch targets and readable text

## Testing the App 🧪

1. **Markets List**: View all food categories in a grid layout
2. **Category Navigation**: Tap any category to see market details
3. **Scrolling Behavior**: 
   - Scroll through items to see sticky sub-category headers
   - Notice automatic category tab updates
   - See items from adjacent categories at boundaries
4. **Category Tabs**: Tap category tabs to jump to specific sections

## Future Enhancements 🚀

- **Real-time Updates**: Live order status and inventory
- **Search & Filter**: Find specific items quickly
- **User Authentication**: Login and user profiles
- **Order Management**: Add to cart and checkout flow
- **Push Notifications**: Order updates and promotions
- **Offline Support**: Cache data for offline viewing

## Troubleshooting 🔧

### Common Issues
1. **Metro bundler errors**: Clear cache with `yarn start --clear`
2. **Navigation errors**: Ensure all dependencies are installed
3. **Image loading issues**: Check network connectivity and image URLs

### Development Tips
- Use React Native Debugger for better debugging
- Enable Fast Refresh for faster development
- Test on both iOS and Android for compatibility

## Contributing 🤝

This is a demonstration project for the Haat React Native Developer Assignment. The code showcases:

- Modern React Native development practices
- TypeScript implementation
- Advanced UI/UX patterns
- Performance optimization techniques
- Clean, maintainable code structure

## License 📄

This project is created for demonstration purposes as part of the Haat React Native Developer Assignment.

---

**Built with ❤️ using React Native, TypeScript, and Expo** 