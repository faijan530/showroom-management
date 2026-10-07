import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, Alert, TouchableOpacity } from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/auth.store';
import { getCustomerEnquiries, EnquiryItem } from '../lib/enquiries-api';
import { getServiceJobs, createServiceJob, ServiceJobItem } from '../lib/services-api';

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
  const [serviceJobs, setServiceJobs] = useState<ServiceJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Service Booking Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  const fetchCustomerData = async () => {
    try {
      const [enquiryData, jobsData] = await Promise.all([
        getCustomerEnquiries().catch(() => []),
        getServiceJobs().catch(() => []),
      ]);
      setEnquiries(enquiryData);
      setServiceJobs(jobsData);
    } catch {
      setEnquiries([]);
      setServiceJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleCreateServiceBooking = async () => {
    if (!vehicleDetails.trim() || !serviceDesc.trim()) {
      Alert.alert('Validation Error', 'Please enter vehicle details and service description.');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book a service appointment.');
      return;
    }
    try {
      setIsSubmittingService(true);
      await createServiceJob({
        customer_name: user.full_name || 'Customer',
        customer_phone: user.phone,
        vehicle_type: vehicleType,
        vehicle_details: vehicleDetails.trim(),
        service_description: serviceDesc.trim(),
      });

      Alert.alert(
        'Service Appointment Booked',
        `Your service request for ${vehicleDetails} has been received. Our technicians will inspect your request shortly!`
      );
      setShowServiceModal(false);
      setVehicleDetails('');
      setServiceDesc('');
      fetchCustomerData();
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Failed to submit service booking.');
    } finally {
      setIsSubmittingService(false);
    }
  };

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

        {/* Customer Service Jobs & Booking Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Servicing & Repairs</Text>
          <Text style={styles.cardDesc}>
            Book a service appointment for your bike or car and track repair status live.
          </Text>

          <Button
            title="📅 Book Service Appointment"
            onPress={() => setShowServiceModal(true)}
            style={{ marginBottom: 14 }}
          />

          {serviceJobs.length > 0 ? (
            serviceJobs.map((job) => (
              <View key={job.id} style={styles.enquiryCardItem}>
                <View style={styles.enquiryHeaderRow}>
                  <Text style={styles.enquiryTypeTag}>
                    {job.vehicle_details} ({job.vehicle_type})
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <Text style={styles.statusBadgeText}>{job.status}</Text>
                  </View>
                </View>
                <Text style={styles.enquiryMsg}>{job.service_description}</Text>
                {job.assigned_worker_name ? (
                  <Text style={styles.enquiryShowroom}>Technician Assigned: {job.assigned_worker_name}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyEnquiryBox}>
              <Text style={styles.emptyEnquiryText}>No active service appointments found.</Text>
            </View>
          )}
        </View>

        {/* Modal: Book Service Appointment */}
        <Modal visible={showServiceModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Book Service Appointment</Text>
              <Text style={styles.modalSubtitle}>Request servicing for your bike or car at the dealership.</Text>

              {/* Vehicle Type Selector */}
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, vehicleType === 'BIKE' && styles.typeBtnActive]}
                  onPress={() => setVehicleType('BIKE')}
                >
                  <Text style={[styles.typeBtnText, vehicleType === 'BIKE' && styles.typeBtnTextActive]}>
                    🏍️ Bike / Scooter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, vehicleType === 'CAR' && styles.typeBtnActive]}
                  onPress={() => setVehicleType('CAR')}
                >
                  <Text style={[styles.typeBtnText, vehicleType === 'CAR' && styles.typeBtnTextActive]}>
                    🚗 Car
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Vehicle Model & Reg Number *"
                placeholder="e.g. Hero Splendor Plus (MH 12 AB 1234)"
                value={vehicleDetails}
                onChangeText={setVehicleDetails}
              />

              <Input
                label="Service Issue Description *"
                placeholder="e.g. Annual general service, oil change, brake check"
                value={serviceDesc}
                onChangeText={setServiceDesc}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Submit Service Request"
                  onPress={handleCreateServiceBooking}
                  isLoading={isSubmittingService}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowServiceModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    gap: 10,
    marginTop: 12,
  },
});
