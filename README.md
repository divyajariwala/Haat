# Haat Food Delivery App

A beautiful, modern food delivery application built with React Native and Expo, featuring a creative design with grid-based layouts.

## 🎨 Design Features

### Grid System
- **Responsive Grid Layout**: Categories and food items are displayed in a clean 2-column grid
- **Dynamic Spacing**: Automatic spacing calculations based on screen dimensions
- **Consistent Margins**: Proper spacing between grid elements for visual harmony

### Visual Design
- **Gradient Backgrounds**: Beautiful orange-to-yellow gradients throughout the app
- **Modern UI Elements**: Rounded corners, shadows, and smooth animations
- **Food Icons**: Floating food emojis and decorative elements
- **Color Scheme**: Warm, appetizing colors (#FF6B35, #F7931E, #FFD93D)

### Components

#### MarketsList
- Hero header with gradient background
- Search bar with floating design
- Category cards in 2x2 grid layout
- "New" badges on category cards
- Floating food icons for visual appeal

#### MarketDetail
- Enhanced header with cart functionality
- Category tabs for easy navigation
- Food items displayed in responsive grid
- Price tags and action buttons
- Beautiful category headers with gradients

#### LoadingSpinner
- Animated loading screen with rotating logo
- Floating food icons with pulse animations
- Gradient background with wave decorations
- Professional loading experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

## 📱 Features

- **Food Categories**: Browse different food categories
- **Search Functionality**: Search for your favorite foods
- **Grid Layout**: Clean, organized display of categories and items
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Beautiful animations and visual effects
- **Image Integration**: Uses Haat staging API for food images

## 🎯 Grid Configuration

The app uses a sophisticated grid system:

```javascript
const GRID_COLUMNS = 2;
const GRID_SPACING = 16;
const GRID_MARGIN = 20;
const CARD_WIDTH = (width - (GRID_MARGIN * 2) - (GRID_SPACING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;
```

This ensures:
- Consistent spacing between elements
- Responsive card widths
- Proper alignment across different devices
- Professional, organized appearance

## 🖼️ Image Sources

All food images are sourced from the Haat staging API:
- Base URL: `https://im-staging.haat.delivery/`
- Categories: `/categories/[category-name].jpg`
- Items: `/items/[item-name].jpg`

## 🎨 Color Palette

- **Primary Orange**: #FF6B35
- **Secondary Orange**: #F7931E
- **Accent Yellow**: #FFD93D
- **Text Dark**: #2c3e50
- **Text Light**: #7f8c8d
- **Success Green**: #27ae60
- **Error Red**: #FF4757

## 🔧 Technical Details

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Gradients**: Expo Linear Gradient
- **Animations**: React Native Animated API
- **TypeScript**: Full type safety
- **Responsive**: Dynamic sizing based on device dimensions

## 📱 Screenshots

The app features:
- Beautiful gradient headers
- Clean grid layouts
- Modern card designs
- Smooth animations
- Professional typography
- Consistent spacing

## 🚀 Future Enhancements

- [ ] Add to cart functionality
- [ ] User authentication
- [ ] Order tracking
- [ ] Payment integration
- [ ] Push notifications
- [ ] Offline support
- [ ] Dark mode theme

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the 0BSD License.

---

Built with ❤️ for Haat Food Delivery 