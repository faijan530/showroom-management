import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import { getSpareParts, updateSparePart } from '../lib/spare-parts-api';
import { SparePart } from '../types/spare-part';
import { InventoryManagerDrawer, InventoryManagerRouteName } from '../components/navigation/InventoryManagerDrawer';
import { InventoryManagerBottomBar } from '../components/navigation/InventoryManagerBottomBar';
import { SparePartsScreen } from './SparePartsScreen';
import { VehiclesScreen } from './VehiclesScreen';
import { AdminProfileScreen } from './AdminProfileScreen';

interface InventoryManagerDashboardScreenProps {
  onNavigateToVehicles?: () => void;
  onNavigateToSpareParts?: () => void;
}

export const InventoryManagerDashboardScreen: React.FC<InventoryManagerDashboardScreenProps> = () => {
  const { user, logout } = useAuthStore();

  const [currentRoute, setCurrentRoute] = useState<InventoryManagerRouteName>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStockSummary = async () => {
    try {
      const data = await getSpareParts({ showroom_id: user?.showroom_id || undefined });
      setParts(data);
    } catch {
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockSummary();
  }, []);

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Inventory';
  const showroomCode = user?.showroom_code || user?.showroom?.code || 'SHW-01';

  const inStockCount = parts.filter((p) => p.stock_quantity > p.min_stock_alert).length;
  const lowStockCount = parts.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_alert).length;
  const outOfStockCount = parts.filter((p) => p.stock_quantity === 0).length;

  const handleQuickRestock = async (part: SparePart, addition: number) => {
    const newQty = part.stock_quantity + addition;
    try {
      setParts((prev) =>
        prev.map((p) => (p.id === part.id ? { ...p, stock_quantity: newQty } : p))
      );
      await updateSparePart(part.id, { stock_quantity: newQty });
      Alert.alert('Restock Successful', `Added +${addition} items to ${part.part_name}. New stock: ${newQty}`);
      fetchStockSummary();
    } catch (err: any) {
      Alert.alert('Restock Error', err.message || 'Could not update stock.');
      fetchStockSummary();
    }
  };

  const lowStockItems = parts.filter((p) => p.stock_quantity <= p.min_stock_alert);

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'spare_parts':
        return (
          <SparePartsScreen
            onSelectPart={() => {}}
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'vehicles':
        return (
          <VehiclesScreen
            onSelectVehicle={() => {}}
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'profile':
        return <AdminProfileScreen />;
      case 'dashboard':
      default:
        return (
          <ScrollView contentContainerStyle={styles.container}>
            {/* Brand Bar Header */}
            <View style={styles.brandHeaderBar}>
              <View style={styles.brandTitleGroup}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.headerLogoIcon}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.badge}>INVENTORY CONTROL PORTAL</Text>
                  <Text style={styles.title}>Stock Management</Text>
                </View>
              </View>
              <TouchableOpacity onPress={logout} style={styles.headerLogoutBtn}>
                <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
              </TouchableOpacity>
            </View>

            {/* Showroom Context */}
            <View style={styles.showroomCard}>
              <Text style={styles.cardLabel}>ASSIGNED INVENTORY SCOPE</Text>
              <Text style={styles.showroomName}>{showroomTitle}</Text>
              <Text style={styles.showroomCode}>Dealer Code: {showroomCode}</Text>
            </View>

            {/* Shortcuts */}
            <View style={styles.shortcutRow}>
              <TouchableOpacity style={styles.shortcutBtn} onPress={() => setCurrentRoute('vehicles')}>
                <Text style={styles.shortcutIcon}>🏍️</Text>
                <Text style={styles.shortcutTitle}>Vehicle Stock Catalog</Text>
                <Text style={styles.shortcutSub}>Bikes & Cars Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.shortcutBtn, styles.activePartsShortcut]} onPress={() => setCurrentRoute('spare_parts')}>
                <Text style={styles.shortcutIcon}>📦</Text>
                <Text style={styles.shortcutTitle}>Spare Parts Stock</Text>
                <Text style={styles.shortcutSub}>OEM Parts Control</Text>
              </TouchableOpacity>
            </View>

            {/* Live Stock Level Indicators */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real-Time Stock Health</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#06b6d4" style={styles.loader} />
            ) : (
              <View style={styles.stockStatusContainer}>
                <TouchableOpacity style={[styles.stockCard, styles.inStockBorder]} onPress={() => setCurrentRoute('spare_parts')}>
                  <View style={styles.stockCardHeader}>
                    <Text style={styles.stockIcon}>🟢</Text>
                    <Text style={styles.stockBadgeTitle}>IN_STOCK</Text>
                  </View>
                  <Text style={[styles.stockCount, styles.inStockCountText]}>{inStockCount}</Text>
                  <Text style={styles.stockCardSub}>Healthy Stock Levels</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.stockCard, styles.lowStockBorder]} onPress={() => setCurrentRoute('spare_parts')}>
                  <View style={styles.stockCardHeader}>
                    <Text style={styles.stockIcon}>🟡</Text>
                    <Text style={styles.stockBadgeTitle}>LOW_STOCK</Text>
                  </View>
                  <Text style={[styles.stockCount, styles.lowStockCountText]}>{lowStockCount}</Text>
                  <Text style={styles.stockCardSub}>Requires Reorder</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.stockCard, styles.outOfStockBorder]} onPress={() => setCurrentRoute('spare_parts')}>
                  <View style={styles.stockCardHeader}>
                    <Text style={styles.stockIcon}>🔴</Text>
                    <Text style={styles.stockBadgeTitle}>OUT_OF_STOCK</Text>
                  </View>
                  <Text style={[styles.stockCount, styles.outOfStockCountText]}>{outOfStockCount}</Text>
                  <Text style={styles.stockCardSub}>Depleted Items</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Low-Stock Actionable Batch Restock Panel */}
            <View style={styles.card}>
              <View style={styles.restockHeaderRow}>
                <Text style={styles.cardTitle}>⚡ Quick Batch Restock Panel</Text>
                {lowStockItems.length > 0 ? (
                  <View style={styles.alertCountBadge}>
                    <Text style={styles.alertCountBadgeText}>{lowStockItems.length} NEEDS RESTOCK</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardDesc}>
                One-tap batch restock for low or depleted OEM components in {showroomTitle}.
              </Text>

              {lowStockItems.length === 0 ? (
                <View style={styles.allHealthyBox}>
                  <Text style={styles.allHealthyText}>✅ All spare parts are well-stocked above minimum thresholds.</Text>
                </View>
              ) : (
                lowStockItems.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.restockItemRow}>
                    <View style={styles.restockItemMeta}>
                      <Text style={styles.restockItemName} numberOfLines={1}>
                        {item.part_name}
                      </Text>
                      <Text style={styles.restockItemSub}>
                        SKU: {item.part_code} • Qty: <Text style={styles.qtyHighlight}>{item.stock_quantity}</Text> (Min: {item.min_stock_alert})
                      </Text>
                    </View>

                    <View style={styles.batchBtnGroup}>
                      <TouchableOpacity
                        style={styles.batchBtn}
                        onPress={() => handleQuickRestock(item, 5)}
                      >
                        <Text style={styles.batchBtnText}>+5</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.batchBtn, styles.batchBtnPrimary]}
                        onPress={() => handleQuickRestock(item, 10)}
                      >
                        <Text style={styles.batchBtnText}>+10</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.batchBtn, styles.batchBtnSuccess]}
                        onPress={() => handleQuickRestock(item, 25)}
                      >
                        <Text style={styles.batchBtnText}>+25</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <Button
                title="⚙️ Full Stock Catalog & Custom Restock"
                onPress={() => setCurrentRoute('spare_parts')}
                style={styles.manageBtn}
              />
            </View>

            <Button
              title="Sign Out"
              onPress={logout}
              variant="danger"
              style={styles.logoutBtn}
            />
          </ScrollView>
        );
    }
  };

  return (
    <SafeScreen style={styles.safeContainer}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Ionicons name="cube" size={16} color="#06b6d4" style={{ marginRight: 6 }} />
          <Text style={styles.headerControlTitle}>INVENTORY CONTROL</Text>
        </View>

        <TouchableOpacity
          onPress={() => setCurrentRoute('profile')}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContentArea}>
        {renderCurrentView()}
      </View>

      <InventoryManagerBottomBar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      />

      <InventoryManagerDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        showroomName={showroomTitle}
        showroomCode={showroomCode}
        onLogout={logout}
      />
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#070a12',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#090d16',
  },
  headerIconButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerControlTitle: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  mainContentArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 24,
  },
  brandHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  brandTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerLogoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  headerLogoutBtn: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  showroomCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  showroomCode: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  activePartsShortcut: {
    borderColor: '#06b6d4',
  },
  shortcutIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  shortcutTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  shortcutSub: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  loader: {
    marginVertical: 20,
  },
  stockStatusContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  stockCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  inStockBorder: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  lowStockBorder: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  outOfStockBorder: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  stockCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  stockIcon: {
    fontSize: 12,
  },
  stockBadgeTitle: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
  },
  stockCount: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 2,
  },
  inStockCountText: {
    color: '#10b981',
  },
  lowStockCountText: {
    color: '#f59e0b',
  },
  outOfStockCountText: {
    color: '#ef4444',
  },
  stockCardSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 14,
  },
  manageBtn: {
    marginTop: 12,
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  restockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertCountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  alertCountBadgeText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
  },
  allHealthyBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  allHealthyText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  restockItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  restockItemMeta: {
    flex: 1,
    marginRight: 10,
  },
  restockItemName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  restockItemSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  qtyHighlight: {
    color: '#ef4444',
    fontWeight: '800',
  },
  batchBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  batchBtn: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  batchBtnPrimary: {
    backgroundColor: '#3b82f6',
  },
  batchBtnSuccess: {
    backgroundColor: '#10b981',
  },
  batchBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});
