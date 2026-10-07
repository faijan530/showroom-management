import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import { getCustomerEnquiries, EnquiryItem } from '../lib/enquiries-api';

interface DashboardScreenProps {
  onNavigateToVehicles?: () => void;
  onNavigateToSpareParts?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToVehicles,
  onNavigateToSpareParts,
}) => {
  const { user, logout } = useAuthStore();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const data = await getCustomerEnquiries();
      setEnquiries(data);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return '#10b981';
      case 'CLOSED':
        return '#64748b';
      default:
        return '#f59e0b';
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
            <Text style={styles.roleText}>{user?.role || 'USER'} MEMBER</Text>
          </View>
        </View>

        {/* Account Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Overview</Text>
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
        </View>

        {/* Customer Inquiries & Test Ride Tracker Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Inquiries & Test Ride Status</Text>
          <Text style={styles.cardDesc}>
            Track responses from dealerships regarding your vehicle inquiries and test ride requests.
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 10 }} />
          ) : enquiries.length === 0 ? (
            <View style={styles.emptyEnquiryBox}>
              <Text style={styles.emptyEnquiryText}>No active inquiries or test ride requests found.</Text>
            </View>
          ) : (
            enquiries.map((item) => (
              <View key={item.id} style={styles.enquiryCardItem}>
                <View style={styles.enquiryHeaderRow}>
                  <Text style={styles.enquiryTypeTag}>
                    {item.enquiry_type.replace('_', ' ')}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.enquiryMsg}>{item.message}</Text>
                {item.target_showroom_name ? (
                  <Text style={styles.enquiryShowroom}>Dealership: {item.target_showroom_name}</Text>
                ) : null}
                {item.response_notes ? (
                  <View style={styles.responseNoteBox}>
                    <Text style={styles.responseNoteTitle}>Dealer Response:</Text>
                    <Text style={styles.responseNoteBody}>{item.response_notes}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* Module 2: Vehicle Marketplace */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Marketplace (Module 2)</Text>
          <Text style={styles.cardDesc}>
            Explore bikes & cars, specs, ex-showroom pricing, and stock status across dealership networks.
          </Text>

          <Button
            title="🏍️ Browse Vehicle Marketplace"
            onPress={onNavigateToVehicles || (() => {})}
            style={styles.marketplaceBtn}
          />
        </View>

        {/* Module 3: Spare Parts Catalog */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>OEM Spare Parts Catalog (Module 3)</Text>
          <Text style={styles.cardDesc}>
            Browse genuine replacement components, check stock status, and submit availability inquiries.
          </Text>

          <Button
            title="⚙️ Browse Spare Parts Catalog"
            onPress={onNavigateToSpareParts || (() => {})}
            variant="secondary"
            style={styles.marketplaceBtn}
          />
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
    marginBottom: 14,
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
  marketplaceBtn: {
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 10,
  },
  emptyEnquiryBox: {
    padding: 12,
    backgroundColor: '#090d16',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyEnquiryText: {
    color: '#64748b',
    fontSize: 12,
  },
  enquiryCardItem: {
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  enquiryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enquiryTypeTag: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  enquiryMsg: {
    color: '#e2e8f0',
    fontSize: 13,
    marginBottom: 4,
  },
  enquiryShowroom: {
    color: '#94a3b8',
    fontSize: 11,
  },
  responseNoteBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  responseNoteTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  responseNoteBody: {
    color: '#f1f5f9',
    fontSize: 12,
    marginTop: 2,
  },
});
