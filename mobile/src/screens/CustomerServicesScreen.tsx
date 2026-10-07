import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCustomerServiceCatalog, ServicePackage } from '../lib/services-api';

interface CustomerServicesScreenProps {
  onBack?: () => void;
  onSelectPackage: (pkg: ServicePackage) => void;
}

export const CustomerServicesScreen: React.FC<CustomerServicesScreenProps> = ({
  onBack,
  onSelectPackage,
}) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPackages = async () => {
    try {
      const data = await getCustomerServiceCatalog();
      setPackages(data);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Service Packages</Text>
          <Text style={styles.headerSubtitle}>
            Official maintenance packages with turnaround duration & upfront rates
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
        }
      >
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loaderText}>Loading certified service packages...</Text>
          </View>
        ) : packages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="construct-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No service packages available</Text>
            <Text style={styles.emptySubtitle}>
              Please check back shortly or consult your showroom service advisor.
            </Text>
          </View>
        ) : (
          packages.map((pkg) => (
            <View key={pkg.id} style={styles.card}>
              {/* Card Header Banner */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{pkg.title}</Text>
                  <View style={styles.badgeRow}>
                    {/* Time Duration Badge (Estimated Turnaround) */}
                    <View style={styles.durationBadge}>
                      <Ionicons name="time" size={13} color="#38bdf8" />
                      <Text style={styles.durationBadgeText}>{pkg.duration}</Text>
                    </View>

                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>Bikes & Cars</Text>
                    </View>
                  </View>
                </View>

                {/* Price Tag */}
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Fixed Rate</Text>
                  <Text style={styles.priceValue}>₹{pkg.price.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.descriptionText}>{pkg.description}</Text>

              {/* Deliverables / Checklist */}
              {pkg.features && pkg.features.length > 0 ? (
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>INCLUDED DELIVERABLES:</Text>
                  <View style={styles.featuresGrid}>
                    {pkg.features.map((feat, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Book Action */}
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => onSelectPackage(pkg)}
                activeOpacity={0.8}
              >
                <Text style={styles.bookBtnText}>Book This Package</Text>
                <Ionicons name="arrow-forward" size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loaderBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  durationBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  typeBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  priceBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  priceLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceValue: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '900',
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  featuresTitle: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  featuresGrid: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingVertical: 11,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
