import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useProductDetail } from './hooks/useProductDetail';
import { productDetailTheme as t } from './theme/productDetail.theme';

import { AddToCartBar }      from './ui/AddToCartBar';
import { ColorSizeSelector } from './sections/ColorSizeSelector';
import { ImageGallery }      from './sections/ImageGallery';
import { ProductInfo }       from './sections/ProductInfo';
import { ReviewsSection }    from './sections/ReviewsSection';
import { useAddToCart }      from '../cart/hooks/useAddToCart';
import { IconChevronRight, IconShoppingBag } from '../../shared/ui/Icons';

type Props = {
  productId?: number | null;
  navigation?: { goBack: () => void };
};

export function ProductDetailPage({ productId = null, navigation }: Props) {
  const router = useRouter(); // 👈

  const {
    product,
    loading,
    error,
    selectedImage,   setSelectedImage,
    selectedColor,   setSelectedColor,
    selectedSize,    setSelectedSize,
    quantity,
    incrementQty,    decrementQty,
    isWishlisted,    toggleWishlist,
    addToCart: enqueueDetailCart,
    cartAdded,
    discountedPrice,
  } = useProductDetail(productId);

  const { add } = useAddToCart();

  const handleAddToCart = useCallback(() => {
    add({ product, quantity, color: selectedColor, size: selectedSize });
    enqueueDetailCart();
  }, [add, product, quantity, selectedColor, selectedSize, enqueueDetailCart]);

  // 👈 navega al carrito sin recargar la página
  const handleGoToCart = useCallback(() => {
    router.push('/(tabs)/cart');
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={s.safeLoading}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Text style={s.loadingText}>Cargando producto...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={t.colors.bgCard} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
          style={s.headerBtn}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <IconChevronRight size={20} color={t.colors.textPrimary} strokeWidth={2.2} />
          </View>
        </TouchableOpacity>

        <Text style={s.headerTitle} numberOfLines={1}>Product</Text>

        {/* ✅ Ahora navega al carrito correctamente */}
        <TouchableOpacity
          onPress={handleGoToCart}
          activeOpacity={0.75}
          style={s.headerBtn}
        >
          <IconShoppingBag size={20} color={t.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={s.errorBanner}>
          <Text style={s.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} bounces>
        <ImageGallery
          images={product.images}
          selectedIndex={selectedImage}
          onSelect={setSelectedImage}
        />
        <ProductInfo
          product={product}
          isWishlisted={isWishlisted}
          onToggleWishlist={toggleWishlist}
        />
        <View style={s.divider} />
        <ColorSizeSelector
          colors={product.colors}
          sizes={product.sizes}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onColorSelect={setSelectedColor}
          onSizeSelect={setSelectedSize}
        />
        <View style={s.divider} />
        
        <ReviewsSection productId={productId} />
      </ScrollView>

      <AddToCartBar
        quantity={quantity}
        onIncrement={incrementQty}
        onDecrement={decrementQty}
        onAddToCart={handleAddToCart}
        cartAdded={cartAdded}
        price={discountedPrice}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: t.colors.bgCard },
  safeLoading: {
    flex: 1,
    backgroundColor: t.colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: { fontSize: t.font.md, color: t.colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderLight,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: t.font.lg,
    fontWeight: '700',
    color: t.colors.textPrimary,
    letterSpacing: 0.2,
    maxWidth: '55%',
  },
  errorBanner: {
    backgroundColor: t.colors.errorSoft,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.error,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.sm,
  },
  errorBannerText: { color: t.colors.error, fontSize: t.font.sm, fontWeight: '600' },
  scroll:  { flex: 1, backgroundColor: t.colors.bgMain },
  divider: {
    height: 1,
    backgroundColor: t.colors.borderLight,
    marginHorizontal: t.spacing.xl,
    marginVertical: t.spacing.sm,
  },
});