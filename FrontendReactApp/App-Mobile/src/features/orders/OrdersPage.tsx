import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/hooks/useAuth';
import { useOrders } from './hooks/useOrders';
import { ordersTheme as t } from './theme/orders.theme';
import { OrdersHeaderSection } from './sections/OrdersHeaderSection';
import { OrdersFilterSection } from './sections/OrdersFilterSection';
import { OrdersListSection } from './sections/OrdersListSection';
import { TopNav } from '../../features/navigation/ui/topNav';
import type { Order } from './types/orders.types';
import { LeftDrawer } from '../navigation/ui/leftDrawer';
import { RightDrawer } from '../navigation/ui/rightDrawer';
import { DrawerOverlay } from '../navigation/ui/overLay';
import { OrderDetailModal } from './ui/OrderDetailModal';
import { useNavDrawer } from '../navigation/hooks/useNavDrawer';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import * as Sharing from 'expo-sharing';

const BASE_URL = (process.env.EXPO_PUBLIC_ODOO_URL ?? 'https://jwfn4vcd-8079.use2.devtunnels.ms/').replace(/\/+$/, '');

type Props = {
  onMenuPress: () => void;
  onSearchPress: () => void;
  onCartPress: () => void;
  onAvatarPress: () => void;
  cartCount?: number;
  userInitials?: string;
};

export function OrdersPage({
  onMenuPress,
  onSearchPress,
  onCartPress,
  onAvatarPress,
  cartCount = 0,
  userInitials = 'U',
}: Props) {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    orders,
    totalOrders,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    cancelOrder,
  } = useOrders();

  const {
    leftOpen,
    rightOpen,
    openLeft,
    openRight,
    closeAll,
  } = useNavDrawer();

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
        router.push('/products');
        break;
      case 'profile':
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

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleMenuPress = useCallback(() => {
    openLeft();
    onMenuPress();
  }, [openLeft, onMenuPress]);

  const handleCartPress = useCallback(() => {
    router.push('/cart');
  }, [router]);

  const handleOrderPress = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleShare = useCallback(async () => {
    if (!selectedOrder) return;
    try {
      await Share.share({
        title: `Pedido ${selectedOrder.reference}`,
        message: `Pedido ${selectedOrder.reference} - Total $${selectedOrder.total.toFixed(2)}${
          selectedOrder.invoice?.reference ? `\nFactura: ${selectedOrder.invoice.reference}` : ''
        }`,
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo compartir el pedido.');
    }
  }, [selectedOrder]);

  const handleDownloadInvoice = useCallback(async () => {
    if (!selectedOrder) return;
    if (!selectedOrder.invoice) {
      Alert.alert('Factura no disponible', 'Este pedido aún no tiene factura asociada.');
      return;
    }
    const invoiceUrl = `${BASE_URL}/api/pos/order/${selectedOrder.id}/invoice`;
    try {
      const response = await fetch(invoiceUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('No se pudo descargar la factura');
      }

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `factura-${selectedOrder.reference ?? selectedOrder.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const safeReference =
        selectedOrder.reference && selectedOrder.reference.trim() !== ''
          ? selectedOrder.reference
          : selectedOrder.id;

      const cleanReference = String(safeReference).replace(/[^\w\d-_]/g, '_');
      const filename = `factura-${cleanReference}.pdf`;
      if (!FileSystem.documentDirectory) {
        throw new Error('No document directory available');
      }
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const base64Encoding =
        FileSystem.EncodingType?.Base64 ??
        FileSystem.EncodingType?.BASE64 ??
        'base64';
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: base64Encoding });
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo descargar la factura.');
    }
  }, [selectedOrder]);

  const handleCancelOrder = useCallback(() => {
    if (!selectedOrder) return;
    Alert.alert(
      'Cancelar pedido',
      '¿Estás seguro de que deseas cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            const result = await cancelOrder(selectedOrder.id);
            setIsCancelling(false);
            if (result.ok) {
              setSelectedOrder((prev) =>
                prev ? { ...prev, status: 'cancelled' } : prev,
              );
              Alert.alert('Pedido cancelado', 'Hemos marcado el pedido como cancelado.');
            } else {
              Alert.alert('Error', result.error ?? 'No se pudo cancelar el pedido.');
            }
          },
        },
      ],
    );
  }, [cancelOrder, selectedOrder]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar hidden barStyle="dark-content" backgroundColor={t.colors.bgCard} />

      <TopNav
        cartCount={cartCount}
        onMenuPress={handleMenuPress}
        onSearchPress={onSearchPress}
        onCartPress={handleCartPress}
        onAvatarPress={onAvatarPress}
        userInitials={userInitials}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <OrdersHeaderSection total={totalOrders} />

        <OrdersFilterSection
          active={activeFilter}
          search={search}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearch}
        />

        <OrdersListSection
          orders={orders}
          loading={loading}
          error={error}
          onPressOrder={handleOrderPress}
        />
      </ScrollView>

      <DrawerOverlay visible={leftOpen || rightOpen} onPress={closeAll} />
      <LeftDrawer open={leftOpen} onClose={closeAll} onNavigate={handleNavigate} onLogout={handleLogout} />
      <RightDrawer open={rightOpen} onClose={closeAll} onNavigate={handleNavigate} onLogout={handleLogout} />

      <OrderDetailModal
        visible={isModalVisible}
        order={selectedOrder}
        onClose={handleCloseModal}
        onShare={handleShare}
        onDownloadInvoice={handleDownloadInvoice}
        onCancel={handleCancelOrder}
        isCancelling={isCancelling}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.bgMain },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
});
