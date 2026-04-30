import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import {
  IconHeart, IconPlus,
  IconMonitor, IconSmartphone, IconShirt, IconGrid,
} from '../../../shared/ui/Icons';
import { StarRating } from '../../home/ui/starRating';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import type { Product } from '../../home/types/home.types';

function CategoryIcon({ cat }: { cat?: string }) {
  const s = 9; const c = colors.text.disabled;
  if (cat === 'Tecnología' || cat === 'Laptops') return <IconMonitor size={s} color={c} />;
  if (cat === 'Accesorios' || cat === 'Móviles') return <IconSmartphone size={s} color={c} />;
  if (cat === 'Moda')   return <IconShirt size={s} color={c} />;
  return <IconGrid size={s} color={c} />;
}

interface ProductGridCardProps {
  product:       Product;
  isFavorite?:   boolean;
  onPress?:      (p: Product) => void;
  onAddToCart?:  (p: Product) => void;
  onToggleFav?:  (id: number) => void;
  animDelay?:    number;
}

export function ProductGridCard({
  product, isFavorite = false,
  onPress, onAddToCart, onToggleFav,
}: ProductGridCardProps) {
  const fmt = (n: number) =>
    `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 0 })}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(product)}
      activeOpacity={0.84}
    >
      {/* Image */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.img}
          resizeMode="cover"
        />

        {/* Fav button */}
        <TouchableOpacity
          style={[styles.fav, isFavorite && styles.favOn]}
          onPress={() => onToggleFav?.(product.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconHeart
            size={13}
            color={isFavorite ? colors.error.default : colors.text.disabled}
            fill={isFavorite ? colors.error.default : 'none'}
            strokeWidth={1.8}
          />
        </TouchableOpacity>

        {/* Badge */}
        {product.badge === 'new' && (
          <View style={[styles.badge, styles.badgeNew]}>
            <Text style={styles.badgeText}>Nuevo</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

        <View style={styles.catRow}>
          <CategoryIcon cat={product.category} />
          <Text style={styles.catText}>
            {product.catalog_type === 'service'
              ? product.payment_frequency_label ?? 'Servicio'
              : product.category ?? 'General'}
          </Text>
        </View>

        {product.catalog_type === 'service' && (
          <Text style={styles.serviceTag}>{product.kind_label ?? 'Servicio'}</Text>
        )}

        {product.rating != null && (
          <View style={styles.starsRow}>
            <StarRating rating={product.rating} size={10} />
            {product.review_count != null && (
              <Text style={styles.reviewText}>({product.review_count})</Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>{fmt(product.list_price)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToCart?.(product)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <IconPlus size={13} color="#fff" strokeWidth={2.2} />
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
    shadowColor: colors.brand[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imgWrap: { height: 140, position: 'relative', backgroundColor: '#F5F7FA' },
  img:     { width: '100%', height: '100%' },

  fav: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  favOn: { borderColor: 'rgba(220,38,38,0.2)', backgroundColor: '#fff' },

  badge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeNew:  { backgroundColor: colors.success.default },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  body: { padding: 10 },
  name: { fontSize: 12.5, fontWeight: '600', color: colors.text.primary, marginBottom: 3 },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 },
  catText: { fontSize: 10, color: colors.text.disabled },
  serviceTag: { fontSize: 9.5, color: colors.brand[600], fontWeight: '700', marginBottom: 6 },

  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 7 },
  reviewText: { fontSize: 9.5, color: colors.text.disabled },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price:  { fontSize: 13.5, fontWeight: '700', color: colors.text.primary },
  addBtn: {
    width: 28, height: 28,
    backgroundColor: colors.brand[600],
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
});
