import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import {
  getCustomerGarageVehicles,
  addCustomerGarageVehicle,
  CustomerVehicleItem,
} from '../lib/customer-garage-api';
import { getServiceJobs, ServiceJobItem } from '../lib/services-api';

import { submitServiceFeedback } from '../lib/feedback-api';

interface CustomerGarageScreenProps {
  onBack?: () => void;
  onBookServiceForVehicle?: (vehicleDetails: string, type: 'BIKE' | 'CAR') => void;
}

export const CustomerGarageScreen: React.FC<CustomerGarageScreenProps> = ({
  onBack,
  onBookServiceForVehicle,
}) => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<CustomerVehicleItem[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Vehicle Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [regNumber, setRegNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Star Rating Modal state
  const [selectedRatingJob, setSelectedRatingJob] = useState<ServiceJobItem | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleSubmitReview = async () => {
    if (!selectedRatingJob) return;
    try {
      setIsSubmittingRating(true);
      await submitServiceFeedback({
        service_job_id: selectedRatingJob.id,
        rating: starRating,
        comment: reviewComment.trim() || undefined,
      });

      Alert.alert('Thank You!', 'Your feedback and star rating have been submitted to the dealership!');
      setSelectedRatingJob(null);
      setReviewComment('');
      setStarRating(5);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const fetchGarageData = async () => {
    try {
      setLoading(true);
      const [vData, sData] = await Promise.all([
        getCustomerGarageVehicles().catch(() => []),
        getServiceJobs().catch(() => []),
      ]);
      setVehicles(vData);
      setServiceHistory(sData);
    } catch {
      setVehicles([]);
      setServiceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarageData();
  }, []);

  const handleAddVehicle = async () => {
    if (!title.trim() || !brand.trim() || !model.trim() || !regNumber.trim()) {
      Alert.alert('Validation Error', 'Please fill in title, brand, model, and registration number.');
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2050) {
      Alert.alert('Validation Error', 'Please enter a valid model year (e.g. 2024).');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomerGarageVehicle({
        title: title.trim(),
        vehicle_type: vehicleType,
        brand: brand.trim(),
        model: model.trim(),
        year: yearNum,
        reg_number: regNumber.trim().toUpperCase(),
      });

      Alert.alert('Vehicle Registered', `${title} added to your personal garage!`);
      setShowAddModal(false);
      setTitle('');
      setBrand('');
      setModel('');
      setRegNumber('');
      fetchGarageData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to register vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          {onBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backBtnText}>← Back to Dashboard</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.screenBadge}>DIGITAL GARAGE & SERVICE LOG</Text>
          <Text style={styles.screenTitle}>My Vehicle Garage</Text>
          <Text style={styles.screenSubtitle}>
            Manage your personal vehicles and view digital service history for {user?.full_name || 'your account'}.
          </Text>
        </View>

        {/* Action Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Registered Garage Vehicles</Text>
          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addVehicleBtnText}>➕ Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* Garage Vehicles List */}
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏎️</Text>
            <Text style={styles.emptyTitle}>Your Garage is Empty</Text>
            <Text style={styles.emptyDesc}>
              Register your bike or car to easily track maintenance logs and book service appointments with 1 click.
            </Text>
            <Button
              title="➕ Register Your First Vehicle"
              onPress={() => setShowAddModal(true)}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          vehicles.map((item) => (
            <View key={item.id} style={styles.vehicleCard}>
              <View style={styles.vehicleHeaderRow}>
                <View style={styles.vehicleIconBg}>
                  <Text style={styles.vehicleIcon}>{item.vehicle_type === 'BIKE' ? '🏍️' : '🚗'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.vehicleTitle}>{item.title}</Text>
                  <Text style={styles.vehicleSub}>{item.brand} {item.model} • {item.year}</Text>
                </View>
                <View style={styles.regBadge}>
                  <Text style={styles.regBadgeText}>{item.reg_number}</Text>
                </View>
              </View>

              {onBookServiceForVehicle ? (
                <TouchableOpacity
                  style={styles.bookServiceShortBtn}
                  onPress={() => onBookServiceForVehicle(`${item.title} (${item.reg_number})`, item.vehicle_type)}
                >
                  <Text style={styles.bookServiceShortText}>📅 Schedule Service for This Vehicle →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}

        {/* Digital Service History Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Digital Service History Log</Text>
        </View>

        {serviceHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Service History Logged</Text>
            <Text style={styles.emptyDesc}>
              Completed servicing jobs and workshop inspection receipts will appear here automatically.
            </Text>
          </View>
        ) : (
          serviceHistory.map((job) => (
            <View key={job.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyVehicle}>{job.vehicle_details}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                  <Text style={styles.statusText}>{job.status}</Text>
                </View>
              </View>

              <Text style={styles.historyDesc}>{job.service_description}</Text>

              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>
                  Logged: {new Date(job.created_at).toLocaleDateString()}
                </Text>
                {job.assigned_worker_name ? (
                  <Text style={styles.historyTech}>Technician: {job.assigned_worker_name}</Text>
                ) : null}
              </View>

              {job.status === 'COMPLETED' ? (
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#1e293b',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setSelectedRatingJob(job)}
                >
                  <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '700' }}>⭐ Rate Service Experience</Text>
                  <Text style={{ color: '#38bdf8', fontSize: 11 }}>Submit Review →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal: Add New Vehicle */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register Vehicle to Garage</Text>
            <Text style={styles.modalSubtitle}>Add your bike or car details for quick servicing booking.</Text>

            {/* Type Selector */}
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
              label="Vehicle Nickname / Title *"
              placeholder="e.g. My Daily Splendor, Blue Swift"
              value={title}
              onChangeText={setTitle}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label="Brand *" placeholder="e.g. Hero, TVS" value={brand} onChangeText={setBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Model *" placeholder="e.g. Splendor, Jupiter" value={model} onChangeText={setModel} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label="Model Year *" placeholder="e.g. 2024" keyboardType="numeric" value={year} onChangeText={setYear} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Registration Number *" placeholder="e.g. MH 12 AB 1234" value={regNumber} onChangeText={setRegNumber} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Register Vehicle"
                onPress={handleAddVehicle}
                isLoading={isSubmitting}
              />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowAddModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Service Rating & Review */}
      <Modal visible={selectedRatingJob !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Service Experience</Text>
            <Text style={styles.modalSubtitle}>
              Service Job for {selectedRatingJob?.vehicle_details}
            </Text>

            {/* Star Rating Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setStarRating(star)}
                  style={{ padding: 6 }}
                >
                  <Text style={{ fontSize: 32, opacity: star <= starRating ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: '#f59e0b', textAlign: 'center', fontSize: 14, fontWeight: '700', marginBottom: 16 }}>
              {starRating} out of 5 Stars
            </Text>

            <Input
              label="Review Comments (Optional)"
              placeholder="Share your experience regarding repair quality, promptness, or technician service..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                title="Submit Star Review"
                onPress={handleSubmitReview}
                isLoading={isSubmittingRating}
              />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setSelectedRatingJob(null)}
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
  navHeader: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  screenBadge: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
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
  addVehicleBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addVehicleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  vehicleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 22,
  },
  vehicleTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  vehicleSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  regBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  regBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  bookServiceShortBtn: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'flex-end',
  },
  bookServiceShortText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyVehicle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  historyDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  historyDate: {
    color: '#64748b',
    fontSize: 11,
  },
  historyTech: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: '#10b981',
    borderColor: '#10b981',
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
