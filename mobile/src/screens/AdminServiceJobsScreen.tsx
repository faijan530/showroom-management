import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceJobItem } from '../lib/services-api';
import { StaffMember } from '../lib/staff-api';

interface AdminServiceJobsScreenProps {
  serviceJobs: ServiceJobItem[];
  staff: StaffMember[];
  onRefresh: () => void;
  onAssignTechnician: (job: ServiceJobItem) => void;
}

export const AdminServiceJobsScreen: React.FC<AdminServiceJobsScreenProps> = ({
  serviceJobs,
  onRefresh,
  onAssignTechnician,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredJobs = serviceJobs.filter((job) => {
    if (filter === 'UNASSIGNED') return !job.assigned_worker_id;
    if (filter === 'IN_PROGRESS') return job.status === 'IN_PROGRESS' || job.status === 'ASSIGNED';
    if (filter === 'COMPLETED') return job.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status: string, hasWorker: boolean) => {
    if (status === 'COMPLETED') {
      return { label: 'COMPLETED', bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: '#10b981' };
    }
    if (status === 'IN_PROGRESS' || status === 'ASSIGNED') {
      return { label: 'IN_PROGRESS', bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', border: '#f59e0b' };
    }
    if (!hasWorker) {
      return { label: 'UNASSIGNED', bg: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e', border: '#f43f5e' };
    }
    return { label: status, bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8', border: '#38bdf8' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Jobs</Text>
        <Text style={styles.headerSubtitle}>
          Manage service allocations, technician assignment, and progress
        </Text>
      </View>

      {/* Filter Horizontal Bar */}
      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
              All ({serviceJobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'UNASSIGNED' && styles.filterChipActive]}
            onPress={() => setFilter('UNASSIGNED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'UNASSIGNED' && styles.filterTextActive]}>
              Unassigned ({serviceJobs.filter((j) => !j.assigned_worker_id).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'IN_PROGRESS' && styles.filterChipActive]}
            onPress={() => setFilter('IN_PROGRESS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'IN_PROGRESS' && styles.filterTextActive]}>
              In Progress ({serviceJobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'COMPLETED' && styles.filterChipActive]}
            onPress={() => setFilter('COMPLETED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'COMPLETED' && styles.filterTextActive]}>
              Completed ({serviceJobs.filter((j) => j.status === 'COMPLETED').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#a855f7" />
        }
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="construct-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No service jobs found</Text>
            <Text style={styles.emptySubtitle}>
              Service requests logged for this showroom will appear here.
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => {
            const badge = getStatusBadge(job.status, !!job.assigned_worker_id);
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{job.customer_name}</Text>
                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={13} color="#94a3b8" />
                      <Text style={styles.phoneText}>{job.customer_phone}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Vehicle & Issue Meta */}
                <View style={styles.metaRow}>
                  <Ionicons name="bicycle-outline" size={15} color="#38bdf8" />
                  <Text style={styles.vehicleText}>
                    {job.vehicle_details} ({job.vehicle_type})
                  </Text>
                </View>

                <View style={styles.issueContainer}>
                  <Text style={styles.issueLabel}>Issue Description:</Text>
                  <Text style={styles.issueText}>{job.service_description}</Text>
                </View>

                {/* Footer Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.technicianCol}>
                    <Text style={styles.techLabel}>Technician</Text>
                    <Text style={styles.techValue}>
                      {job.assigned_worker_name ? job.assigned_worker_name : 'Unassigned'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.assignBtn}
                    onPress={() => onAssignTechnician(job)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-add-outline" size={14} color="#ffffff" />
                    <Text style={styles.assignBtnText}>
                      {job.assigned_worker_name ? 'Reassign' : 'Assign Worker'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  filterBarWrapper: {
    height: 44,
    marginBottom: 10,
  },
  filterRow: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    color: '#94a3b8',
    fontSize: 12,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  vehicleText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  issueContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  issueLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  issueText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  technicianCol: {},
  techLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  techValue: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#a855f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
