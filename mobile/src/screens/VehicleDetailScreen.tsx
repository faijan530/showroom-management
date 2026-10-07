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
import { Vehicle } from '../types/vehicle';
import { useAuthStore } from '../store/auth.store';
import { createEnquiry } from '../lib/enquiries-api';

interface VehicleDetailScreenProps {
  vehicle: Vehicle;
  onBack: () => void;
}

export const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({
  vehicle,
  onBack,
}) => {
  const { user } = useAuthStore();
  const [submittingType, setSubmittingType] = useState<'inquire' | 'test_ride' | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isBike = vehicle.type === 'BIKE';

  const handleInquire = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to submit a vehicle inquiry.');
      return;
    }
    try {
      setSubmittingType('inquire');
      await createEnquiry({
        customer_name: user.full_name || 'Customer',
        customer_phone: user.phone,
        customer_email: user.email || undefined,
        enquiry_type: 'VEHICLE_PURCHASE',
        message: `Inquiry regarding vehicle: ${vehicle.title} (${vehicle.brand} ${vehicle.model}, Price: ₹${vehicle.price})`,
        target_showroom_id: vehicle.showroom_id,
      });

      Alert.alert(
        'Inquiry Submitted Successfully',
        `Your inquiry for ${vehicle.title} has been recorded. Dealership representatives from ${vehicle.showroom_name || 'the showroom'} will contact you shortly!`
      );
    } catch (err: any) {
      Alert.alert('Inquiry Failed', err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmittingType(null);
    }
  };

  const handleBookTestDrive = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book a test ride.');
      return;
    }
    try {
      setSubmittingType('test_ride');
      await createEnquiry({
        customer_name: user.full_name || 'Customer',
        customer_phone: user.phone,
        customer_email: user.email || undefined,
        enquiry_type: 'VEHICLE_PURCHASE',
        message: `Test Ride Booking Request for ${vehicle.title} (Brand: ${vehicle.brand}, Model: ${vehicle.model}, Year: ${vehicle.year})`,
        target_showroom_id: vehicle.showroom_id,
      });

      Alert.alert(
        'Test Ride Booked',
        `Your test ride request for ${vehicle.title} has been logged in the system. The showroom will confirm your schedule time!`
      );
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Failed to book test ride. Please try again.');
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Bar */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back to Marketplace</Text>
        </TouchableOpacity>

        {/* Hero Image */}
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
            </View>
          )}

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{vehicle.type}</Text>
          </View>
        </View>

        {/* Title & Price Header */}
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{vehicle.title}</Text>
            <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>
          </View>

          <Text style={styles.subtitle}>
            {vehicle.brand} • {vehicle.model} • Model Year {vehicle.year}
          </Text>
        </View>

        {/* Specifications Grid Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Technical Specifications</Text>

          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Engine CC</Text>
              <Text style={styles.specValue}>{vehicle.engine_cc} cc</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Color Variant</Text>
              <Text style={styles.specValue}>{vehicle.color}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Vehicle Category</Text>
              <Text style={styles.specValue}>{vehicle.type}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Availability Status</Text>
              <Text
                style={[
                  styles.specValue,
                  vehicle.stock_quantity > 0
                    ? styles.inStockText
                    : styles.outOfStockText,
                ]}
              >
                {vehicle.stock_quantity > 0
                  ? `${vehicle.stock_quantity} Units Available`
                  : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        {vehicle.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vehicle Description</Text>
            <Text style={styles.descriptionText}>{vehicle.description}</Text>
          </View>
        ) : null}

        {/* Showroom & Dealership Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authorized Dealership</Text>
          <View style={styles.showroomRow}>
            <Text style={styles.showroomIcon}>🏢</Text>
            <View>
              <Text style={styles.showroomName}>
                {vehicle.showroom_name || 'Apex MotoHub Flagship'}
              </Text>
              <Text style={styles.showroomCode}>
                Dealer Code: {vehicle.showroom_code || 'SHW-01'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="⚡ Inquire Now"
            onPress={handleInquire}
            style={styles.actionBtn}
          />
          <Button
            title="🏍️ Book Test Ride"
            onPress={handleBookTestDrive}
            variant="secondary"
            style={styles.actionBtn}
          />
        </View>
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
    height: 220,
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
  bikeBg: {
    backgroundColor: '#0f2942',
  },
  carBg: {
    backgroundColor: '#2b1040',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
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
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginRight: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
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
  inStockText: {
    color: '#10b981',
  },
  outOfStockText: {
    color: '#ef4444',
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
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    width: '100%',
  },
});
