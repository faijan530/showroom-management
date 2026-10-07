import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/auth.store';
import { getCustomerEnquiries, EnquiryItem } from '../lib/enquiries-api';
import { getServiceJobs, createServiceJob, ServiceJobItem } from '../lib/services-api';
import { CustomerDrawer, CustomerRouteName } from '../components/navigation/CustomerDrawer';
import { CustomerBottomBar } from '../components/navigation/CustomerBottomBar';
import { CustomerGarageScreen } from './CustomerGarageScreen';
import { VehiclesScreen } from './VehiclesScreen';
import { SparePartsScreen } from './SparePartsScreen';
import { AdminProfileScreen } from './AdminProfileScreen';

interface DashboardScreenProps {
  onNavigateToVehicles?: () => void;
  onNavigateToSpareParts?: () => void;
  onNavigateToGarage?: () => void;
  initialServiceVehicle?: { details: string; type: 'BIKE' | 'CAR' } | null;
  onClearPrefilledServiceVehicle?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  initialServiceVehicle,
  onClearPrefilledServiceVehicle,
}) => {
  const { user, logout } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<CustomerRouteName>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Service Booking Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  useEffect(() => {
    if (initialServiceVehicle) {
      setVehicleType(initialServiceVehicle.type);
      setVehicleDetails(initialServiceVehicle.details);
      setShowServiceModal(true);
      if (onClearPrefilledServiceVehicle) {
        onClearPrefilledServiceVehicle();
      }
    }
  }, [initialServiceVehicle]);

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
      let cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
      if (cleanPhone.length > 10) {
        cleanPhone = cleanPhone.slice(-10);
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        cleanPhone = '9876543210';
      }

      await createServiceJob({
        customer_name: user.full_name || 'Customer',
        customer_phone: cleanPhone,
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

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED' || status === 'APPROVED' || status === 'RESPONDED') {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (status === 'IN_PROGRESS' || status === 'ASSIGNED') {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'garage':
        return (
          <CustomerGarageScreen
            onBack={() => setCurrentRoute('dashboard')}
            onBookServiceForVehicle={(details, type) => {
              setVehicleType(type);
              setVehicleDetails(details);
              setShowServiceModal(true);
              setCurrentRoute('dashboard');
            }}
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
      case 'profile':
        return <AdminProfileScreen />;
      case 'dashboard':
      default:
        return (
          <ScrollView contentContainerStyle={styles.container}>
            {/* Header Hero Banner */}
            <View style={styles.heroBannerCard}>
              <Image
                source={require('../../assets/hero_banner.jpg')}
                style={styles.heroBannerImage}
                resizeMode="cover"
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroBadge}>MOTOHUB CUSTOMER HUB</Text>
                <Text style={styles.heroTitle}>Welcome, {user?.full_name || 'Valued Customer'}!</Text>
                <Text style={styles.heroSub}>
                  Manage scheduled servicing, personal garage, and explore showroom vehicles.
                </Text>
              </View>
            </View>

            {/* Quick Stats (Compact 2-Column) */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="chatbubbles-outline" size={20} color="#38bdf8" style={{ marginBottom: 4 }} />
                <Text style={styles.statNumber}>{enquiries.length}</Text>
                <Text style={styles.statLabel}>Active Inquiries</Text>
              </View>

              <View style={[styles.statCard, styles.activeStatCard]}>
                <Ionicons name="construct-outline" size={20} color="#3b82f6" style={{ marginBottom: 4 }} />
                <Text style={[styles.statNumber, styles.activeStatText]}>{serviceJobs.length}</Text>
                <Text style={styles.statLabel}>Service Bookings</Text>
              </View>
            </View>

            {/* Quick Action Grid (3-Column) */}
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickCard, styles.primaryQuickCard]}
                onPress={() => setShowServiceModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar" size={22} color="#ffffff" />
                <Text style={styles.quickCardTitlePrimary}>Book Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setCurrentRoute('garage')}
                activeOpacity={0.8}
              >
                <Ionicons name="car-sport" size={22} color="#38bdf8" />
                <Text style={styles.quickCardTitle}>My Garage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setCurrentRoute('vehicles')}
                activeOpacity={0.8}
              >
                <Ionicons name="bicycle" size={22} color="#10b981" />
                <Text style={styles.quickCardTitle}>Marketplace</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Activity Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity
                onPress={() => setShowServiceModal(true)}
                style={styles.bookCtaBtn}
              >
                <Ionicons name="add" size={14} color="#3b82f6" />
                <Text style={styles.bookCtaText}>Book Service</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
            ) : serviceJobs.length === 0 && enquiries.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="pulse-outline" size={40} color="#475569" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No active activity yet</Text>
                <Text style={styles.emptyDesc}>
                  Book a service appointment or submit an inquiry to track status online.
                </Text>
                <Button
                  title="📅 Book Scheduled Service"
                  onPress={() => setShowServiceModal(true)}
                  style={{ marginTop: 12, width: '100%' }}
                />
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {serviceJobs.slice(0, 3).map((job) => {
                  const badge = getStatusBadge(job.status);
                  return (
                    <View key={job.id} style={styles.activityCard}>
                      <View style={styles.activityHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityTitle}>{job.vehicle_details} ({job.vehicle_type})</Text>
                          <Text style={styles.activitySub}>Issue: {job.service_description}</Text>
                          {job.assigned_worker_name ? (
                            <Text style={styles.activityTech}>Technician: {job.assigned_worker_name}</Text>
                          ) : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                          <Text style={[styles.statusText, { color: badge.text }]}>{job.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {enquiries.slice(0, 2).map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <View key={item.id} style={styles.activityCard}>
                      <View style={styles.activityHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityTitle}>Inquiry: {item.enquiry_type.replace('_', ' ')}</Text>
                          <Text style={styles.activitySub}>{item.message}</Text>
                          {item.response_notes ? (
                            <Text style={styles.responseNoteText}>Response: "{item.response_notes}"</Text>
                          ) : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                          <Text style={[styles.statusText, { color: badge.text }]}>{item.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

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
          <Ionicons name="heart" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
          <Text style={styles.headerControlTitle}>MOTOHUB CUSTOMER HUB</Text>
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

      <CustomerBottomBar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      />

      <CustomerDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        userName={user?.full_name || 'Valued Customer'}
        userPhone={user?.phone || ''}
        onLogout={logout}
      />

      {/* Modal: Book Service Appointment */}
      <Modal visible={showServiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Service Appointment</Text>
            <Text style={styles.modalSubtitle}>Request servicing for your bike or car at the dealership.</Text>

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
    color: '#3b82f6',
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
  heroBannerCard: {
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    position: 'relative',
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 18, 0.75)',
    padding: 16,
    justifyContent: 'center',
  },
  heroBadge: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  heroSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
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
  activeStatCard: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  statNumber: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  activeStatText: {
    color: '#3b82f6',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  primaryQuickCard: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  quickCardTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  quickCardTitlePrimary: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  bookCtaText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },
  activitySub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  activityTech: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  responseNoteText: {
    color: '#10b981',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  logoutBtn: {
    marginTop: 20,
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
