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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import { getStaffMembers, createStaffMember, StaffMember } from '../lib/staff-api';
import { getServiceJobs, updateServiceJob, ServiceJobItem } from '../lib/services-api';
import { getAdminShowroomFeedbacks, respondToFeedback, FeedbackItem } from '../lib/feedback-api';
import { getSpareParts } from '../lib/spare-parts-api';
import { SparePart } from '../types/spare-part';
import { getShowroomEnquiries, EnquiryItem } from '../lib/enquiries-api';

// Dedicated Navigation & Sub-screens
import { AdminDrawer, AdminRouteName } from '../components/navigation/AdminDrawer';
import { AdminBottomBar } from '../components/navigation/AdminBottomBar';
import { AdminServiceJobsScreen } from './AdminServiceJobsScreen';
import { AdminEnquiriesScreen } from './AdminEnquiriesScreen';
import { AdminReviewsScreen } from './AdminReviewsScreen';
import { AdminStaffScreen } from './AdminStaffScreen';
import { AdminReportsScreen } from './AdminReportsScreen';
import { AdminProfileScreen } from './AdminProfileScreen';
import { VehiclesScreen } from './VehiclesScreen';
import { SparePartsScreen } from './SparePartsScreen';

interface AdminDashboardScreenProps {
  onNavigateToVehicles?: () => void;
  onNavigateToSpareParts?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = () => {
  const { user, logout } = useAuthStore();

  // Active Screen / Navigation State
  const [currentRoute, setCurrentRoute] = useState<AdminRouteName>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Data Store States
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJobItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Provision Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'INVENTORY_MANAGER'>('WORKER');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Assign Worker Modal State
  const [selectedJob, setSelectedJob] = useState<ServiceJobItem | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Response Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [staffData, jobsData, feedbackData, partsData, enquiriesData] = await Promise.all([
        getStaffMembers().catch(() => []),
        getServiceJobs().catch(() => []),
        getAdminShowroomFeedbacks().catch(() => []),
        getSpareParts({ showroom_id: user?.showroom_id || undefined }).catch(() => []),
        getShowroomEnquiries().catch(() => []),
      ]);
      setStaff(staffData);
      setServiceJobs(jobsData);
      setFeedbacks(feedbackData);
      setSpareParts(partsData);
      setEnquiries(enquiriesData);
    } catch {
      setStaff([]);
      setServiceJobs([]);
      setFeedbacks([]);
      setSpareParts([]);
      setEnquiries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
  };

