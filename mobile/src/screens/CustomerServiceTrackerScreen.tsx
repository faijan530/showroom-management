import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceJobItem } from '../lib/services-api';

interface CustomerServiceTrackerScreenProps {
  onBack?: () => void;
  serviceJobs: ServiceJobItem[];
  onRefresh: () => Promise<void>;
  onBookNewService?: () => void;
  selectedJobId?: string | null;
}

export const CustomerServiceTrackerScreen: React.FC<CustomerServiceTrackerScreenProps> = ({
  onBack,
  serviceJobs,
  onRefresh,
  onBookNewService,
  selectedJobId,
}) => {
  const [activeJobId, setActiveJobId] = useState<string>(
    selectedJobId || (serviceJobs.length > 0 ? serviceJobs[0].id : '')
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const activeJob =
    serviceJobs.find((j) => j.id === activeJobId) || (serviceJobs.length > 0 ? serviceJobs[0] : null);

  const getStepStatus = (
    stepName: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED',
    currentStatus: string
  ) => {
    const order = ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepName);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Live Service Tracker</Text>
          <Text style={styles.headerSubtitle}>
            Real-time repair progress, technician allocation & inspection
          </Text>
        </View>

        {onBookNewService ? (
          <TouchableOpacity
            style={styles.bookNewBtn}
            onPress={onBookNewService}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.bookNewBtnText}>Book</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Multiple Jobs Selector Bar (if customer has more than 1 service job) */}
      {serviceJobs.length > 1 ? (
        <View style={styles.jobSelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobSelectorRow}
          >
            {serviceJobs.map((job) => {
              const isSelected = (activeJob?.id || '') === job.id;
              return (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.jobChip, isSelected && styles.jobChipActive]}
                  onPress={() => setActiveJobId(job.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={job.vehicle_type === 'BIKE' ? 'bicycle' : 'car-sport'}
                    size={14}
                    color={isSelected ? '#ffffff' : '#94a3b8'}
                  />
                  <Text style={[styles.jobChipText, isSelected && styles.jobChipTextActive]}>
                    {job.vehicle_details}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
        }
      >
        {!activeJob ? (
          <View style={styles.emptyCard}>
            <Ionicons name="construct-outline" size={48} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No active service bookings</Text>
            <Text style={styles.emptySubtitle}>
              Schedule a maintenance or repair appointment to track your vehicle's live progress online.
            </Text>
            {onBookNewService ? (
              <TouchableOpacity
                style={styles.emptyBookBtn}
                onPress={onBookNewService}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar" size={16} color="#ffffff" />
                <Text style={styles.emptyBookBtnText}>Book Service Appointment</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {/* Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overviewVehicle}>{activeJob.vehicle_details}</Text>
                  <Text style={styles.overviewShowroom}>
                    🏢 {activeJob.showroom_name || 'Authorized Service Center'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    activeJob.status === 'COMPLETED'
                      ? styles.statusPillCompleted
                      : activeJob.status === 'IN_PROGRESS'
                      ? styles.statusPillProgress
                      : activeJob.status === 'ASSIGNED'
                      ? styles.statusPillAssigned
                      : styles.statusPillRequested,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      activeJob.status === 'COMPLETED'
                        ? { color: '#10b981' }
                        : activeJob.status === 'IN_PROGRESS'
                        ? { color: '#f59e0b' }
                        : activeJob.status === 'ASSIGNED'
                        ? { color: '#38bdf8' }
                        : { color: '#cbd5e1' },
                    ]}
                  >
                    {activeJob.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Time Slot & Date Highlight */}
              {(activeJob.preferred_date || activeJob.time_slot) ? (
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleCol}>
                    <Ionicons name="calendar-outline" size={14} color="#38bdf8" />
                    <Text style={styles.scheduleLabel}>
                      {activeJob.preferred_date
                        ? new Date(activeJob.preferred_date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Scheduled Date'}
                    </Text>
                  </View>

                  <View style={styles.scheduleCol}>
                    <Ionicons name="time-outline" size={14} color="#f59e0b" />
                    <Text style={styles.scheduleLabel}>
                      {activeJob.time_slot || 'Regular Workshop Hours'}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Stepper Timeline Tracker */}
            <View style={styles.trackerCard}>
              <Text style={styles.trackerCardTitle}>Service Milestone Progress</Text>

              {/* Step 1: REQUESTED */}
              {renderStepRow({
                title: '1. Request Received',
                description: 'Service appointment logged in dealer system.',
                status: getStepStatus('REQUESTED', activeJob.status),
                icon: 'document-text',
                isLast: false,
              })}

              {/* Step 2: ASSIGNED */}
              {renderStepRow({
                title: '2. Technician Allocated',
                description: activeJob.assigned_worker_name
                  ? `Assigned to ${activeJob.assigned_worker_name}`
                  : 'Assigning certified technician...',
                status: getStepStatus('ASSIGNED', activeJob.status),
                icon: 'person',
                isLast: false,
                extraContent: activeJob.assigned_worker_name ? (
                  <View style={styles.techPill}>
                    <Ionicons name="shield-checkmark" size={13} color="#10b981" />
                    <Text style={styles.techPillText}>
                      Technician: {activeJob.assigned_worker_name}
                    </Text>
                    {activeJob.assigned_worker_phone ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${activeJob.assigned_worker_phone}`)}
                        style={styles.techCallBtn}
                      >
                        <Ionicons name="call" size={12} color="#ffffff" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null,
              })}

              {/* Step 3: IN_PROGRESS */}
              {renderStepRow({
                title: '3. Under Inspection & Servicing',
                description:
                  activeJob.status === 'IN_PROGRESS' || activeJob.status === 'COMPLETED'
                    ? 'Active diagnostic, repair, and fluids change underway.'
                    : 'Awaiting workshop bay intake.',
                status: getStepStatus('IN_PROGRESS', activeJob.status),
                icon: 'construct',
                isLast: false,
              })}

              {/* Step 4: COMPLETED */}
              {renderStepRow({
                title: '4. Service Completed & Ready',
                description:
                  activeJob.status === 'COMPLETED'
                    ? 'Quality check cleared. Ready for customer handover!'
                    : 'Final inspection upon repair completion.',
                status: getStepStatus('COMPLETED', activeJob.status),
                icon: 'checkmark-circle',
                isLast: true,
              })}
            </View>

            {/* Workshop Remarks / Status Notes */}
            {activeJob.status_notes ? (
              <View style={styles.notesCard}>
                <View style={styles.notesHeader}>
                  <Ionicons name="information-circle" size={16} color="#38bdf8" />
                  <Text style={styles.notesTitle}>Workshop Remarks & Notes</Text>
                </View>
                <Text style={styles.notesBody}>{activeJob.status_notes}</Text>
              </View>
            ) : null}

            {/* Issue Description Card */}
            <View style={styles.issueCard}>
              <Text style={styles.issueHeader}>Reported Service Problem</Text>
              <Text style={styles.issueText}>"{activeJob.service_description}"</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

function renderStepRow({
  title,
  description,
  status,
  icon,
  isLast,
  extraContent,
}: {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: keyof typeof Ionicons.glyphMap;
  isLast: boolean;
  extraContent?: React.ReactNode;
}) {
  const isDone = status === 'completed';
  const isCurrent = status === 'current';

  const dotColor = isDone ? '#10b981' : isCurrent ? '#3b82f6' : '#475569';
  const dotBg = isDone
    ? 'rgba(16, 185, 129, 0.2)'
    : isCurrent
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(71, 85, 105, 0.2)';

  return (
    <View style={styles.stepRow}>
      {/* Indicator Column */}
      <View style={styles.indicatorCol}>
        <View style={[styles.stepDot, { backgroundColor: dotBg, borderColor: dotColor }]}>
          <Ionicons
            name={isDone ? 'checkmark' : icon}
            size={14}
            color={dotColor}
          />
        </View>
        {!isLast ? (
          <View
            style={[
              styles.stepLine,
              { backgroundColor: isDone ? '#10b981' : '#334155' },
            ]}
          />
        ) : null}
      </View>

      {/* Content Column */}
      <View style={styles.stepContentCol}>
        <View style={styles.stepTitleRow}>
          <Text
            style={[
              styles.stepTitle,
              isCurrent && { color: '#38bdf8' },
              isDone && { color: '#10b981' },
            ]}
          >
            {title}
          </Text>
          {isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.stepDesc}>{description}</Text>
        {extraContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  bookNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookNewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  jobSelectorWrapper: {
    height: 44,
    marginBottom: 6,
  },
  jobSelectorRow: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  jobChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  jobChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  jobChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  jobChipTextActive: {
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
    marginTop: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBookBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  overviewCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  overviewVehicle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  overviewShowroom: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 3,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  statusPillProgress: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
  },
  statusPillAssigned: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  statusPillRequested: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#475569',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scheduleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 10,
    borderRadius: 10,
    gap: 16,
  },
  scheduleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  trackerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  trackerCardTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  currentBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  stepDesc: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  techPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  techPillText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  techCallBtn: {
    backgroundColor: '#10b981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  notesCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  notesTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  notesBody: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
  },
  issueCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  issueHeader: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  issueText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
