import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import { getServiceJobs, updateServiceJob, ServiceJobItem, ServiceJobStatus } from '../lib/services-api';

export const WorkerDashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [jobs, setJobs] = useState<ServiceJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await getServiceJobs();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId: string, newStatus: ServiceJobStatus) => {
    try {
      setUpdatingId(jobId);
      await updateServiceJob(jobId, { status: newStatus });
      Alert.alert('Status Updated', `Service job status updated to ${newStatus}.`);
      fetchJobs();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update job status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Service Bay';
  const showroomCode = user?.showroom_code || user?.showroom?.code || 'SHW-01';

  const assignedCount = jobs.filter((j) => j.status === 'ASSIGNED' || j.status === 'REQUESTED').length;
  const inProgressCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;

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
              <Text style={styles.badge}>TECHNICIAN SERVICE BAY</Text>
              <Text style={styles.title}>Service Task Queue</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.headerLogoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
          </TouchableOpacity>
        </View>

        {/* Showroom Context */}
        <View style={styles.showroomCard}>
          <Text style={styles.cardLabel}>ASSIGNED WORKSHOP</Text>
          <Text style={styles.showroomName}>{showroomTitle}</Text>
          <Text style={styles.showroomCode}>Dealer Code: {showroomCode}</Text>
        </View>

        {/* Task Summary Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{assignedCount}</Text>
            <Text style={styles.statLabel}>Assigned Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.inProgressText]}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.completedText]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Task Queue List / Empty State */}
        {loading ? (
          <ActivityIndicator size="large" color="#f59e0b" style={{ marginVertical: 20 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>Task Queue Clear</Text>
            <Text style={styles.emptyDesc}>
              No service jobs assigned to your queue at this moment. When showroom managers allocate a repair task, it will appear here instantly.
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.jobItemCard}>
              <View style={styles.jobHeaderRow}>
                <Text style={styles.jobCustomer}>{job.customer_name}</Text>
                <View style={[styles.jobStatusTag, { backgroundColor: job.status === 'COMPLETED' ? '#10b981' : job.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6' }]}>
                  <Text style={styles.jobStatusText}>{job.status}</Text>
                </View>
              </View>
              <Text style={styles.jobVehicle}>{job.vehicle_details} ({job.vehicle_type})</Text>
              <Text style={styles.jobDesc}>{job.service_description}</Text>
              <Text style={styles.jobPhone}>📞 Contact: {job.customer_phone}</Text>

              {/* Status Action Controls */}
              <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1e293b', flexDirection: 'row', gap: 10 }}>
                {job.status !== 'IN_PROGRESS' && job.status !== 'COMPLETED' ? (
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#f59e0b', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                    disabled={updatingId === job.id}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>⚡ Start Repair</Text>
                  </TouchableOpacity>
                ) : null}

                {job.status !== 'COMPLETED' ? (
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => handleUpdateStatus(job.id, 'COMPLETED')}
                    disabled={updatingId === job.id}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>✅ Mark Complete</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flex: 1, backgroundColor: '#1e293b', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>Job Finished 🎉</Text>
                  </View>
                )}
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
  header: {
    marginBottom: 20,
  },
  badge: {
    color: '#f59e0b',
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
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  showroomName: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  showroomCode: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  inProgressText: {
    color: '#f59e0b',
  },
  completedText: {
    color: '#10b981',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: 10,
  },
  jobItemCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobCustomer: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  jobStatusTag: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  jobVehicle: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  jobDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  jobPhone: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
