import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';

export const AdminProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Branch';
  const showroomCode = user?.showroom_code || user?.showroom?.code || (user?.showroom_id ? user.showroom_id.slice(0, 6).toUpperCase() : 'SHW-01');

  const getRoleMeta = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return {
          headerTitle: 'Super Admin Profile',
          badgeText: 'SUPER ADMIN',
          color: '#f43f5e',
          scopeTitle: 'PLATFORM GOVERNANCE SCOPE',
          val1Label: 'System Access',
          val1Text: 'Global Multi-Showroom Network',
          val2Label: 'Security Privilege',
          val2Text: 'Full Administrative Access',
        };
      case 'ADMIN':
        return {
          headerTitle: 'Showroom Admin Profile',
          badgeText: 'SHOWROOM ADMIN',
          color: '#a855f7',
          scopeTitle: 'ASSIGNED DEALERSHIP SCOPE',
          val1Label: 'Showroom Name',
          val1Text: showroomTitle,
          val2Label: 'Branch Code',
          val2Text: showroomCode,
        };
      case 'INVENTORY_MANAGER':
        return {
          headerTitle: 'Inventory Manager Profile',
          badgeText: 'INVENTORY MANAGER',
          color: '#06b6d4',
          scopeTitle: 'ASSIGNED INVENTORY SCOPE',
          val1Label: 'Showroom Name',
          val1Text: showroomTitle,
          val2Label: 'Branch Code',
          val2Text: showroomCode,
        };
      case 'WORKER':
        return {
          headerTitle: 'Technician Profile',
          badgeText: 'TECHNICIAN',
          color: '#f59e0b',
          scopeTitle: 'ASSIGNED WORKSHOP BAY',
          val1Label: 'Showroom Name',
          val1Text: showroomTitle,
          val2Label: 'Branch Code',
          val2Text: showroomCode,
        };
      case 'USER':
      default:
        return {
          headerTitle: 'Customer Profile',
          badgeText: 'CUSTOMER',
          color: '#10b981',
          scopeTitle: 'CUSTOMER ACCOUNT SCOPE',
          val1Label: 'Account Status',
          val1Text: 'Verified Motohub User',
          val2Label: 'Registered Phone',
          val2Text: user?.phone || 'N/A',
        };
    }
  };

  const roleMeta = getRoleMeta(user?.role);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{roleMeta.headerTitle}</Text>
        <Text style={styles.headerSubtitle}>
          Account credentials, role permissions, and access scope
        </Text>
      </View>

      {/* User Card */}
      <View style={styles.profileCard}>
        <View style={[styles.avatarCircle, { backgroundColor: `${roleMeta.color}20`, borderColor: `${roleMeta.color}40` }]}>
          <Ionicons name="person" size={32} color={roleMeta.color} />
        </View>
        <Text style={styles.userName}>{user?.full_name || 'Motohub User'}</Text>
        <Text style={styles.userPhone}>📞 {user?.phone || 'N/A'}</Text>
        {user?.email ? <Text style={styles.userEmail}>✉️ {user.email}</Text> : null}

        {/* Dynamic Role Badge */}
        <View style={[styles.roleBadge, { backgroundColor: `${roleMeta.color}20`, borderColor: `${roleMeta.color}40` }]}>
          <Ionicons name="shield-checkmark" size={14} color={roleMeta.color} />
          <Text style={[styles.roleBadgeText, { color: roleMeta.color }]}>{roleMeta.badgeText}</Text>
        </View>
      </View>

      {/* Dynamic Scope Section */}
      <Text style={styles.sectionHeader}>{roleMeta.scopeTitle}</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={roleMeta.color} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{roleMeta.val1Label}</Text>
            <Text style={styles.infoValue}>{roleMeta.val1Text}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={18} color={roleMeta.color} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{roleMeta.val2Label}</Text>
            <Text style={styles.infoValue}>{roleMeta.val2Text}</Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#f43f5e" />
        <Text style={styles.logoutText}>Sign Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  userPhone: {
    color: '#94a3b8',
    fontSize: 13,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '800',
  },
});
