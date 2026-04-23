import React from 'react';
import {
  View, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, Text, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/hooks/useAuth';
import { useCart } from '../cart/hooks/useCart';
import { useProducts, useProductSearch } from './hooks/useHome';
import { HeroSection } from './sections/hero';
import { CategoriesSection } from './sections/categories';
import { FeaturedSection } from './sections/featured';
import { PromoBanner } from './sections/promo';
import { ProductsGridSection } from './sections/gird';
import { colors } from '../../shared/theme/colors';
import type { Product } from './types/home.types';
import { TopNav } from '../navigation/ui/topNav';
import { LeftDrawer } from '../navigation/ui/leftDrawer';
import { RightDrawer } from '../navigation/ui/rightDrawer';
import { BottomNav } from '../navigation/ui/bottomNav';
import { DrawerOverlay } from '../navigation/ui/overLay';

import { useNavDrawer } from '../navigation/hooks/useNavDrawer';
import { useBottomTabs } from '../navigation/hooks/useBottomTabs';

interface HomeScreenProps {
  onProductPress?: (p: Product) => void;
  onSeeAllProducts?: () => void;
  onAddToCart?: (p: Product) => void;
}

export function HomeScreen({
  onProductPress,
  onSeeAllProducts,
  onAddToCart,
}: HomeScreenProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { products, featured, isLoading, error, refreshing, refresh, toggleFavorite } = useProducts();
  const { query, setQuery, activeCategory, setActive, filtered } = useProductSearch(products);

  const isSearching = query.trim().length > 0;
  const {
    leftOpen,
    rightOpen,
    openLeft,
    openRight,
    closeAll,
  } = useNavDrawer();

  const {
    activeTab,
    setActiveTab,
  } = useBottomTabs();

  const handleNavigate = (id: string) => {
    switch (id) {
      case 'home':
        router.push('/');
        break;
      case 'products':
        router.push('/products');
        break;
      case 'cart':
        router.push('/cart');
        break;
      case 'orders':
        router.push('/orders');
        break;
      case 'wishlist':
        router.push('/products'); // TODO: create wishlist page
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'help':
        // TODO: help center
        break;
      case 'contact':
        // TODO: contact page
        break;
      case 'config':
        router.push('/profile');
        break;
      case 'cat-tech':
        router.push({ pathname: '/products', params: { category: 'tech' } });
        break;
      case 'cat-clothing':
        router.push({ pathname: '/products', params: { category: 'clothing' } });
        break;
      case 'cat-services':
        router.push({ pathname: '/products', params: { category: 'services' } });
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };
  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>No se pudo conectar</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
  <View style={styles.root}>

      {/* 🔝 Top Navigation */}
      <TopNav
        user={user}
        onMenuPress={openLeft}
        onCartPress={() => router.push('/cart')}
        onAvatarPress={openRight}
        cartCount={totalItems}
      />

      {/* 📜 Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }} // espacio para BottomNav
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        <HeroSection onPress={onSeeAllProducts} />
        <CategoriesSection active={activeCategory} onSelect={setActive} />

        {!isSearching && (
          <FeaturedSection
            products={featured}
            onProductPress={onProductPress}
            onAddToCart={onAddToCart}
            onSeeAll={onSeeAllProducts}
          />
        )}

        {!isSearching && <PromoBanner />}

        <ProductsGridSection
          products={filtered}
          onProductPress={onProductPress}
          onAddToCart={onAddToCart}
          onToggleFav={toggleFavorite}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

     
      {/* 📂 Drawers */}
      <DrawerOverlay visible={leftOpen || rightOpen} onPress={closeAll} />
      <LeftDrawer open={leftOpen} onClose={closeAll} onNavigate={handleNavigate} onLogout={handleLogout} />
      <RightDrawer open={rightOpen} onClose={closeAll} onNavigate={handleNavigate} onLogout={handleLogout} />

      {/* 🌑 Overlay */}
      <DrawerOverlay visible={leftOpen || rightOpen} onPress={closeAll} />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.primary },
  loadingScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.primary, gap: 12,
  },
  loadingText: { fontSize: 14, color: colors.text.tertiary },
  errorScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.primary, padding: 32, gap: 8,
  },
  errorEmoji: { fontSize: 42, marginBottom: 6 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  errorSub: { fontSize: 13, color: colors.text.tertiary, textAlign: 'center', lineHeight: 19 },
  retryBtn: {
    marginTop: 12, backgroundColor: colors.brand[600],
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 11,
  },
  retryText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
});
