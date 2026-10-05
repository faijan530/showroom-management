import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';

interface InventoryManagerDashboardScreenProps {
  onNavigateToVehicles?: () => void;
}

export const InventoryManagerDashboardScreen: React.FC<InventoryManagerDashboardScreenProps> = ({
  onNavigateToVehicles,
}) => {
  const { user, logout } = useAuthStore();

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Inventory';
  const showroomCode = user?.showroom_code || user?.showroom?.code || 'SHW-01';

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>INVENTORY CONTROL PORTAL</Text>
          <Text style={styles.title}>Stock Management</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.full_name || 'Inventory Manager'}! Control stock counts, bikes, cars, and spare parts for {showroomTitle}.
          </Text>
        </View>

        {/* Showroom Context */}
        <View style={styles.showroomCard}>
          <Text style={styles.cardLabel}>ASSIGNED INVENTORY SCOPE</Text>
          <Text style={styles.showroomName}>{showroomTitle}</Text>
          <Text style={styles.showroomCode}>Dealer Code: {showroomCode}</Text>
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity style={styles.shortcutBtn} onPress={onNavigateToVehicles}>
            <Text style={styles.shortcutIcon}>🏍️</Text>
            <Text style={styles.shortcutTitle}>Vehicle Stock Catalog</Text>
            <Text style={styles.shortcutSub}>Bikes & Cars Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutBtn} onPress={() => {}}>
            <Text style={styles.shortcutIcon}>📦</Text>
            <Text style={styles.shortcutTitle}>Spare Parts Stock</Text>
            <Text style={styles.shortcutSub}>OEM Parts Control</Text>
          </TouchableOpacity>
        </View>

        {/* Stock Alerts Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory Health & Alerts</Text>
          <Text style={styles.cardDesc}>
            Real-time stock level monitoring for vehicle units and spare parts.
          </Text>

          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>✅</Text>
            <View style={styles.alertCol}>
              <Text style={styles.alertTitle}>Vehicle Catalog Synced</Text>
              <Text style={styles.alertSub}>All stock changes reflect immediately on public marketplace.</Text>
            </View>
          </View>
        </View>

        <Button
          title="Sign Out"
          onPress={logout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
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
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
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
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertCol: {
    flex: 1,
  },
  alertTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  alertSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 10,
  },
});
