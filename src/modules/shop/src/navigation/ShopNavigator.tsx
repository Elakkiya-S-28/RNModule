import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../../../app/navigation/types';
import { ProductListScreen } from '../container/ProductListScreen';
import { ProductDetailsScreen } from '../container/ProductDetailsScreen';
import { CartScreen } from '../container/CartScreen';
import { WishlistScreen } from '../container/WishlistScreen';
import { getProductById } from '../services/productRepo';
import { Product } from '../types/shop';

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProductList">
        {({ navigation }) => (
          <ProductListScreen
            onProductPress={(p: Product) =>
              navigation.navigate('ProductDetails', { productId: p.id })
            }
            onCartPress={() => navigation.navigate('Cart')}
            onWishlistPress={() => navigation.navigate('Wishlist')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProductDetails" component={ProductDetailsWrapper} />
      <Stack.Screen name="Cart" component={CartWrapper} />
      <Stack.Screen name="Wishlist" component={WishlistWrapper} />
    </Stack.Navigator>
  );
}

type PDProps = NativeStackScreenProps<ShopStackParamList, 'ProductDetails'>;
function ProductDetailsWrapper({ route, navigation }: PDProps) {
  const product = route.params.productId ? getProductById(route.params.productId) : null;
  return <ProductDetailsScreen product={product} onBack={() => navigation.goBack()} />;
}

type CartProps = NativeStackScreenProps<ShopStackParamList, 'Cart'>;
function CartWrapper({ navigation }: CartProps) {
  return <CartScreen onBack={() => navigation.goBack()} />;
}

type WishProps = NativeStackScreenProps<ShopStackParamList, 'Wishlist'>;
function WishlistWrapper({ navigation }: WishProps) {
  return (
    <WishlistScreen
      onBack={() => navigation.goBack()}
      onProductPress={p => navigation.navigate('ProductDetails', { productId: p.id })}
    />
  );
}

export default ShopNavigator;
