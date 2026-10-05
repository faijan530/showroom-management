import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { getVehicles } from '../lib/vehicles-api';
import { Vehicle, VehicleType } from '../types/vehicle';

interface VehiclesScreenProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBack?: () => void;
}

export const VehiclesScreen: React.FC<VehiclesScreenProps> = ({
  onSelectVehicle,
  onBack,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleCatalog = async () => {
    try {
      setError(null);
      const data = await getVehicles({
        type: selectedType,
        brand: searchQuery.trim() || undefined,
      });
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicle catalog');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVehicleCatalog();
  }, [selectedType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVehicleCatalog();
  };

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchVehicleCatalog();
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(query) ||
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );
  });

  return (
    <SafeScreen>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        ) : null}
        <View>
          <Text style={styles.badge}>VEHICLE MARKETPLACE</Text>
          <Text style={styles.title}>Browse Inventory</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand, model or title..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchVehicleCatalog();
            }}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs (ALL / BIKES / CARS) */}
      <View style={styles.filterTabs}>
        {(['ALL', 'BIKE', 'CAR'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              selectedType === tab ? styles.activeFilterTab : null,
            ]}
            onPress={() => setSelectedType(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedType === tab ? styles.activeFilterTabText : null,
              ]}
            >
              {tab === 'ALL' ? 'ALL VEHICLES' : tab === 'BIKE' ? '🏍️ BIKES' : '🚗 CARS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body List or Loading / Error */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Fetching available vehicles...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchVehicleCatalog}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard vehicle={item} onPress={onSelectVehicle} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptyDesc}>
                Try adjusting your search criteria or filter type.
              </Text>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    paddingRight: 8,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  clearBtn: {
    position: 'absolute',
    right: 32,
    top: 12,
  },
  clearBtnText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  activeFilterTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
