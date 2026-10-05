import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Vehicle } from '../../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isBike = vehicle.type === 'BIKE';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(vehicle)}
    >
      {/* Header Image or Image Container */}
      <View style={styles.imageContainer}>
        {vehicle.image_url ? (
          <Image
            source={{ uri: vehicle.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, isBike ? styles.bikeBg : styles.carBg]}>
            <Text style={styles.placeholderIcon}>{isBike ? '🏍️' : '🚗'}</Text>
            <Text style={styles.placeholderText}>
              {vehicle.brand} {vehicle.model}
            </Text>
          </View>
        )}

        {/* Type Badge */}
        <View style={[styles.typeBadge, isBike ? styles.bikeBadge : styles.carBadge]}>
          <Text style={styles.typeBadgeText}>{vehicle.type}</Text>
        </View>

        {/* Stock Status Badge */}
        <View
          style={[
            styles.stockBadge,
            vehicle.stock_quantity > 0 ? styles.inStockBg : styles.outOfStockBg,
          ]}
        >
          <Text style={styles.stockBadgeText}>
            {vehicle.stock_quantity > 0
              ? `${vehicle.stock_quantity} IN STOCK`
              : 'OUT OF STOCK'}
          </Text>
        </View>
      </View>

      {/* Content Details */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.title}
        </Text>

        <Text style={styles.subtitle}>
          {vehicle.brand} • {vehicle.model} ({vehicle.year})
        </Text>

        {/* Specs Pills */}
        <View style={styles.specsRow}>
          <View style={styles.specPill}>
            <Text style={styles.specPillText}>⚡ {vehicle.engine_cc} cc</Text>
          </View>
          <View style={styles.specPill}>
            <Text style={styles.specPillText}>🎨 {vehicle.color}</Text>
          </View>
        </View>

        {/* Showroom & Price Footer */}
        <View style={styles.footer}>
          <View style={styles.showroomCol}>
            <Text style={styles.showroomLabel}>DEALERSHIP</Text>
            <Text style={styles.showroomName} numberOfLines={1}>
              {vehicle.showroom_name || 'Authorized Showroom'}
            </Text>
          </View>

          <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  bikeBg: {
    backgroundColor: '#0f2942',
  },
  carBg: {
    backgroundColor: '#2b1040',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bikeBadge: {
    backgroundColor: '#3b82f6',
  },
  carBadge: {
    backgroundColor: '#8b5cf6',
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inStockBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  outOfStockBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  stockBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f9fafb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  specPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  specPillText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  showroomCol: {
    flex: 1,
    marginRight: 12,
  },
  showroomLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  price: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
});
