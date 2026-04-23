import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { IconPlus, IconMonitor, IconSmartphone, IconShirt, IconGrid } from '../../../shared/ui/Icons';
import { StarRating } from '../../home/ui/starRating';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import type { Product } from '../../home/types/home.types';

function CategoryPill({ cat }: { cat?: string }) {
  const s = 9; const c = colors.brand[500];
  let Icon = IconGrid;
  if (cat === 'Tecnología' || cat === 'Laptops') Icon = IconMonitor;
  else if (cat === 'Accesorios' || cat === 'Móviles') Icon = IconSmartphone;
  else if (cat === 'Moda') Icon = IconShirt;

  return (
    <View style={styles.catPill}>
      <Icon size={s} color={c} />
      <Text style={styles.catText}>{cat ?? 'General'}</Text>
    </View>
  );
}

interface ProductListCardProps {
  product:      Product;
  isFavorite?:  boolean;
  onPress?:     (p: Product) => void;
  onAddToCart?: (p: Product) => void;
}

export function ProductListCard({
  product, isFavorite = false, onPress, onAddToCart,
}: ProductListCardProps) {
  const fmt = (n: number) =>
    `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 0 })}`;

  const origPrice = product.discount_percent
    ? product.list_price / (1 - product.discount_percent / 100)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(product)}
      activeOpacity={0.84}
    >
      {/* Image column */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.img}
          resizeMode="cover"
        />
        {product.badge === 'sale' && (
          <View style={[styles.badge, styles.badgeSale]}>
            <Text style={styles.badgeText}>-{product.discount_percent}%</Text>
          </View>
        )}
        {product.badge === 'new' && (
          <View style={[styles.badge, styles.badgeNew]}>
            <Text style={styles.badgeText}>Nuevo</Text>
          </View>
        )}
      </View>

      {/* Content column */}
      <View style={styles.body}>
        {/* Top section */}
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {product.default_code && (
            <Text style={styles.code}>#{product.default_code}</Text>
          )}
          <CategoryPill cat={product.category} />
          {product.catalog_type === 'service' && (
            <Text style={styles.serviceText}>
              {product.payment_frequency_label ?? 'Servicio'}
            </Text>
          )}
          {product.rating != null && (
            <View style={styles.starsRow}>
              <StarRating rating={product.rating} size={10} />
              {product.review_count != null && (
                <Text style={styles.reviewText}>({product.review_count})</Text>
              )}
            </View>
          )}
        </View>

        {/* Footer: price + button */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{fmt(product.list_price)}</Text>
            {origPrice && origPrice > product.list_price && (
              <Text style={styles.origPrice}>{fmt(origPrice)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToCart?.(product)}
          >
            <IconPlus size={12} color="#fff" strokeWidth={2.2} />
            <Text style={styles.addText}>Añadir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    shadowColor: colors.brand[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imgWrap: {
    width: 110, flexShrink: 0,
    position: 'relative',
    backgroundColor: '#F5F7FA',
  },
  img: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', top: 7, left: 7,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeSale: { backgroundColor: colors.error.default },
  badgeNew:  { backgroundColor: colors.success.default },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  body: {
    flex: 1, padding: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  top: { gap: 3 },
  name: {
    fontSize: 13.5, fontWeight: '700',
    color: colors.text.primary, lineHeight: 19, marginBottom: 1,
  },
  code: { fontSize: 10, color: colors.text.disabled, marginBottom: 4 },

  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
    marginBottom: 5,
  },
  catText: { fontSize: 10, fontWeight: '600', color: colors.brand[600] },
  serviceText: { fontSize: 10.5, color: colors.brand[600], fontWeight: '700', marginBottom: 2 },

  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewText: { fontSize: 9.5, color: colors.text.disabled, marginLeft: 2 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price:     { fontSize: 15.5, fontWeight: '800', color: colors.text.primary },
  origPrice: {
    fontSize: 10.5, color: colors.text.disabled,
    textDecorationLine: 'line-through', marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingHorizontal: 10, paddingVertical: 7,
  },
  addText: { fontSize: 11.5, fontWeight: '600', color: '#fff' },
});
