import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getImageUrl } from '../services/api';

interface ImageWithFallbackProps {
  imagePath: string;
  style: any;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ imagePath, style }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (imageError) {
    return (
      <View style={[style, { backgroundColor: '#f1f3f4', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 32 }}>🍽️</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getImageUrl(imagePath) }}
      style={style}
      resizeMode="cover"
      onLoadStart={() => setImageLoading(true)}
      onLoadEnd={() => setImageLoading(false)}
      onError={() => setImageError(true)}
    />
  );
};

export default ImageWithFallback;
