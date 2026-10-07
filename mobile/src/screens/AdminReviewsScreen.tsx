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
import { FeedbackItem } from '../lib/feedback-api';

interface AdminReviewsScreenProps {
  feedbacks: FeedbackItem[];
  onRefresh: () => void;
  onRespond: (feedback: FeedbackItem) => void;
}

export const AdminReviewsScreen: React.FC<AdminReviewsScreenProps> = ({
  feedbacks,
  onRefresh,
  onRespond,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filter === 'APPROVED') return fb.status === 'APPROVED';
    if (filter === 'PENDING') return fb.status !== 'APPROVED';
    return true;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color="#f59e0b"
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <Text style={styles.headerSubtitle}>
          Customer ratings, vehicle feedback, and dealership responses
        </Text>
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
              All ({feedbacks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'APPROVED' && styles.filterChipActive]}
            onPress={() => setFilter('APPROVED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>
              Approved ({feedbacks.filter((f) => f.status === 'APPROVED').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'PENDING' && styles.filterChipActive]}
            onPress={() => setFilter('PENDING')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
              Pending ({feedbacks.filter((f) => f.status !== 'APPROVED').length})
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
        {filteredFeedbacks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>
              Customer reviews will appear here once submitted.
            </Text>
          </View>
        ) : (
          filteredFeedbacks.map((fb) => {
            const isApproved = fb.status === 'APPROVED';
            return (
              <View key={fb.id} style={styles.reviewCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{fb.customer_name || 'Customer'}</Text>
                    <View style={styles.ratingRow}>
                      {renderStars(fb.rating)}
                      <Text style={styles.ratingText}>({fb.rating}/5)</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isApproved ? styles.badgeApproved : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isApproved ? styles.statusTextApproved : styles.statusTextPending,
                      ]}
                    >
                      {isApproved ? 'APPROVED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {/* Vehicle Meta */}
                <Text style={styles.vehicleText}>
                  Vehicle: {fb.vehicle_details || 'Serviced Vehicle'}
                </Text>

                {/* Customer Comment */}
                {fb.comment ? (
                  <Text style={styles.commentText}>"{fb.comment}"</Text>
                ) : null}

                {/* Official Response section or Respond Button */}
                {fb.admin_response ? (
                  <View style={styles.responseBox}>
                    <View style={styles.responseHeader}>
                      <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                      <Text style={styles.responseTitle}>Official Response:</Text>
                    </View>
                    <Text style={styles.responseText}>{fb.admin_response}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.respondActionBtn}
                    onPress={() => onRespond(fb)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={15} color="#a855f7" />
                    <Text style={styles.respondActionText}>Respond to Review</Text>
                  </TouchableOpacity>
                )}
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
  reviewCard: {
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
    marginBottom: 6,
  },
  customerName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  badgePending: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextApproved: {
    color: '#10b981',
  },
  statusTextPending: {
    color: '#f43f5e',
  },
  vehicleText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  commentText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 10,
  },
  responseBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 2,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  responseTitle: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  responseText: {
    color: '#f8fafc',
    fontSize: 12,
    lineHeight: 16,
  },
  respondActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginTop: 2,
  },
  respondActionText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '700',
  },
});
