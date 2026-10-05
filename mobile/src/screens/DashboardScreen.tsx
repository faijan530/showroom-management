import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return '#f43f5e';
      case 'ADMIN':
        return '#8b5cf6';
      case 'WORKER':
        return '#f59e0b';
      case 'INVENTORY_MANAGER':
        return '#06b6d4';
      default:
        return '#10b981';
    }
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>MOTOHUB MOBILE</Text>
          <Text style={styles.welcomeText}>Hello, {user?.full_name || 'User'}!</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(user?.role) },
            ]}
          >
            <Text style={styles.roleText}>{user?.role || 'USER'} SCOPE</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Session Active</Text>
          <Text style={styles.cardDesc}>
            Connected securely to MotoHub Platform API.
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>

          {user?.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          ) : null}

          {user?.showroom_id ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Showroom ID:</Text>
              <Text style={styles.infoValue}>{user.showroom_id}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase 1 — Auth & Storage Complete</Text>
          <Text style={styles.cardDesc}>
            JWT token is encrypted and securely stored in device SecureStore.
          </Text>
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
    marginBottom: 24,
  },
  appName: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f9fafb',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 10,
  },
});
