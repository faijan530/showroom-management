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
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SparePartCard } from '../components/spare-parts/SparePartCard';
import { getSpareParts, createSparePart, updateSparePart } from '../lib/spare-parts-api';
import { SparePart, SparePartVehicleType } from '../types/spare-part';
import { useAuthStore } from '../store/auth.store';

interface SparePartsScreenProps {
  onSelectPart: (part: SparePart) => void;
  onBack?: () => void;
}

export const SparePartsScreen: React.FC<SparePartsScreenProps> = ({
  onSelectPart,
  onBack,
}) => {
  const { user } = useAuthStore();
  const isManagerOrAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'INVENTORY_MANAGER' ||
    user?.role === 'SUPERADMIN';

  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<SparePartVehicleType | 'ALL'>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal State for Adding Part
  const [showAddModal, setShowAddModal] = useState(false);
  const [partName, setPartName] = useState('');
  const [partCode, setPartCode] = useState('');
  const [category, setCategory] = useState('Engine');
  const [vehicleType, setVehicleType] = useState<SparePartVehicleType>('BOTH');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPartsCatalog = async () => {
    try {
      setError(null);
      const data = await getSpareParts({
        vehicle_type: selectedType,
        low_stock: lowStockOnly,
        search: searchQuery.trim() || undefined,
        showroom_id: user?.showroom_id || undefined,
      });
      setParts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load spare parts catalog');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPartsCatalog();
  }, [selectedType, lowStockOnly]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPartsCatalog();
  };

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchPartsCatalog();
  };

  const handleCreatePart = async () => {
    if (!partName.trim() || !partCode.trim() || !price || !stockQuantity) {
      Alert.alert('Validation Error', 'Please fill in part name, code, price, and stock quantity.');
      return;
    }

    const numPrice = parseFloat(price);
    const numStock = parseInt(stockQuantity, 10);
    const numMin = parseInt(minStockAlert, 10) || 5;

    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Validation Error', 'Enter a valid non-negative price.');
      return;
    }

    if (isNaN(numStock) || numStock < 0) {
      Alert.alert('Validation Error', 'Enter a valid stock quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSparePart({
        part_name: partName.trim(),
        part_code: partCode.trim().toUpperCase(),
        category: category.trim() || 'General',
        vehicle_type: vehicleType,
        price: numPrice,
        stock_quantity: numStock,
        min_stock_alert: numMin,
        description: description.trim() || undefined,
        showroom_id: user?.showroom_id || undefined,
      });

      Alert.alert('Success', `Spare part "${partName}" added successfully!`);
      setShowAddModal(false);
      setPartName('');
      setPartCode('');
      setPrice('');
      setStockQuantity('');
      setDescription('');
      fetchPartsCatalog();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not add spare part');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async (part: SparePart, newQuantity: number) => {
    try {
      // Optimistic local UI update
      setParts((prev) =>
        prev.map((p) => (p.id === part.id ? { ...p, stock_quantity: newQuantity } : p))
      );
      await updateSparePart(part.id, { stock_quantity: newQuantity });
    } catch (err: any) {
      Alert.alert('Restock Failed', err.message || 'Could not update stock quantity.');
      fetchPartsCatalog(); // rollback to server state on error
    }
  };

  return (

    <SafeScreen>
      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerTitleCol}>
          <Text style={styles.badge}>OEM SPARE PARTS</Text>
          <Text style={styles.title}>Parts Catalog</Text>
        </View>

        {isManagerOrAdmin ? (
          <TouchableOpacity
            style={styles.addBtnHeader}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addBtnHeaderText}>➕ Add</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by part name or SKU code..."
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
              fetchPartsCatalog();
            }}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Horizontal Scroll Bar */}
      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(['ALL', 'BIKE', 'CAR', 'BOTH'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                selectedType === tab && !lowStockOnly ? styles.activeFilterTab : null,
              ]}
              onPress={() => {
                setSelectedType(tab);
                setLowStockOnly(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedType === tab && !lowStockOnly ? styles.activeFilterTabText : null,
                ]}
              >
                {tab === 'ALL'
                  ? 'ALL'
                  : tab === 'BIKE'
                  ? '🏍️ BIKES'
                  : tab === 'CAR'
                  ? '🚗 CARS'
                  : '⚡ UNIVERSAL'}
              </Text>
            </TouchableOpacity>
          ))}

          {isManagerOrAdmin ? (
            <TouchableOpacity
              style={[
                styles.filterTab,
                lowStockOnly ? styles.activeLowStockTab : null,
              ]}
              onPress={() => setLowStockOnly(!lowStockOnly)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  lowStockOnly ? styles.activeLowStockText : null,
                ]}
              >
                ⚠️ LOW STOCK
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>

      {/* Main Parts List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading spare parts inventory...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPartsCatalog}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SparePartCard
              part={item}
              onPress={onSelectPart}
              isManager={isManagerOrAdmin}
              onUpdateStock={handleUpdateStock}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚙️</Text>
              <Text style={styles.emptyTitle}>No spare parts found</Text>
              <Text style={styles.emptyDesc}>
                Try searching for a different part code or adjusting filters.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal: Add Spare Part (Manager / Admin) */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Spare Part to Stock</Text>
            <ScrollView style={styles.modalForm}>
              <Input label="Part Name" placeholder="e.g. Front Brake Pads" value={partName} onChangeText={setPartName} />
              <Input label="Part SKU / Code" placeholder="e.g. SKU-BP-102" autoCapitalize="characters" value={partCode} onChangeText={setPartCode} />
              <Input label="Category" placeholder="e.g. Brakes, Engine, Transmission" value={category} onChangeText={setCategory} />

              <Text style={styles.typeLabel}>Vehicle Compatibility:</Text>
              <View style={styles.typeToggleRow}>
                {(['BIKE', 'CAR', 'BOTH'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeToggleBtn,
                      vehicleType === t ? styles.activeTypeToggle : null,
                    ]}
                    onPress={() => setVehicleType(t)}
                  >
                    <Text style={styles.typeToggleText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Price (INR ₹)" placeholder="e.g. 1450" keyboardType="numeric" value={price} onChangeText={setPrice} />
              <Input label="Stock Quantity" placeholder="e.g. 25" keyboardType="numeric" value={stockQuantity} onChangeText={setStockQuantity} />
              <Input label="Min Stock Alert Threshold" placeholder="e.g. 5" keyboardType="numeric" value={minStockAlert} onChangeText={setMinStockAlert} />
              <Input label="Description (Optional)" placeholder="Specifications or part notes" value={description} onChangeText={setDescription} />

              <Button title="Save Spare Part" onPress={handleCreatePart} isLoading={isSubmitting} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowAddModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    marginRight: 10,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleCol: {
    flex: 1,
  },
  badge: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  addBtnHeader: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnHeaderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  filterBarWrapper: {
    height: 44,
    marginBottom: 14,
  },
  filterRow: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  filterTab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  activeLowStockTab: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  filterTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  activeFilterTabText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  activeLowStockText: {
    color: '#ffffff',
    fontWeight: '800',
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
    color: '#10b981',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalForm: {
    width: '100%',
  },
  typeLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeToggleBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTypeToggle: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeToggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    marginVertical: 10,
  },
});
