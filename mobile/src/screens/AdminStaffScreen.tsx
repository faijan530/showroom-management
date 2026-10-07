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
import { StaffMember } from '../lib/staff-api';

interface AdminStaffScreenProps {
  staff: StaffMember[];
  onRefresh: () => void;
  onAddStaff: () => void;
}

export const AdminStaffScreen: React.FC<AdminStaffScreenProps> = ({
  staff,
  onRefresh,
  onAddStaff,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WORKER' | 'INVENTORY_MANAGER'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredStaff = staff.filter((member) => {
    if (filter === 'WORKER') return member.role === 'WORKER';
    if (filter === 'INVENTORY_MANAGER') return member.role === 'INVENTORY_MANAGER';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header with Add Staff Primary CTA */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Staff Directory</Text>
          <Text style={styles.headerSubtitle}>
            Manage showroom technicians and inventory managers
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addStaffCta}
          onPress={onAddStaff}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text style={styles.addStaffText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Horizontal Pill Bar */}
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
              All ({staff.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'WORKER' && styles.filterChipActive]}
            onPress={() => setFilter('WORKER')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'WORKER' && styles.filterTextActive]}>
              Technicians ({staff.filter((s) => s.role === 'WORKER').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'INVENTORY_MANAGER' && styles.filterChipActive]}
            onPress={() => setFilter('INVENTORY_MANAGER')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'INVENTORY_MANAGER' && styles.filterTextActive,
              ]}
            >
              Inventory ({staff.filter((s) => s.role === 'INVENTORY_MANAGER').length})
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
        {filteredStaff.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No staff members found</Text>
            <Text style={styles.emptySubtitle}>
              Click "+ Add Staff" to provision a technician or stock manager account.
            </Text>
          </View>
        ) : (
          filteredStaff.map((member) => {
            const isWorker = member.role === 'WORKER';
            return (
              <View key={member.id} style={styles.staffCard}>
                <View style={styles.cardMainRow}>
                  <View
                    style={[
                      styles.avatarBox,
                      { backgroundColor: isWorker ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)' },
                    ]}
                  >
                    <Ionicons
                      name={isWorker ? 'construct' : 'cube'}
                      size={20}
                      color={isWorker ? '#a855f7' : '#38bdf8'}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{member.full_name}</Text>
                    <Text style={styles.staffRoleText}>
                      {isWorker ? 'Technician' : 'Inventory Manager'}
                    </Text>

                    <View style={styles.contactRow}>
                      <Ionicons name="call-outline" size={13} color="#94a3b8" />
                      <Text style={styles.contactText}>{member.phone}</Text>
                    </View>

                    {member.email ? (
                      <View style={styles.contactRow}>
                        <Ionicons name="mail-outline" size={13} color="#94a3b8" />
                        <Text style={styles.contactText}>{member.email}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addStaffCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#a855f7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addStaffText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
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
  staffCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  staffRoleText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  activeBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
});
