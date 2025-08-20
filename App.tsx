import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MarketsList from './components/MarketsList';
import MarketDetail from './components/MarketDetail';
import LoadingSpinner from './components/LoadingSpinner';
import { getMarketDetail, transformApiDataToComponentFormat } from './services/api';
import { MarketDetail as MarketDetailType, Category } from './types';
import { mockMarketData } from './data/mockData';

export type RootStackParamList = {
  MarketsList: undefined;
  MarketDetail: { marketId: number; selectedCategoryId?: number; categories: Category[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [marketData, setMarketData] = React.useState<MarketDetailType | null>(null);
  const [transformedCategories, setTransformedCategories] = React.useState<Category[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  React.useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async (isRetry: boolean = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      console.log('🔄 Fetching market data from Haat API...');
      const apiData = await getMarketDetail(4532);
      console.log('✅ API call successful, transforming data...');
      
      // Transform the real API data to component-compatible format
      const transformed = transformApiDataToComponentFormat(apiData);
      console.log('✅ Data transformation successful:', transformed);
      
      setMarketData(apiData);
      setTransformedCategories(transformed.categories);
      
    } catch (err: any) {
      console.error('❌ Error loading market data:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to load market data. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 404) {
          errorMessage = 'Market not found. Please check the market ID.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.status >= 400) {
          errorMessage = `Request failed (${err.response.status}). Please try again.`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        // Other error
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data...');
      setMarketData(mockMarketData as any);
      setTransformedCategories(mockMarketData.categories);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    loadMarketData(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Haat Food Delivery..." />;
  }

  if (error && !marketData) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="MarketsList">
              {() => (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
                  <Text style={styles.errorMessage}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>
                      {isRetrying ? '🔄 Retrying...' : '🔄 Retry'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.fallbackText}>
                    Using offline data for now
                  </Text>
                </View>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MarketsList">
            {({ navigation }) => (
              <MarketsList
                categories={transformedCategories}
                onCategoryPress={(category: Category) => {
                  navigation.navigate('MarketDetail', {
                    marketId: marketData?.id || 4532,
                    selectedCategoryId: category.id,
                    categories: transformedCategories,
                  });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MarketDetail">
            {({ navigation, route }) => (
              <MarketDetail
                market={marketData!}
                selectedCategoryId={route.params?.selectedCategoryId}
                categories={route.params?.categories || []}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
});
