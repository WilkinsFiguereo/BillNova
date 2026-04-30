import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { ordersTheme as t } from '../theme/orders.theme';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import { normalizeOrderStatus, type Order } from '../types/orders.types';
import { STATUS_CONFIG } from './OrderCard';

interface Props {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onShare: () => void;
  onDownloadInvoice: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function OrderDetailModal({
  visible,
  order,
  onClose,
  onShare,
  onDownloadInvoice,
  onCancel,
  isCancelling = false,
}: Props) {
  if (!visible || !order) return null;

  const normalizedStatus = normalizeOrderStatus(order.status);
  const statusConfig = STATUS_CONFIG[normalizedStatus];

  const linesTotal = order.lines.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropLayer} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{order.reference}</Text>
              <Text style={styles.date}>{order.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>
          <Text style={styles.total}>Total ${order.total.toFixed(2)}</Text>
          <Text style={styles.sub}>Líneas: {linesTotal}</Text>
          {order.invoice ? (
            <Text style={styles.invoice}>Factura: {order.invoice.reference}</Text>
          ) : (
            <Text style={styles.invoiceDisabled}>Factura aún no emitida</Text>
          )}

          <ScrollView style={styles.lines} showsVerticalScrollIndicator={false}>
            {order.lines.map((line) => (
              <View key={line.id} style={styles.lineRow}>
                <View style={styles.lineDot} />
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{line.productName}</Text>
                  <Text style={styles.lineQty}>x{line.quantity}</Text>
                </View>
                <Text style={styles.linePrice}>${(line.priceUnit * line.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionLeft]} onPress={onShare}>
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionRight,
              ]}
              onPress={onDownloadInvoice}
            >
              <Text style={styles.actionText}>
                Descargar factura
              </Text>
            </TouchableOpacity>
          </View>

          {normalizedStatus === 'pending' && onCancel && (
            <TouchableOpacity
              style={[styles.cancelBtn, isCancelling && styles.actionDisabled]}
              onPress={onCancel}
              disabled={isCancelling}
            >
              <Text style={styles.cancelText}>{isCancelling ? 'Cancelando...' : 'Cancelar pedido'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdropLayer: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 18,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  date: {
    fontSize: 13,
    color: colors.text.disabled,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  total: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
  },
  sub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  invoice: {
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 12,
  },
  invoiceDisabled: {
    fontSize: 13,
    color: colors.text.disabled,
    marginBottom: 12,
  },
  lines: {
    maxHeight: 160,
    marginBottom: 16,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand[500],
    marginRight: 10,
  },
  lineInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineName: {
    fontSize: 14,
    color: colors.text.primary,
    flexShrink: 1,
  },
  lineQty: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  linePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand[600],
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.error.default,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  actionLeft: {
    marginRight: 8,
  },
  actionRight: {
    marginLeft: 8,
  },
});
