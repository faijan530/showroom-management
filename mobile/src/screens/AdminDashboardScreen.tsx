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
import { getStaffMembers, createStaffMember, StaffMember } from '../lib/staff-api';
import { getServiceJobs, updateServiceJob, ServiceJobItem } from '../lib/services-api';
import { getAdminShowroomFeedbacks, respondToFeedback, FeedbackItem } from '../lib/feedback-api';

interface AdminDashboardScreenProps {
  onNavigateToVehicles?: () => void;
  onNavigateToSpareParts?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigateToVehicles,
  onNavigateToSpareParts,
}) => {
  const { user, logout } = useAuthStore();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJobItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Assign Worker Modal
  const [selectedJob, setSelectedJob] = useState<ServiceJobItem | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Response Modal
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'INVENTORY_MANAGER'>('WORKER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [staffData, jobsData, feedbackData] = await Promise.all([
        getStaffMembers().catch(() => []),
        getServiceJobs().catch(() => []),
        getAdminShowroomFeedbacks().catch(() => []),
      ]);
      setStaff(staffData);
      setServiceJobs(jobsData);
      setFeedbacks(feedbackData);
    } catch {
      setStaff([]);
      setServiceJobs([]);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

    setIsSubmitting(true);
    try {
      await createStaffMember({
        full_name: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        role,
      });

      Alert.alert('Success', `Provisioned ${fullName} as ${role === 'WORKER' ? 'Technician' : 'Inventory Manager'}!`);
      setShowModal(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not provision staff member');
    } finally {
      setIsSubmitting(false);
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
  const showroomCode = user?.showroom_code || user?.showroom?.code || 'SHW-01';

  const workerCount = staff.filter((s) => s.role === 'WORKER').length;
  const inventoryCount = staff.filter((s) => s.role === 'INVENTORY_MANAGER').length;
  const workersList = staff.filter((s) => s.role === 'WORKER');

  return (
    <SafeScreen>
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
              <Text style={styles.badge}>MOTOHUB SHOWROOM ADMIN</Text>
              <Text style={styles.title}>Dealership Control</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.headerLogoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
          </TouchableOpacity>
        </View>

        {/* Showroom Profile Banner Card */}
        <View style={styles.showroomCard}>
          <Image
            source={require('../../assets/hero_banner.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.cardLabel}>ASSIGNED SHOWROOM SCOPE</Text>
            <Text style={styles.showroomName}>{showroomTitle}</Text>
            <Text style={styles.showroomCode}>Dealer Branch Code: {showroomCode}</Text>
          </View>
        </View>

        {/* Staff & Operations Executive Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color="#3b82f6" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{workerCount}</Text>
            <Text style={styles.statLabel}>Technicians</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cube" size={20} color="#06b6d4" style={{ marginBottom: 4 }} />
            <Text style={[styles.statNumber, styles.inventoryText]}>{inventoryCount}</Text>
            <Text style={styles.statLabel}>Stock Managers</Text>
          </View>

          <View style={[styles.statCard, styles.jobsStatCard]}>
            <Ionicons name="construct" size={20} color="#8b5cf6" style={{ marginBottom: 4 }} />
            <Text style={[styles.statNumber, styles.jobsStatText]}>{serviceJobs.length}</Text>
            <Text style={styles.statLabel}>Service Jobs</Text>
          </View>
        </View>

        {/* Action Shortcuts with Ionicons */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={onNavigateToVehicles}
          >
            <Ionicons name="bicycle" size={24} color="#38bdf8" style={{ marginBottom: 4 }} />
            <Text style={styles.shortcutTitle}>Vehicles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={onNavigateToSpareParts}
          >
            <Ionicons name="hardware-chip" size={24} color="#10b981" style={{ marginBottom: 4 }} />
            <Text style={styles.shortcutTitle}>Spare Parts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutBtn, styles.addStaffBtn]}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="person-add" size={24} color="#8b5cf6" style={{ marginBottom: 4 }} />
            <Text style={styles.shortcutTitle}>Add Staff</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Service Ratings & Reviews Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Customer Service Ratings & Reviews</Text>
        </View>

        {feedbacks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No customer service reviews submitted yet.</Text>
          </View>
        ) : (
          feedbacks.map((fb) => (
            <View key={fb.id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.staffName}>{fb.customer_name || 'Customer'}</Text>
                  <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                    {'⭐'.repeat(fb.rating)} ({fb.rating}/5 Stars)
                  </Text>
                  <Text style={{ color: '#38bdf8', fontSize: 12, marginTop: 2 }}>Vehicle: {fb.vehicle_details || 'Serviced Vehicle'}</Text>
                  {fb.comment ? (
                    <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>"{fb.comment}"</Text>
                  ) : null}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: fb.status === 'APPROVED' ? '#10b981' : '#f59e0b' }]}>
                  <Text style={styles.roleText}>{fb.status}</Text>
                </View>
              </View>

              {fb.admin_response ? (
                <View style={{ marginTop: 8, padding: 8, backgroundColor: '#1e293b', borderRadius: 6 }}>
                  <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Official Response:</Text>
                  <Text style={{ color: '#f1f5f9', fontSize: 12, marginTop: 2 }}>{fb.admin_response}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1e293b', alignItems: 'flex-end' }}
                  onPress={() => setSelectedFeedback(fb)}
                >
                  <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '700' }}>✍️ Respond to Review →</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Service Jobs Dispatch Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Jobs & Worker Dispatch</Text>
        </View>

        {serviceJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No service requests logged for this showroom.</Text>
          </View>
        ) : (
          serviceJobs.map((job) => (
            <View key={job.id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.staffName}>{job.customer_name}</Text>
                  <Text style={styles.staffPhone}>📞 {job.customer_phone}</Text>
                  <Text style={{ color: '#38bdf8', fontSize: 13, marginTop: 2 }}>{job.vehicle_details} ({job.vehicle_type})</Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>Issue: {job.service_description}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: job.status === 'COMPLETED' ? '#10b981' : job.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6' }]}>
                  <Text style={styles.roleText}>{job.status}</Text>
                </View>
              </View>

              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1e293b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                  {job.assigned_worker_name ? `Technician: ${job.assigned_worker_name}` : 'Unassigned'}
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                  onPress={() => setSelectedJob(job)}
                >
                  <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                    {job.assigned_worker_name ? 'Reassign' : 'Assign Worker'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Staff Directory Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Showroom Staff Directory</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={styles.loader} />
        ) : staff.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No staff members provisioned yet.</Text>
            <Button
              title="➕ Provision First Staff Member"
              onPress={() => setShowModal(true)}
              style={styles.emptyAddBtn}
            />
          </View>
        ) : (
          staff.map((member) => (
            <View key={member.id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <View>
                  <Text style={styles.staffName}>{member.full_name}</Text>
                  <Text style={styles.staffPhone}>📞 {member.phone}</Text>
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    member.role === 'WORKER'
                      ? styles.workerBadge
                      : styles.inventoryBadge,
                  ]}
                >
                  <Text style={styles.roleText}>
                    {member.role === 'WORKER' ? 'WORKER' : 'INVENTORY'}
                  </Text>
                </View>
              </View>

              {member.email ? (
                <Text style={styles.staffEmail}>✉️ {member.email}</Text>
              ) : null}
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

      {/* Modal: Provision Staff */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
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

              <Button title="Provision Staff Account" onPress={handleCreateStaff} isLoading={isSubmitting} style={styles.modalSubmitBtn} />
              <Button title="Cancel" onPress={() => setShowModal(false)} variant="secondary" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Select Technician / Worker for Service Job */}
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
                    setShowModal(true);
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

      {/* Modal: Admin Response to Customer Feedback */}
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
  container: {
    padding: 20,
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
    color: '#8b5cf6',
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
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  showroomCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8b5cf6',
    position: 'relative',
    height: 120,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 18, 0.75)',
    padding: 16,
    justifyContent: 'center',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '800',
  },
  showroomCode: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 2,
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
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  jobsStatText: {
    color: '#8b5cf6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f59e0b',
    marginBottom: 2,
  },
  inventoryText: {
    color: '#06b6d4',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  addStaffBtn: {
    borderColor: '#8b5cf6',
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  shortcutTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  emptyAddBtn: {
    width: '100%',
  },
  staffCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  staffPhone: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  workerBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  inventoryBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f8fafc',
  },
  staffEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
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
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: '#f59e0b',
  },
  roleActiveInventory: {
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
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
