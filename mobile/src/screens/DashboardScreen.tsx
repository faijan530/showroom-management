import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/auth.store';
import { getCustomerEnquiries, EnquiryItem } from '../lib/enquiries-api';
import {
  getServiceJobs,
  createServiceJob,
  createCustomerServiceRequest,
  getCustomerServiceRequests,
  getCustomerServiceCatalog,
  ServiceJobItem,
  ServicePackage,
} from '../lib/services-api';
import { getPublicShowrooms } from '../lib/showrooms-api';
import { Showroom } from '../types/showroom';
import { CustomerDrawer, CustomerRouteName } from '../components/navigation/CustomerDrawer';
import { CustomerBottomBar } from '../components/navigation/CustomerBottomBar';
import { CustomerGarageScreen } from './CustomerGarageScreen';
import { CustomerServicesScreen } from './CustomerServicesScreen';
import { CustomerEnquiriesScreen } from './CustomerEnquiriesScreen';
import { CustomerServiceTrackerScreen } from './CustomerServiceTrackerScreen';
import { VehiclesScreen } from './VehiclesScreen';
import { SparePartsScreen } from './SparePartsScreen';
import { AdminProfileScreen } from './AdminProfileScreen';
import { getCustomerGarageVehicles, CustomerVehicleItem } from '../lib/customer-garage-api';

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
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [savedVehicles, setSavedVehicles] = useState<CustomerVehicleItem[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);

  // Service Booking Modal / Wizard state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [selectedShowroomId, setSelectedShowroomId] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 11:00 AM');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [selectedJobForTracker, setSelectedJobForTracker] = useState<string | null>(null);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  useEffect(() => {
    if (initialServiceVehicle) {
      setVehicleType(initialServiceVehicle.type);
      setVehicleDetails(initialServiceVehicle.details);
      setBookingStep(1);
      setShowServiceModal(true);
      if (onClearPrefilledServiceVehicle) {
        onClearPrefilledServiceVehicle();
      }
    }
  }, [initialServiceVehicle]);

  const fetchCustomerData = async () => {
    try {
      const [enquiryData, jobsData, showroomsData, catalogData, vehiclesData] = await Promise.all([
        getCustomerEnquiries().catch(() => []),
        getCustomerServiceRequests().catch(() => getServiceJobs().catch(() => [])),
        getPublicShowrooms().catch(() => []),
        getCustomerServiceCatalog().catch(() => []),
        getCustomerGarageVehicles().catch(() => []),
      ]);
      setEnquiries(enquiryData);
      setServiceJobs(jobsData);
      setShowrooms(showroomsData);
      setPackages(catalogData);
      setSavedVehicles(vehiclesData);
      if (showroomsData.length > 0 && !selectedShowroomId) {
        setSelectedShowroomId(showroomsData[0].id);
      }
    } catch {
      setEnquiries([]);
      setServiceJobs([]);
      setShowrooms([]);
      setPackages([]);
      setSavedVehicles([]);
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

    const finalTimeSlot = isCustomTime ? customTime.trim() : timeSlot;
    if (isCustomTime && !customTime.trim()) {
      Alert.alert('Time Required', 'Please enter your preferred manual appointment time.');
      return;
    }

    const targetShowroomId = selectedShowroomId || (showrooms.length > 0 ? showrooms[0].id : undefined);

    try {
      setIsSubmittingService(true);
      let cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
      if (cleanPhone.length > 10) {
        cleanPhone = cleanPhone.slice(-10);
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        cleanPhone = '9876543210';
      }

      if (targetShowroomId) {
        await createCustomerServiceRequest({
          target_showroom_id: targetShowroomId,
          customer_vehicle_id: selectedVehicleId || undefined,
          vehicle_type: vehicleType,
          vehicle_details: vehicleDetails.trim(),
          service_description: serviceDesc.trim(),
          preferred_date: preferredDate,
          time_slot: finalTimeSlot,
        });
      } else {
        await createServiceJob({
          customer_name: user.full_name || 'Customer',
          customer_phone: cleanPhone,
          vehicle_type: vehicleType,
          vehicle_details: vehicleDetails.trim(),
          service_description: serviceDesc.trim(),
        });
      }

      Alert.alert(
        'Service Appointment Confirmed',
        `Your service booking for ${vehicleDetails} is scheduled for ${preferredDate} at ${finalTimeSlot}. Track live workshop progress online!`
      );
      setShowServiceModal(false);
      setBookingStep(1);
      setSelectedVehicleId('');
      setVehicleDetails('');
      setServiceDesc('');
      setSelectedPackage(null);
      setCustomTime('');
      setIsCustomTime(false);
      await fetchCustomerData();
      setCurrentRoute('service_tracker');
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
      case 'services':
        return (
          <CustomerServicesScreen
            onBack={() => setCurrentRoute('dashboard')}
            onSelectPackage={(pkg) => {
              setSelectedPackage(pkg);
              setVehicleType(pkg.vehicle_type === 'CAR' ? 'CAR' : 'BIKE');
              setServiceDesc(`Booking Package: ${pkg.title} (Duration: ${pkg.duration})`);
              setBookingStep(1);
              setShowServiceModal(true);
              setCurrentRoute('dashboard');
            }}
          />
        );
      case 'garage':
        return (
          <CustomerGarageScreen
            onBack={() => setCurrentRoute('dashboard')}
            onBookServiceForVehicle={(details, type) => {
              setVehicleType(type);
              setVehicleDetails(details);
              setBookingStep(1);
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
      case 'inquiries':
        return (
          <CustomerEnquiriesScreen
            onBack={() => setCurrentRoute('dashboard')}
            enquiries={enquiries}
            onRefresh={fetchCustomerData}
          />
        );
      case 'service_tracker':
        return (
          <CustomerServiceTrackerScreen
            onBack={() => setCurrentRoute('dashboard')}
            serviceJobs={serviceJobs}
            onRefresh={fetchCustomerData}
            onBookNewService={() => setShowServiceModal(true)}
            selectedJobId={selectedJobForTracker}
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
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => setCurrentRoute('inquiries')}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#38bdf8" style={{ marginBottom: 4 }} />
                <Text style={styles.statNumber}>{enquiries.length}</Text>
                <Text style={styles.statLabel}>Inquiries & Test Rides</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statCard, styles.activeStatCard]}
                onPress={() => {
                  setSelectedJobForTracker(null);
                  setCurrentRoute('service_tracker');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="construct-outline" size={20} color="#3b82f6" style={{ marginBottom: 4 }} />
                <Text style={[styles.statNumber, styles.activeStatText]}>{serviceJobs.length}</Text>
                <Text style={styles.statLabel}>Service Bookings</Text>
              </TouchableOpacity>
            </View>

            {/* Service Packages Hero Promo Banner */}
            <TouchableOpacity
              style={styles.packageBannerCard}
              onPress={() => setCurrentRoute('services')}
              activeOpacity={0.85}
            >
              <View style={styles.packageBannerLeft}>
                <View style={styles.packageBannerIconWrap}>
                  <Ionicons name="sparkles" size={20} color="#38bdf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.packageBannerTitle}>Certified Service Packages</Text>
                    <View style={styles.packageBadgeLive}>
                      <Ionicons name="time" size={10} color="#38bdf8" />
                      <Text style={styles.packageBadgeLiveText}>Live Turnaround Duration</Text>
                    </View>
                  </View>
                  <Text style={styles.packageBannerSub}>
                    Browse certified maintenance packages with turnaround duration & fixed pricing
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#38bdf8" />
            </TouchableOpacity>

            {/* Quick Action Grid */}
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickCard, styles.primaryQuickCard]}
                onPress={() => setShowServiceModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar" size={20} color="#ffffff" />
                <Text style={styles.quickCardTitlePrimary}>Book Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setCurrentRoute('services')}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={20} color="#38bdf8" />
                <Text style={styles.quickCardTitle}>Packages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setCurrentRoute('garage')}
                activeOpacity={0.8}
              >
                <Ionicons name="car-sport-outline" size={20} color="#a855f7" />
                <Text style={styles.quickCardTitle}>My Garage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setCurrentRoute('vehicles')}
                activeOpacity={0.8}
              >
                <Ionicons name="bicycle-outline" size={20} color="#10b981" />
                <Text style={styles.quickCardTitle}>Market</Text>
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
                    <TouchableOpacity
                      key={job.id}
                      style={styles.activityCard}
                      onPress={() => {
                        setSelectedJobForTracker(job.id);
                        setCurrentRoute('service_tracker');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.activityHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityTitle}>{job.vehicle_details} ({job.vehicle_type})</Text>
                          <Text style={styles.activitySub}>Issue: {job.service_description}</Text>
                          {job.time_slot ? (
                            <Text style={styles.slotText}>⏰ Time Slot: {job.time_slot}</Text>
                          ) : null}
                          {job.assigned_worker_name ? (
                            <Text style={styles.activityTech}>Technician: {job.assigned_worker_name}</Text>
                          ) : null}
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                            <Text style={[styles.statusText, { color: badge.text }]}>{job.status}</Text>
                          </View>
                          <View style={styles.trackPill}>
                            <Text style={styles.trackPillText}>Live Tracker ➔</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {enquiries.slice(0, 2).map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.activityCard}
                      onPress={() => setCurrentRoute('inquiries')}
                      activeOpacity={0.8}
                    >
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
                    </TouchableOpacity>
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

      {/* Modal: Book Service Appointment (4-Step Wizard Matching Web) */}
      <Modal visible={showServiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Book a Vehicle Service Appointment</Text>
                <Text style={styles.modalSubtitle}>
                  Follow our simple multi-step wizard to choose your vehicle, service needs, and preferred time slot.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowServiceModal(false);
                  setBookingStep(1);
                  setSelectedPackage(null);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Step Indicator Tabs */}
            <View style={styles.wizardIndicatorRow}>
              {[
                { num: 1, label: 'Showroom & Vehicle' },
                { num: 2, label: 'Service Need' },
                { num: 3, label: 'Date & Time' },
                { num: 4, label: 'Review & Confirm' },
              ].map((s) => {
                const isActive = bookingStep === s.num;
                const isCompleted = bookingStep > s.num;
                return (
                  <TouchableOpacity
                    key={s.num}
                    style={[
                      styles.stepTab,
                      isActive && styles.stepTabActive,
                      isCompleted && styles.stepTabCompleted,
                    ]}
                    onPress={() => {
                      if (s.num < bookingStep) setBookingStep(s.num);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.stepTabNum,
                        isActive && styles.stepTabNumActive,
                        isCompleted && styles.stepTabNumCompleted,
                      ]}
                    >
                      Step {s.num}
                    </Text>
                    <Text
                      style={[
                        styles.stepTabLabel,
                        isActive && styles.stepTabLabelActive,
                        isCompleted && styles.stepTabLabelCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 4 }}>
              {/* STEP 1: Showroom & Vehicle */}
              {bookingStep === 1 && (
                <View>
                  <View style={styles.stepCardHeader}>
                    <Ionicons name="business" size={18} color="#3b82f6" />
                    <Text style={styles.stepCardTitle}>Step 1: Select Showroom & Vehicle</Text>
                  </View>
                  <Text style={styles.stepCardSubtitle}>Choose target servicing showroom and vehicle details.</Text>

                  {/* Showroom Outlet Selector */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.fieldSectionLabel}>SELECT SERVICING SHOWROOM LOCATION</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                    >
                      {showrooms.map((sh) => {
                        const isSelected = (selectedShowroomId || showrooms[0]?.id) === sh.id;
                        return (
                          <TouchableOpacity
                            key={sh.id}
                            style={[
                              styles.outletChip,
                              isSelected && styles.outletChipActive,
                            ]}
                            onPress={() => setSelectedShowroomId(sh.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="business-outline"
                              size={13}
                              color={isSelected ? '#3b82f6' : '#94a3b8'}
                            />
                            <Text
                              style={[
                                styles.outletChipText,
                                isSelected && styles.outletChipTextActive,
                              ]}
                            >
                              {sh.name} ({sh.code})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Pick From Saved Vehicles */}
                  {savedVehicles.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                      <Text style={styles.fieldSectionLabel}>PICK FROM MY SAVED VEHICLES</Text>
                      {savedVehicles.map((v) => {
                        const isSelected = selectedVehicleId === v.id;
                        return (
                          <TouchableOpacity
                            key={v.id}
                            style={[
                              styles.savedVehicleCard,
                              isSelected && styles.savedVehicleCardActive,
                            ]}
                            onPress={() => {
                              setSelectedVehicleId(v.id);
                              setVehicleType(v.vehicle_type);
                              setVehicleDetails(`${v.title} (${v.reg_number})`);
                            }}
                            activeOpacity={0.8}
                          >
                            <View style={styles.savedVehicleIconBox}>
                              <Ionicons
                                name={v.vehicle_type === 'CAR' ? 'car' : 'bicycle'}
                                size={18}
                                color={isSelected ? '#3b82f6' : '#94a3b8'}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.savedVehicleTitle}>{v.title}</Text>
                              <Text style={styles.savedVehicleReg}>{v.reg_number}</Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Vehicle Type Selector */}
                  <Text style={styles.fieldSectionLabel}>VEHICLE TYPE</Text>
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[styles.typeBtn, vehicleType === 'BIKE' && styles.typeBtnActive]}
                      onPress={() => setVehicleType('BIKE')}
                    >
                      <Text style={[styles.typeBtnText, vehicleType === 'BIKE' && styles.typeBtnTextActive]}>
                        🏍️ Bike / Motorcycle
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.typeBtn, vehicleType === 'CAR' && styles.typeBtnActive]}
                      onPress={() => setVehicleType('CAR')}
                    >
                      <Text style={[styles.typeBtnText, vehicleType === 'CAR' && styles.typeBtnTextActive]}>
                        🚗 Car / Four-Wheeler
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Vehicle Model & Reg Number */}
                  <Input
                    label="Vehicle Model & Reg Number *"
                    placeholder="e.g. Hero Splendor BS6 (UP32 AB 1234)"
                    value={vehicleDetails}
                    onChangeText={(txt) => {
                      setVehicleDetails(txt);
                      setSelectedVehicleId('');
                    }}
                  />

                  {/* Navigation Row */}
                  <View style={styles.wizardNavRow}>
                    <Button
                      title="Next: Service Need ›"
                      onPress={() => {
                        if (!vehicleDetails.trim()) {
                          Alert.alert('Vehicle Required', 'Please enter or select vehicle model & registration number.');
                          return;
                        }
                        setBookingStep(2);
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}

              {/* STEP 2: Service Need */}
              {bookingStep === 2 && (
                <View>
                  <View style={styles.stepCardHeader}>
                    <Ionicons name="construct" size={18} color="#f59e0b" />
                    <Text style={styles.stepCardTitle}>Step 2: Describe Service Needs</Text>
                  </View>
                  <Text style={styles.stepCardSubtitle}>Specify requested servicing package or describe issues.</Text>

                  {/* Service Package Selector with Turnaround Duration */}
                  {packages.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={styles.fieldSectionLabel}>CERTIFIED MAINTENANCE PACKAGES (OPTIONAL)</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setShowServiceModal(false);
                            setCurrentRoute('services');
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.viewCatalogLink}>Full Catalog ›</Text>
                        </TouchableOpacity>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.pkgCardChip,
                            selectedPackage === null && styles.pkgCardChipActive,
                          ]}
                          onPress={() => setSelectedPackage(null)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.pkgCardChipTitle,
                              selectedPackage === null && styles.pkgCardChipTitleActive,
                            ]}
                          >
                            Custom / General Issue
                          </Text>
                          <Text style={styles.pkgCardChipSubtitle}>On-demand diagnostics</Text>
                        </TouchableOpacity>

                        {packages.map((pkg) => {
                          const isSelected = selectedPackage?.id === pkg.id;
                          return (
                            <TouchableOpacity
                              key={pkg.id}
                              style={[
                                styles.pkgCardChip,
                                isSelected && styles.pkgCardChipActive,
                              ]}
                              onPress={() => {
                                setSelectedPackage(pkg);
                                setVehicleType(pkg.vehicle_type === 'CAR' ? 'CAR' : 'BIKE');
                                setServiceDesc(`Booking Package: ${pkg.title} (Duration: ${pkg.duration})`);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <Text
                                  style={[
                                    styles.pkgCardChipTitle,
                                    isSelected && styles.pkgCardChipTitleActive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {pkg.title}
                                </Text>
                                <Text style={styles.pkgCardPrice}>₹{pkg.price}</Text>
                              </View>
                              <View style={styles.pkgDurationPill}>
                                <Ionicons name="time" size={11} color="#38bdf8" />
                                <Text style={styles.pkgDurationPillText}>{pkg.duration}</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* Active Package Banner with Turnaround Duration */}
                  {selectedPackage && (
                    <View style={styles.packageBannerSelected}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.packageBannerIcon}>
                          <Ionicons name="time" size={20} color="#38bdf8" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.packageBannerTitleSelected}>{selectedPackage.title}</Text>
                          <Text style={styles.packageBannerSubSelected}>
                            Estimated Turnaround Time: <Text style={{ color: '#38bdf8', fontWeight: '800' }}>{selectedPackage.duration}</Text>
                          </Text>
                        </View>
                        <Text style={styles.packageBannerPriceSelected}>₹{selectedPackage.price}</Text>
                      </View>
                    </View>
                  )}

                  <Input
                    label="Service Requirements / Issue Notes *"
                    placeholder="Describe issues (e.g. Engine oil change, brake squeal, 50-point general servicing)..."
                    value={serviceDesc}
                    onChangeText={setServiceDesc}
                    multiline
                    numberOfLines={4}
                  />

                  {/* Navigation Row */}
                  <View style={styles.wizardNavRow}>
                    <Button
                      title="‹ Back"
                      variant="secondary"
                      onPress={() => setBookingStep(1)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Next: Date & Time ›"
                      onPress={() => {
                        if (!serviceDesc.trim()) {
                          Alert.alert('Service Need Required', 'Please describe the service requirements.');
                          return;
                        }
                        setBookingStep(3);
                      }}
                      style={{ flex: 2 }}
                    />
                  </View>
                </View>
              )}

              {/* STEP 3: Date & Time */}
              {bookingStep === 3 && (
                <View>
                  <View style={styles.stepCardHeader}>
                    <Ionicons name="calendar" size={18} color="#38bdf8" />
                    <Text style={styles.stepCardTitle}>Step 3: Preferred Date & Time Slot</Text>
                  </View>
                  <Text style={styles.stepCardSubtitle}>Select preferred appointment date and time window.</Text>

                  {/* Preferred Service Date */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.fieldSectionLabel}>PREFERRED SERVICE DATE</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                      <TouchableOpacity
                        style={[
                          styles.quickDateBtn,
                          preferredDate === new Date().toISOString().split('T')[0] && styles.quickDateBtnActive,
                        ]}
                        onPress={() => setPreferredDate(new Date().toISOString().split('T')[0])}
                      >
                        <Text style={styles.quickDateText}>Today</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.quickDateBtn,
                          (() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            return preferredDate === d.toISOString().split('T')[0];
                          })() && styles.quickDateBtnActive,
                        ]}
                        onPress={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          setPreferredDate(d.toISOString().split('T')[0]);
                        }}
                      >
                        <Text style={styles.quickDateText}>Tomorrow</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.quickDateBtn,
                          (() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 2);
                            return preferredDate === d.toISOString().split('T')[0];
                          })() && styles.quickDateBtnActive,
                        ]}
                        onPress={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 2);
                          setPreferredDate(d.toISOString().split('T')[0]);
                        }}
                      >
                        <Text style={styles.quickDateText}>In 2 Days</Text>
                      </TouchableOpacity>
                    </View>

                    <Input
                      label="Date (YYYY-MM-DD) *"
                      placeholder="2026-10-09"
                      value={preferredDate}
                      onChangeText={setPreferredDate}
                    />
                  </View>

                  {/* Time Slot & Manual Time Selection */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.fieldSectionLabel}>PREFERRED TIME WINDOW / SLOT</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map(
                        (slot) => {
                          const isSelected = !isCustomTime && timeSlot === slot;
                          return (
                            <TouchableOpacity
                              key={slot}
                              style={[styles.slotChip, isSelected && styles.slotChipActive]}
                              onPress={() => {
                                setTimeSlot(slot);
                                setIsCustomTime(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="time-outline"
                                size={12}
                                color={isSelected ? '#3b82f6' : '#94a3b8'}
                              />
                              <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                                {slot}
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      )}

                      {/* Manual / Custom Time Button */}
                      <TouchableOpacity
                        style={[styles.slotChip, isCustomTime && styles.slotChipActive]}
                        onPress={() => {
                          setIsCustomTime(true);
                          if (!customTime) setCustomTime('10:30 AM');
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="create-outline"
                          size={12}
                          color={isCustomTime ? '#3b82f6' : '#94a3b8'}
                        />
                        <Text style={[styles.slotChipText, isCustomTime && styles.slotChipTextActive]}>
                          ✏️ Custom Time
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Custom Manual Time Input */}
                    {isCustomTime && (
                      <View style={{ marginTop: 4, marginBottom: 8 }}>
                        <Input
                          label="Specify Custom Preferred Time (e.g. 10:30 AM, 04:15 PM) *"
                          placeholder="e.g. 10:30 AM"
                          value={customTime}
                          onChangeText={setCustomTime}
                        />
                      </View>
                    )}

                    {/* Live Appointment Time Display Indicator */}
                    <View style={styles.activeTimeSlotDisplay}>
                      <Ionicons name="time" size={14} color="#f59e0b" />
                      <Text style={styles.activeTimeSlotDisplayText}>
                        Appointment Time: <Text style={{ color: '#fbbf24', fontWeight: '800' }}>
                          {isCustomTime ? (customTime.trim() || 'Enter manual time above') : timeSlot}
                        </Text>
                        {isCustomTime ? ' (Custom Manual Time)' : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Navigation Row */}
                  <View style={styles.wizardNavRow}>
                    <Button
                      title="‹ Back"
                      variant="secondary"
                      onPress={() => setBookingStep(2)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Next: Review & Confirm ›"
                      onPress={() => {
                        if (isCustomTime && !customTime.trim()) {
                          Alert.alert('Time Required', 'Please enter your preferred manual appointment time.');
                          return;
                        }
                        setBookingStep(4);
                      }}
                      style={{ flex: 2 }}
                    />
                  </View>
                </View>
              )}

              {/* STEP 4: Review & Confirm */}
              {bookingStep === 4 && (
                <View>
                  <View style={styles.stepCardHeader}>
                    <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                    <Text style={styles.stepCardTitle}>Step 4: Review & Confirm Booking</Text>
                  </View>
                  <Text style={styles.stepCardSubtitle}>Review appointment details before submitting.</Text>

                  <View style={styles.bookingSummaryCard}>
                    <View style={styles.summaryDetails}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Customer Name:</Text>
                        <Text style={styles.summaryValue}>{user?.full_name} ({user?.phone})</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Vehicle:</Text>
                        <Text style={styles.summaryValueHighlight}>{vehicleDetails} ({vehicleType})</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service Description:</Text>
                        <Text style={styles.summaryValue}>{serviceDesc}</Text>
                      </View>
                      {selectedPackage && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Turnaround Time:</Text>
                          <Text style={styles.summaryValueTurnaround}>
                            ⏱️ {selectedPackage.duration} ({selectedPackage.title})
                          </Text>
                        </View>
                      )}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Appointment Slot:</Text>
                        <Text style={styles.summaryValueHighlight}>
                          📅 {preferredDate} • ⏰ {isCustomTime ? customTime.trim() : timeSlot}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Navigation Row */}
                  <View style={styles.wizardNavRow}>
                    <Button
                      title="‹ Back"
                      variant="secondary"
                      onPress={() => setBookingStep(3)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Confirm & Book Service"
                      onPress={handleCreateServiceBooking}
                      isLoading={isSubmittingService}
                      style={{ flex: 2 }}
                    />
                  </View>
                </View>
              )}
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
  slotText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  trackPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  trackPillText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '800',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  fieldSectionLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  outletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  outletChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  outletChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  outletChipTextActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  quickDateBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickDateBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  quickDateText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  slotChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3b82f6',
  },
  slotChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  slotChipTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  packageBannerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packageBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageBannerTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  packageBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  packageBadgeLiveText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  packageBannerSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  viewCatalogLink: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  pkgCardChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 160,
  },
  pkgCardChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3b82f6',
  },
  pkgCardChipTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  pkgCardChipTitleActive: {
    color: '#f8fafc',
    fontWeight: '800',
  },
  pkgCardChipSubtitle: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
  pkgCardPrice: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  pkgDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  pkgDurationPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  packageBannerSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 14,
  },
  packageBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageBannerTitleSelected: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  packageBannerSubSelected: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  packageBannerPriceSelected: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
  },
  activeTimeSlotDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginTop: 4,
  },
  activeTimeSlotDisplayText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingSummaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  summaryHeaderTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryDetails: {
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryValueHighlight: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryValueTurnaround: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  wizardIndicatorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  stepTab: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  stepTabCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  stepTabNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 2,
  },
  stepTabNumActive: {
    color: '#38bdf8',
  },
  stepTabNumCompleted: {
    color: '#10b981',
  },
  stepTabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  stepTabLabelActive: {
    color: '#f8fafc',
  },
  stepTabLabelCompleted: {
    color: '#a7f3d0',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  stepCardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14,
  },
  savedVehicleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  savedVehicleCardActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3b82f6',
  },
  savedVehicleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedVehicleTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  savedVehicleReg: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  wizardNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
});
