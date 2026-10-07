import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceJobItem } from '../lib/services-api';
import { FeedbackItem } from '../lib/feedback-api';
import { StaffMember } from '../lib/staff-api';

interface AdminReportsScreenProps {
  serviceJobs: ServiceJobItem[];
  feedbacks: FeedbackItem[];
  staff: StaffMember[];
}

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({
  serviceJobs,
  feedbacks,
  staff,
}) => {
  const completedJobs = serviceJobs.filter((j) => j.status === 'COMPLETED').length;
  const inProgressJobs = serviceJobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED').length;
  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
      : 'N/A';

  const reportItems = [
    {
      title: 'Service Reports',
      desc: 'Service jobs and technician performance',
      icon: 'construct-outline' as const,
      stat: `${completedJobs} Completed / ${serviceJobs.length} Total`,
      color: '#3b82f6',
    },
    {
      title: 'Inventory Reports',
      desc: 'Spare parts stock and usage audit log',
      icon: 'cube-outline' as const,
      stat: 'Live Catalog Tracking',
      color: '#06b6d4',
    },
    {
      title: 'Customer Satisfaction Reports',
      desc: 'Customer reviews and feedback ratings',
      icon: 'star-outline' as const,
      stat: `${avgRating} ⭐ Average Rating`,
      color: '#f59e0b',
    },
    {
      title: 'Staff Reports',
      desc: 'Staff attendance and task allocations',
      icon: 'people-outline' as const,
      stat: `${staff.length} Provisioned Staff`,
      color: '#a855f7',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Insights</Text>
        <Text style={styles.headerSubtitle}>
          Real-time dealership metrics and analytics overview
        </Text>
      </View>

      {/* High level overview cards */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{serviceJobs.length}</Text>
          <Text style={styles.metricLabel}>Total Jobs</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#10b981' }]}>{completedJobs}</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#f59e0b' }]}>{inProgressJobs}</Text>
          <Text style={styles.metricLabel}>Active Jobs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>AVAILABLE REPORTS</Text>

      {reportItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.reportCard}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportDesc}>{item.desc}</Text>
            <Text style={[styles.reportStat, { color: item.color }]}>{item.stat}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#a855f7',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  reportDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  reportStat: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
});
