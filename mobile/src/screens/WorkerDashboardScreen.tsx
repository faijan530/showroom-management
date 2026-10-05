import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeScreen } from '../components/ui/SafeScreen';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';

export const WorkerDashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const showroomTitle = user?.showroom_name || user?.showroom?.name || 'Dealership Service Bay';
  const showroomCode = user?.showroom_code || user?.showroom?.code || 'SHW-01';

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>TECHNICIAN PORTAL</Text>
          <Text style={styles.title}>Service Task Queue</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.full_name || 'Worker'}! Manage assigned repair and servicing jobs for {showroomTitle}.
          </Text>
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
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Assigned Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.inProgressText]}>0</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, styles.completedText]}>0</Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
        </View>

        {/* Empty Task Queue Card */}
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔧</Text>
          <Text style={styles.emptyTitle}>Task Queue Clear</Text>
          <Text style={styles.emptyDesc}>
            No service jobs assigned to your queue at this moment. When showroom managers allocate a repair task, it will appear here instantly.
          </Text>
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
    marginBottom: 20,
  },
  badge: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
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
});
