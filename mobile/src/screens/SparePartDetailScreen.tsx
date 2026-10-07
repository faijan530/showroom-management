import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { SparePart } from '../types/spare-part';
import { useAuthStore } from '../store/auth.store';
import { createEnquiry } from '../lib/enquiries-api';

interface SparePartDetailScreenProps {
  part: SparePart;
  onBack: () => void;
}

export const SparePartDetailScreen: React.FC<SparePartDetailScreenProps> = ({
  part,
  onBack,
}) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(part.price);
  };

  const getStockStatusInfo = () => {
    if (part.stock_quantity === 0) {
      return { label: 'OUT OF STOCK', color: '#ef4444' };
    }
    if (part.stock_quantity <= part.min_stock_alert) {
      return { label: `LOW STOCK (${part.stock_quantity} Units Left)`, color: '#f59e0b' };
    }
    return { label: `IN STOCK (${part.stock_quantity} Available)`, color: '#10b981' };
  };

  const stockInfo = getStockStatusInfo();

  const handleRequestPart = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to submit a spare part inquiry.');
      return;
    }
    try {
      setIsSubmitting(true);
      await createEnquiry({
        customer_name: user.full_name || 'Customer',
        customer_phone: user.phone,
        customer_email: user.email || undefined,
        enquiry_type: 'SPARE_PART_PURCHASE',
        message: `Spare Part Order Inquiry for ${part.part_name} (SKU: ${part.part_code}, Category: ${part.category}, Price: ₹${part.price})`,
        target_showroom_id: part.showroom_id,
      });

      Alert.alert(
        'Part Inquiry Submitted',
        `Your request for ${part.part_name} (SKU: ${part.part_code}) has been logged successfully. The dealership (${part.showroom_name || 'Branch'}) will confirm stock availability and contact you!`
      );
    } catch (err: any) {
      Alert.alert('Inquiry Failed', err.message || 'Failed to submit spare part inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Back */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back to Parts Catalog</Text>
        </TouchableOpacity>

        {/* Hero Graphic Container */}
        <View style={styles.imageContainer}>
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

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{part.category}</Text>
          </View>
        </View>

        {/* Title Header & Price */}
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{part.part_name}</Text>
            <Text style={styles.price}>{formatPrice(part.price)}</Text>
          </View>
          <Text style={styles.skuText}>SKU Part Code: {part.part_code}</Text>
        </View>

        {/* Specifications Grid Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Component Details</Text>

          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Vehicle Compatibility</Text>
              <Text style={styles.specValue}>{part.vehicle_type}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Category Group</Text>
              <Text style={styles.specValue}>{part.category}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Inventory Status</Text>
              <Text style={[styles.specValue, { color: stockInfo.color }]}>
                {stockInfo.label}
              </Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Low Stock Alert Level</Text>
              <Text style={styles.specValue}>Below {part.min_stock_alert} units</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {part.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Part Description & Specs</Text>
            <Text style={styles.descriptionText}>{part.description}</Text>
          </View>
        ) : null}

        {/* Showroom Dealership Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fulfilling Dealership</Text>
          <View style={styles.showroomRow}>
            <Text style={styles.showroomIcon}>🏢</Text>
            <View>
              <Text style={styles.showroomName}>
                {part.showroom_name || 'Apex MotoHub Central'}
              </Text>
              <Text style={styles.showroomCode}>
                Branch Code: {part.showroom_code || 'SHW-01'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title="📦 Submit Part Inquiry"
          onPress={handleRequestPart}
          style={styles.actionBtn}
        />
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
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
  },
  placeholderIcon: {
    fontSize: 64,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  headerInfo: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginRight: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  skuText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  specItem: {
    width: '50%',
  },
  specLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  specValue: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  showroomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  showroomIcon: {
    fontSize: 28,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  showroomCode: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
