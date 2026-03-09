import React from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl,
  Text, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useProductList }          from './hooks/useProductList';
// Re-use the data hook from home (same API, same enrichment)
import { useProducts as useHomeProducts } from '../home/hooks/useHome';
import { ProductsHeader }       from './sections/ProductsHeader';
import { ActiveFiltersStrip }   from './sections/ActiveFiltersStrip';
import { TopNav } from '../navigation/ui/topNav';
import { FilterBottomSheet }    from './sections/FilterBottomSheet';
import { ProductGridCard }      from './ui/ProductGridCard';
import { ProductListCard }      from './ui/ProductListCard';
import { colors }               from '../../shared/theme/colors';
import type { Product }         from '../home/types/home.types';
import { useNavDrawer } from '../navigation/hooks/useNavDrawer';
import { useAuth } from '../auth/hooks/useAuth';

interface ProductsScreenProps {
  onProductPress?: (p: Product) => void;
  onAddToCart?:   (p: Product) => void;
}

export function ProductsScreen({ onProductPress, onAddToCart }: ProductsScreenProps) {
  const {
    products, isLoading, error, refreshing, refresh,
  } = useHomeProducts();

  const { user } = useAuth();
  const {
    query, setQuery,
    filter, pendingFilter, setPending,
    viewMode, setViewMode,
    filterOpen,
    results, activeFilters,
    totalCount,
    openFilter, closeFilter, applyFilter, resetFilter,
    clearAllFilters, removeFilter,
    toggleFavorite, isFavorite,
  } = useProductList(products);

  const {
      leftOpen,
      rightOpen,
      openLeft,
      openRight,
      closeAll,
    } = useNavDrawer();
  // ── Render cards ──────────────────────────────────────────────

  const renderGrid = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.gridItem}>
      <ProductGridCard
        product={item}
        isFavorite={isFavorite(item.id)}
        onPress={onProductPress}
        onAddToCart={onAddToCart}
        onToggleFav={toggleFavorite}
      />
    </View>
  );

  const renderList = ({ item }: { item: Product }) => (
    <ProductListCard
      product={item}
      isFavorite={isFavorite(item.id)}
      onPress={onProductPress}
      onAddToCart={onAddToCart}
    />
  );

  // ── Empty / error states ──────────────────────────────────────

  const EmptyState = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Sin resultados</Text>
      <Text style={styles.emptySub}>
        Intenta con otro término o ajusta los filtros
      </Text>
      {activeFilters.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
          <Text style={styles.clearBtnText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No se pudo cargar</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGrid = viewMode === 'grid';

  return (
    <View style={styles.root}>

        <TopNav
            user={user}
            onMenuPress={openLeft}
            onCartPress={openRight}
            />

      {/* ── Static header ── */}
      <ProductsHeader
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onCategoryChange={(id) =>
          setPending(p => ({ ...p, category: id }))
        }
        viewMode={viewMode}
        onViewChange={setViewMode}
        onFilterPress={openFilter}
        resultCount={results.length}
        totalCount={totalCount}
      />

      {/* ── Active filter tags ── */}
      <ActiveFiltersStrip
        filters={activeFilters}
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />

      {/* ── Product list / grid ── */}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        numColumns={isGrid ? 2 : 1}
        key={isGrid ? 'grid' : 'list'}   // force re-render on mode change
        renderItem={isGrid ? renderGrid : renderList}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listEmpty,
        ]}
        columnWrapperStyle={isGrid ? styles.row : undefined}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      />

      {/* ── Filter bottom sheet ── */}
      <FilterBottomSheet
        open={filterOpen}
        pending={pendingFilter}
        onChange={(next) => setPending(p => ({ ...p, ...next }))}
        onApply={applyFilter}
        onReset={resetFilter}
        onClose={closeFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.primary },

  // List layout
  listContent: { padding: 14, gap: 12, paddingBottom: 24 },
  listEmpty:   { flex: 1 },
  row:         { gap: 12 },
  gridItem:    { flex: 1 },

  // States
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.primary, gap: 10, padding: 32,
  },
  loadText:   { fontSize: 14, color: colors.text.tertiary },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  errorSub:   { fontSize: 13, color: colors.text.tertiary, textAlign: 'center' },
  retryBtn: {
    marginTop: 8, backgroundColor: colors.brand[600],
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 11,
  },
  retryText: { color: '#fff', fontSize: 13.5, fontWeight: '600' },

  // Empty
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 60,
  },
  emptyIcon:  { fontSize: 44, marginBottom: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  emptySub:   { fontSize: 13, color: colors.text.tertiary, textAlign: 'center', lineHeight: 19 },
  clearBtn: {
    marginTop: 10, backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[100],
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9,
  },
  clearBtnText: { fontSize: 13, fontWeight: '600', color: colors.brand[600] },
});