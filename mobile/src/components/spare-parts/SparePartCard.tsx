import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SparePart } from '../../types/spare-part';

interface SparePartCardProps {
  part: SparePart;
  onPress: (part: SparePart) => void;
}

export const SparePartCard: React.FC<SparePartCardProps> = ({ part, onPress }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStockBadge = () => {
    if (part.stock_quantity === 0) {
      return { label: 'OUT OF STOCK', style: styles.outOfStockBg };
    }
    if (part.stock_quantity <= part.min_stock_alert) {
      return { label: `LOW STOCK (${part.stock_quantity})`, style: styles.lowStockBg };
    }
    return { label: `IN STOCK (${part.stock_quantity})`, style: styles.inStockBg };
  };

  const stockBadge = getStockBadge();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(part)}
    >
      <View style={styles.cardHeader}>
        {part.image_url ? (
          <Image
            source={{ uri: part.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>⚙️</Text>
          </View>
        )}

        <View style={styles.headerMeta}>
          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{part.category}</Text>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{part.vehicle_type}</Text>
            </View>
          </View>

          <Text style={styles.partName} numberOfLines={1}>
            {part.part_name}
          </Text>

          <Text style={styles.skuText}>SKU: {part.part_code}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.showroomCol}>
          <Text style={styles.showroomLabel}>DEALERSHIP</Text>
          <Text style={styles.showroomName} numberOfLines={1}>
            {part.showroom_name || 'Authorized Dealership'}
          </Text>
        </View>

        <View style={styles.priceCol}>
          <View style={[styles.stockBadge, stockBadge.style]}>
            <Text style={styles.stockBadgeText}>{stockBadge.label}</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(part.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  placeholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  headerMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  partName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  skuText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  showroomCol: {
    flex: 1,
    marginRight: 10,
  },
  showroomLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  inStockBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  lowStockBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  outOfStockBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  stockBadgeText: {
    color: '#f8fafc',
    fontSize: 9,
    fontWeight: '800',
  },
  priceText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '800',
  },
});
