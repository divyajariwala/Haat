import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MarketDetail as MarketDetailType } from '../types';

interface MarketHeaderProps {
  market: MarketDetailType;
  onBack: () => void;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ market, onBack }) => {
  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.backArrow} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.marketTitle} numberOfLines={1}>
            {'Haat Market'}
          </Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>🛒</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: -50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  marketTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  cartButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});

export default MarketHeader;
