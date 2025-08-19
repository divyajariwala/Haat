import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MarketsList from './components/MarketsList';
import MarketDetail from './components/MarketDetail';
import LoadingSpinner from './components/LoadingSpinner';
import { getMarketDetail } from './services/api';
import { MarketDetail as MarketDetailType, Category } from './types';
import { mockMarketData } from './data/mockData';

export type RootStackParamList = {
  MarketsList: undefined;
  MarketDetail: { marketId: number; selectedCategoryId?: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [marketData, setMarketData] = useState<MarketDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, use mock data. Later we can switch to real API
      // const data = await getMarketDetail(4532);
      const data = mockMarketData;
      
      setMarketData(data);
    } catch (err) {
      setError('Failed to load market data. Please try again.');
      console.error('Error loading market data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Haat Food Delivery..." />;
  }

  if (error || !marketData) {
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
                <MarketsList
                  categories={[]}
                  onCategoryPress={() => {}}
                />
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
                categories={marketData.categories}
                onCategoryPress={(category: Category) => {
                  navigation.navigate('MarketDetail', {
                    marketId: marketData.id,
                    selectedCategoryId: category.id,
                  });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MarketDetail">
            {({ navigation, route }) => (
              <MarketDetail
                market={marketData}
                selectedCategoryId={route.params?.selectedCategoryId}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
