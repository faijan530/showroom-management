import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import {
  getShowrooms,
  createShowroom,
  updateShowroomStatus,
  provisionShowroomAdmin,
} from '../lib/showrooms-api';
import { Showroom } from '../types/showroom';

export const SuperAdminDashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const data = await getShowrooms();
      setShowrooms(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load platform showrooms');
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
      // Reset form
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
        `Admin credentials created for ${selectedShowroomForAdmin.name}!`
      );
      setShowAddAdminModal(false);
      setAdminName('');
      setAdminPhone('');
      setAdminEmail('');
      setAdminPassword('');
      setSelectedShowroomForAdmin(null);
      fetchPlatformData();
    } catch (err: any) {
      Alert.alert('Provisioning Failed', err.message || 'Could not provision admin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const activeCount = showrooms.filter((s) => s.status === 'ACTIVE').length;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>SUPERADMIN PANEL</Text>
          <Text style={styles.title}>Platform Governance</Text>
          <Text style={styles.subtitle}>
            Welcome back, {user?.full_name || 'Superadmin'}. Overview of all registered showrooms.
          </Text>
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

        {/* Showrooms Directory Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registered Dealerships</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : showrooms.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No registered showrooms found.</Text>
          </View>
        ) : (
          showrooms.map((showroom) => (
            <View key={showroom.id} style={styles.showroomCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.showroomTitleCol}>
                  <Text style={styles.showroomName}>{showroom.name}</Text>
                  <Text style={styles.showroomCode}>CODE: {showroom.code}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    showroom.status === 'ACTIVE'
                      ? styles.statusActive
                      : styles.statusSuspended,
                  ]}
                >
                  <Text style={styles.statusText}>{showroom.status}</Text>
                </View>
              </View>

              <Text style={styles.addressText}>📍 {showroom.address}</Text>
              <Text style={styles.contactText}>
                📞 {showroom.contact_phone} • ✉️ {showroom.contact_email}
              </Text>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.adminActionBtn}
                  onPress={() => {
                    setSelectedShowroomForAdmin(showroom);
                    setShowAddAdminModal(true);
                  }}
                >
                  <Text style={styles.adminActionText}>👤 Attach Admin</Text>
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

        <Button
          title="Sign Out"
          onPress={logout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>

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

              <Button title="Create Admin Credentials" onPress={handleProvisionAdmin} isLoading={isSubmittingAdmin} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowAddAdminModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    color: '#f43f5e',
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
    borderColor: '#10b981',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  activeText: {
    color: '#10b981',
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  showroomTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  showroomName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f8fafc',
  },
  showroomCode: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusSuspended: {
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
  logoutBtn: {
    marginTop: 20,
    marginBottom: 30,
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