  const handleCreateStaff = async () => {
    if (!fullName.trim() || !phone || !password) {
      Alert.alert('Validation Error', 'Please fill in name, phone, and password.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Validation Error', 'Enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      await createStaffMember({
        full_name: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        role,
      });

      Alert.alert('Success', `Provisioned ${fullName} as ${role === 'WORKER' ? 'Technician' : 'Inventory Manager'}!`);
      setShowAddStaffModal(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not provision staff member');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleAssignTechnician = async (workerId: string, workerName: string) => {
    if (!selectedJob) return;
    try {
      setIsAssigning(true);
      await updateServiceJob(selectedJob.id, {
        assigned_worker_id: workerId,
        status: 'ASSIGNED',
      });

      Alert.alert('Worker Assigned', `Allocated service job for ${selectedJob.customer_name} to ${workerName}.`);
      setSelectedJob(null);
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Assignment Failed', err.message || 'Failed to assign technician.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSendFeedbackResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      Alert.alert('Validation Error', 'Please enter a response message.');
      return;
    }
    try {
      setIsResponding(true);
      await respondToFeedback(selectedFeedback.id, {
        admin_response: responseText.trim(),
        status: 'APPROVED',
      });

      Alert.alert('Response Sent', 'Official dealer response published successfully!');
      setSelectedFeedback(null);
      setResponseText('');
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Response Error', err.message || 'Failed to submit response.');
    } finally {
      setIsResponding(false);
    }
  };

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Branch';
  const showroomCode = user?.showroom_code || user?.showroom?.code || (user?.showroom_id ? user.showroom_id.slice(0, 6).toUpperCase() : 'SHW-01');

  const workerCount = staff.filter((s) => s.role === 'WORKER').length;
  const workersList = staff.filter((s) => s.role === 'WORKER');

  // Activity feed items combining real latest data
  const activityItems = [
    ...serviceJobs.slice(0, 2).map((j) => ({
      id: `job-${j.id}`,
      type: 'JOB',
      icon: 'construct' as const,
      color: '#a855f7',
      title: 'New service job assigned',
      subtitle: `#SJ-${j.id.slice(0, 4)} • ${j.vehicle_details || j.vehicle_type}`,
      targetRoute: 'service_jobs' as AdminRouteName,
    })),
    ...spareParts.filter((p) => p.stock_quantity <= p.min_stock_alert).slice(0, 1).map((p) => ({
      id: `part-${p.id}`,
      type: 'ALERT',
      icon: 'cube' as const,
      color: '#f59e0b',
      title: `Stock alert: ${p.part_name}`,
      subtitle: `${p.stock_quantity} items left • Low Stock`,
      targetRoute: 'spare_parts' as AdminRouteName,
    })),
    ...feedbacks.slice(0, 2).map((f) => ({
      id: `review-${f.id}`,
      type: 'REVIEW',
      icon: 'star' as const,
      color: '#eab308',
      title: 'New customer review received',
      subtitle: `${f.rating}/5 Stars • ${f.customer_name || 'Customer'}`,
      targetRoute: 'customer_reviews' as AdminRouteName,
    })),
  ];

  // Helper to render body based on active route
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'service_jobs':
      case 'worker_dispatch':
        return (
          <AdminServiceJobsScreen
            serviceJobs={serviceJobs}
            staff={staff}
            onRefresh={fetchAdminData}
            onAssignTechnician={(job) => setSelectedJob(job)}
          />
        );
      case 'enquiries':
        return (
          <AdminEnquiriesScreen
            enquiries={enquiries}
            onRefresh={fetchAdminData}
          />
        );
      case 'customer_reviews':
        return (
          <AdminReviewsScreen
            feedbacks={feedbacks}
            onRefresh={fetchAdminData}
            onRespond={(fb) => setSelectedFeedback(fb)}
          />
        );
      case 'staff_directory':
        return (
          <AdminStaffScreen
            staff={staff}
            onRefresh={fetchAdminData}
            onAddStaff={() => setShowAddStaffModal(true)}
          />
        );
      case 'vehicles':
        return (
          <VehiclesScreen
            onSelectVehicle={() => {}}
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'spare_parts':
        return (
          <SparePartsScreen
            onSelectPart={() => {}}
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'reports':
        return (
          <AdminReportsScreen
            serviceJobs={serviceJobs}
            feedbacks={feedbacks}
            staff={staff}
          />
        );
      case 'profile':
        return <AdminProfileScreen />;
      case 'dashboard':
      default:
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#a855f7"
              />
            }
          >
            {/* Control Center Subheader Banner */}
            <View style={styles.dashboardBannerHeader}>
              <Text style={styles.dashboardTitle}>Dealership Dashboard</Text>
              <Text style={styles.dashboardSubtitle}>
                Manage staff credentials, inventory, and service operations for {showroomTitle}.
              </Text>
            </View>

            {/* Assigned Dealership Scope Card */}
            <View style={styles.scopeCard}>
              <View style={styles.scopeLeftCol}>
                <Text style={styles.scopeLabel}>ASSIGNED DEALERSHIP SCOPE</Text>
                <Text style={styles.scopeShowroomName}>{showroomTitle}</Text>
                <Text style={styles.scopeBranchCode}>Branch Code: {showroomCode}</Text>
              </View>
              <View style={styles.scopeIconBox}>
                <Ionicons name="business" size={26} color="#a855f7" />
              </View>
            </View>

            {/* Statistics Row */}
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => setCurrentRoute('staff_directory')}
                activeOpacity={0.8}
              >
                <Ionicons name="people" size={20} color="#f59e0b" style={{ marginBottom: 6 }} />
                <Text style={styles.statNumber}>{workerCount}</Text>
                <Text style={styles.statLabel}>Technicians</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => setCurrentRoute('spare_parts')}
                activeOpacity={0.8}
              >
                <Ionicons name="cube" size={20} color="#06b6d4" style={{ marginBottom: 6 }} />
                <Text style={[styles.statNumber, { color: '#06b6d4' }]}>
                  {spareParts.length}
                </Text>
                <Text style={styles.statLabel}>Spare Parts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statCard, styles.jobsStatCard]}
                onPress={() => setCurrentRoute('service_jobs')}
                activeOpacity={0.8}
              >
                <Ionicons name="construct" size={20} color="#a855f7" style={{ marginBottom: 6 }} />
                <Text style={[styles.statNumber, { color: '#a855f7' }]}>
                  {serviceJobs.length}
                </Text>
                <Text style={styles.statLabel}>Service Jobs</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setCurrentRoute('enquiries')}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubbles" size={24} color="#a855f7" />
                <Text style={styles.quickActionLabel}>Inquiries</Text>
                <Ionicons name="chevron-forward" size={14} color="#64748b" style={{ marginTop: 2 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setCurrentRoute('vehicles')}
                activeOpacity={0.7}
              >
                <Ionicons name="bicycle" size={24} color="#f43f5e" />
                <Text style={styles.quickActionLabel}>Vehicles</Text>
                <Ionicons name="chevron-forward" size={14} color="#64748b" style={{ marginTop: 2 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setCurrentRoute('spare_parts')}
                activeOpacity={0.7}
              >
                <Ionicons name="settings" size={24} color="#38bdf8" />
                <Text style={styles.quickActionLabel}>Spare Parts</Text>
                <Ionicons name="chevron-forward" size={14} color="#64748b" style={{ marginTop: 2 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, styles.addStaffActionCard]}
                onPress={() => setShowAddStaffModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add" size={24} color="#a855f7" />
                <Text style={styles.quickActionLabel}>Add Staff</Text>
                <Ionicons name="chevron-forward" size={14} color="#a855f7" style={{ marginTop: 2 }} />
              </TouchableOpacity>
            </View>

            {/* Recent Activity Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Recent Activity</Text>
              <TouchableOpacity
                onPress={() => setCurrentRoute('service_jobs')}
                activeOpacity={0.7}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Feed Items */}
            {activityItems.length === 0 ? (
              <View style={styles.emptyActivityCard}>
                <Ionicons name="pulse-outline" size={32} color="#475569" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No recent activity yet</Text>
                <Text style={styles.emptyActivitySub}>
                  Showroom operational logs and job updates will appear here.
                </Text>
              </View>
            ) : (
              activityItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.activityCard}
                  onPress={() => setCurrentRoute(item.targetRoute)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.activityIconBox, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#475569" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        );
    }
  };

  return (
    <SafeScreen style={styles.safeContainer}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Ionicons name="settings" size={16} color="#a855f7" style={{ marginRight: 6 }} />
          <Text style={styles.headerControlTitle}>SHOWROOM ADMIN CONTROL</Text>
        </View>

        <TouchableOpacity
          onPress={() => setCurrentRoute('profile')}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      {/* Main View Area */}
      <View style={styles.mainContentArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={styles.loadingText}>Loading Showroom Dashboard...</Text>
          </View>
        ) : (
          renderCurrentView()
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <AdminBottomBar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      />

      {/* Navigation Drawer Component */}
      <AdminDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        showroomName={showroomTitle}
        showroomCode={showroomCode}
        onLogout={logout}
      />

      {/* Provision Staff Modal */}
      <Modal
        visible={showAddStaffModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Provision Staff Member</Text>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.roleLabel}>Select Staff Role:</Text>
              <View style={styles.roleToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleToggleBtn,
                    role === 'WORKER' ? styles.roleActiveWorker : null,
                  ]}
                  onPress={() => setRole('WORKER')}
                >
                  <Text style={styles.roleToggleText}>🔧 Technician (Worker)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleToggleBtn,
                    role === 'INVENTORY_MANAGER' ? styles.roleActiveInventory : null,
                  ]}
                  onPress={() => setRole('INVENTORY_MANAGER')}
                >
                  <Text style={styles.roleToggleText}>📦 Stock Manager</Text>
                </TouchableOpacity>
              </View>

              <Input label="Staff Full Name" placeholder="e.g. Ramesh Kumar" value={fullName} onChangeText={setFullName} />
              <Input label="Mobile Phone Number" placeholder="10-digit phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Input label="Email (Optional)" placeholder="ramesh@dealership.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <Input label="Password" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />

              <Button title="Provision Staff Account" onPress={handleCreateStaff} isLoading={isSubmittingStaff} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowAddStaffModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assign Worker Modal */}
      <Modal
        visible={selectedJob !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Service Technician</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
              Select a technician for job #{selectedJob?.id.slice(0, 8)} ({selectedJob?.customer_name})
            </Text>

            {workersList.length === 0 ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#ef4444', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
                  No active Technicians / Workers provisioned for this showroom yet.
                </Text>
                <Button
                  title="➕ Provision Technician First"
                  onPress={() => {
                    setSelectedJob(null);
                    setRole('WORKER');
                    setShowAddStaffModal(true);
                  }}
                />
              </View>
            ) : (
              workersList.map((worker) => (
                <TouchableOpacity
                  key={worker.id}
                  style={{
                    backgroundColor: '#1e293b',
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => handleAssignTechnician(worker.id, worker.full_name)}
                  disabled={isAssigning}
                >
                  <View>
                    <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>🔧 {worker.full_name}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>📞 {worker.phone}</Text>
                  </View>
                  <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '700' }}>Allocate →</Text>
                </TouchableOpacity>
              ))
            )}

            <Button
              title="Close"
              variant="secondary"
              onPress={() => setSelectedJob(null)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Response to Customer Feedback Modal */}
      <Modal
        visible={selectedFeedback !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedFeedback(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Official Dealer Response</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
              Respond to customer review by {selectedFeedback?.customer_name || 'Customer'} ({'⭐'.repeat(selectedFeedback?.rating || 5)})
            </Text>

            <Input
              label="Official Dealership Response *"
              placeholder="Thank the customer or address their service feedback..."
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={4}
            />

            <View style={{ gap: 10, marginTop: 12 }}>
              <Button
                title="Publish Response & Approve"
                onPress={handleSendFeedbackResponse}
                isLoading={isResponding}
              />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setSelectedFeedback(null)}
              />
            </View>
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
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  mainContentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dashboardBannerHeader: {
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  scopeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    marginBottom: 16,
  },
  scopeLeftCol: {
    flex: 1,
  },
  scopeLabel: {
    color: '#a855f7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scopeShowroomName: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '800',
  },
  scopeBranchCode: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 2,
  },
  scopeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  jobsStatCard: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f59e0b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  addStaffActionCard: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  quickActionLabel: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  viewAllBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  viewAllText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyActivityCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyActivityTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyActivitySub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  activityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  activitySubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 1,
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
  roleLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  roleToggleBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleActiveWorker: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  roleActiveInventory: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  roleToggleText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    marginVertical: 10,
  },
});
