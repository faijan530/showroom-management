import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import {
  getShowrooms,
  createShowroom,
  updateShowroomStatus,
  provisionShowroomAdmin,
  getAuditLogs,
  AuditLogItem,
} from '../lib/showrooms-api';
import { Showroom } from '../types/showroom';
import { SuperAdminDrawer, SuperAdminRouteName } from '../components/navigation/SuperAdminDrawer';
import { SuperAdminBottomBar } from '../components/navigation/SuperAdminBottomBar';
import { AdminProfileScreen } from './AdminProfileScreen';

export const SuperAdminDashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const [currentRoute, setCurrentRoute] = useState<SuperAdminRouteName>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modal States
  const [showAddShowroomModal, setShowAddShowroomModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedShowroomForAdmin, setSelectedShowroomForAdmin] = useState<Showroom | null>(null);

  // Form States - Showroom
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmittingShowroom, setIsSubmittingShowroom] = useState(false);

  // Form States - Admin
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  const fetchPlatformData = async () => {
    try {
      const [showroomsData, logsData] = await Promise.all([
        getShowrooms(),
        getAuditLogs().catch(() => []),
      ]);
      setShowrooms(showroomsData);
      setAuditLogs(logsData);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load platform data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleToggleStatus = async (showroom: Showroom) => {
    const newStatus = showroom.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateShowroomStatus(showroom.id, newStatus);
      Alert.alert(
        'Status Updated',
        `Showroom ${showroom.name} status changed to ${newStatus}.`
      );
      fetchPlatformData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status');
    }
  };

  const handleCreateShowroom = async () => {
    if (!name || !code || !address || !phone || !email) {
      Alert.alert('Validation Error', 'Please fill in all required showroom fields.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Validation Error', 'Enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmittingShowroom(true);
    try {
      await createShowroom({
        name,
        code: code.toUpperCase(),
        address,
        contact_phone: cleanPhone,
        contact_email: email.trim(),
      });

      Alert.alert('Success', `Showroom "${name}" onboarded successfully!`);
      setShowAddShowroomModal(false);
      setName('');
      setCode('');
      setAddress('');
      setPhone('');
      setEmail('');
      fetchPlatformData();
    } catch (err: any) {
      Alert.alert('Onboarding Failed', err.message || 'Could not onboard showroom');
    } finally {
      setIsSubmittingShowroom(false);
    }
  };

  const handleProvisionAdmin = async () => {
    if (!selectedShowroomForAdmin) return;
    if (!adminName || !adminPhone || !adminPassword) {
      Alert.alert('Validation Error', 'Please fill in name, phone, and password.');
      return;
    }

    const cleanPhone = adminPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Validation Error', 'Enter a valid 10-digit admin phone number.');
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      await provisionShowroomAdmin({
        showroom_id: selectedShowroomForAdmin.id,
        full_name: adminName.trim(),
        phone: cleanPhone,
        email: adminEmail.trim() || undefined,
        password: adminPassword,
      });

      Alert.alert(
        'Admin Provisioned',
        `Allocated Admin account for ${adminName} at ${selectedShowroomForAdmin.name}!`
      );
      setShowAddAdminModal(false);
      setSelectedShowroomForAdmin(null);
      setAdminName('');
      setAdminPhone('');
      setAdminEmail('');
      setAdminPassword('');
      fetchPlatformData();
    } catch (err: any) {
      Alert.alert('Provisioning Failed', err.message || 'Could not provision admin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const activeCount = showrooms.filter((s) => s.status === 'ACTIVE').length;

  const filteredShowrooms = showrooms.filter((s) => {
    if (statusFilter === 'ACTIVE') return s.status === 'ACTIVE';
    if (statusFilter === 'SUSPENDED') return s.status === 'SUSPENDED';
    return true;
  });

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'profile':
        return <AdminProfileScreen />;
      case 'showrooms':
      case 'audit_logs':
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
                  <Text style={styles.badge}>SUPERADMIN GOVERNANCE</Text>
                  <Text style={styles.title}>Platform Control</Text>
                </View>
              </View>
              <TouchableOpacity onPress={logout} style={styles.headerLogoutBtn}>
                <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{showrooms.length}</Text>
                <Text style={styles.statLabel}>Total Showrooms</Text>
              </View>

              <View style={[styles.statCard, styles.activeBorder]}>
                <Text style={[styles.statNumber, styles.activeText]}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active Branches</Text>
              </View>
            </View>

            {/* Action Button */}
            <Button
              title="➕ Onboard New Showroom"
              onPress={() => setShowAddShowroomModal(true)}
              style={styles.addBtn}
            />

            {/* Showroom Network Status Filter */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dealership Network Directory</Text>
            </View>

            <View style={styles.filterRow}>
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    statusFilter === filter ? styles.activeFilterTab : null,
                  ]}
                  onPress={() => setStatusFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      statusFilter === filter ? styles.activeFilterTabText : null,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Showroom List */}
            {loading ? (
              <ActivityIndicator size="large" color="#f43f5e" style={styles.loader} />
            ) : filteredShowrooms.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No showrooms onboarded in this status.</Text>
              </View>
            ) : (
              filteredShowrooms.map((showroom) => (
                <View key={showroom.id} style={styles.showroomCard}>
                  <View style={styles.showroomHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.showroomName}>{showroom.name}</Text>
                      <Text style={styles.showroomCode}>Code: {showroom.code}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        showroom.status === 'ACTIVE'
                          ? styles.activeBadge
                          : styles.suspendedBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>{showroom.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.addressText}>📍 {showroom.address}</Text>
                  <Text style={styles.contactText}>
                    📞 {showroom.contact_phone} • ✉️ {showroom.contact_email}
                  </Text>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.adminActionBtn}
                      onPress={() => {
                        setSelectedShowroomForAdmin(showroom);
                        setShowAddAdminModal(true);
                      }}
                    >
                      <Text style={styles.adminActionText}>👤 Provision Admin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusToggleBtn,
                        showroom.status === 'ACTIVE'
                          ? styles.suspendBtn
                          : styles.activateBtn,
                      ]}
                      onPress={() => handleToggleStatus(showroom)}
                    >
                      <Text style={styles.statusToggleText}>
                        {showroom.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Global System Audit Trail Logs */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Global System Audit Trail</Text>
            </View>

            <View style={styles.card}>
              {auditLogs.length === 0 ? (
                <Text style={styles.emptyAuditText}>No audit trail events logged yet.</Text>
              ) : (
                auditLogs.slice(0, 8).map((log) => (
                  <View key={log.id} style={styles.auditRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.auditActionText}>{log.action.replace(/_/g, ' ')}</Text>
                      <Text style={styles.auditActorText}>
                        By {log.actor_name} • {log.showroom_name}
                      </Text>
                    </View>
                    <Text style={styles.auditTimeText}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))
              )}
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
          <Ionicons name="shield-checkmark" size={16} color="#f43f5e" style={{ marginRight: 6 }} />
          <Text style={styles.headerControlTitle}>SUPERADMIN CONTROL</Text>
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

      <SuperAdminBottomBar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      />

      <SuperAdminDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        onLogout={logout}
      />

      {/* Modal 1: Onboard New Showroom */}
      <Modal
        visible={showAddShowroomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddShowroomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Onboard New Showroom</Text>
            <ScrollView style={styles.modalForm}>
              <Input label="Showroom Name" placeholder="e.g. Apex Honda Central" value={name} onChangeText={setName} />
              <Input label="Showroom Code" placeholder="e.g. APX-01" autoCapitalize="characters" value={code} onChangeText={setCode} />
              <Input label="Full Address" placeholder="Street, City, Pin Code" value={address} onChangeText={setAddress} />
              <Input label="Contact Phone" placeholder="10-digit phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Input label="Contact Email" placeholder="contact@dealership.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

              <Button title="Submit & Register" onPress={handleCreateShowroom} isLoading={isSubmittingShowroom} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowAddShowroomModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Provision Admin Account */}
      <Modal
        visible={showAddAdminModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Provision Admin for {selectedShowroomForAdmin?.name}
            </Text>
            <ScrollView style={styles.modalForm}>
              <Input label="Manager Full Name" placeholder="e.g. Rajesh Kumar" value={adminName} onChangeText={setAdminName} />
              <Input label="Mobile Phone" placeholder="10-digit number" keyboardType="phone-pad" value={adminPhone} onChangeText={setAdminPhone} />
              <Input label="Email (Optional)" placeholder="rajesh@dealership.com" keyboardType="email-address" autoCapitalize="none" value={adminEmail} onChangeText={setAdminEmail} />
              <Input label="Password" placeholder="At least 6 characters" secureTextEntry value={adminPassword} onChangeText={setAdminPassword} />

              <Button title="Provision Showroom Admin" onPress={handleProvisionAdmin} isLoading={isSubmittingAdmin} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowAddAdminModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    color: '#f43f5e',
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
    color: '#f43f5e',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  activeBorder: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  activeText: {
    color: '#f43f5e',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  addBtn: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  activeFilterTab: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  filterTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  loader: {
    marginVertical: 20,
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
  },
  showroomCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  showroomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  showroomName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  showroomCode: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  suspendedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f8fafc',
  },
  addressText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
  },
  contactText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  adminActionBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminActionText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  statusToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suspendBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  activateBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusToggleText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyAuditText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  auditActionText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  auditActorText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  auditTimeText: {
    color: '#64748b',
    fontSize: 11,
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 20,
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
  modalSubmitBtn: {
    marginVertical: 10,
  },
});
