import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../../../app/navigation/types';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { CartScreen } from '../screens/CartScreen';
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
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProductDetails" component={ProductDetailsWrapper} />
      <Stack.Screen name="Cart" component={CartWrapper} />
    </Stack.Navigator>
  );
}

type PDProps = NativeStackScreenProps<ShopStackParamList, 'ProductDetails'>;
function ProductDetailsWrapper({ route, navigation }: PDProps) {
  const product = route.params.productId
    ? getProductById(route.params.productId)
    : null;
  return <ProductDetailsScreen product={product} onBack={() => navigation.goBack()} />;
}

type CartProps = NativeStackScreenProps<ShopStackParamList, 'Cart'>;
function CartWrapper({ navigation }: CartProps) {
  return <CartScreen onBack={() => navigation.goBack()} />;
}

export default ShopNavigator;