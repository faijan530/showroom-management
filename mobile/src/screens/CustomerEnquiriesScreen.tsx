import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  EnquiryItem,
  EnquiryType,
  createEnquiry,
  getCustomerEnquiries,
} from '../lib/enquiries-api';
import { useAuthStore } from '../store/auth.store';

interface CustomerEnquiriesScreenProps {
  onBack?: () => void;
  enquiries: EnquiryItem[];
  onRefresh: () => Promise<void>;
}

export const CustomerEnquiriesScreen: React.FC<CustomerEnquiriesScreenProps> = ({
  onBack,
  enquiries,
  onRefresh,
}) => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESPONDED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // New Inquiry Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enquiryType, setEnquiryType] = useState<EnquiryType>('VEHICLE_PURCHASE');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredEnquiries = enquiries.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'RESPONDED') return item.status === 'RESPONDED';
    return true;
  });

  const handleCreateEnquiry = async () => {
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please write a message or test ride details.');
      return;
    }
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to submit an inquiry.');
      return;
    }

    let cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      cleanPhone = '9876543210';
    }

    try {
      setIsSubmitting(true);
      await createEnquiry({
        customer_name: user.full_name || 'Customer',
        customer_phone: cleanPhone,
        customer_email: user.email || undefined,
        enquiry_type: enquiryType,
        message: message.trim(),
        broadcast_to_all: true,
      });

      Alert.alert(
        'Inquiry Submitted',
        'Your test ride / inquiry request has been sent to our showroom representatives. You can track response notes here!'
      );
      setShowCreateModal(false);
      setMessage('');
      await onRefresh();
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEnquiryType = (type: string) => {
    switch (type) {
      case 'VEHICLE_PURCHASE':
        return 'Test Ride & Purchase';
      case 'SPARE_PART_PURCHASE':
        return 'Spare Part Order';
      case 'SERVICE_INQUIRY':
        return 'Service Consultation';
      default:
        return 'General Inquiry';
    }
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
          <Text style={styles.headerTitle}>Inquiries & Test Rides</Text>
          <Text style={styles.headerSubtitle}>
            Live response tracker for dealership test rides and queries
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newInquiryBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.newInquiryBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs Bar */}
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
              All ({enquiries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'PENDING' && styles.filterChipActive]}
            onPress={() => setFilter('PENDING')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
              Awaiting Reply ({enquiries.filter((e) => e.status === 'PENDING').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'RESPONDED' && styles.filterChipActive]}
            onPress={() => setFilter('RESPONDED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'RESPONDED' && styles.filterTextActive]}>
              Dealer Responded ({enquiries.filter((e) => e.status === 'RESPONDED').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38bdf8" />
        }
      >
        {filteredEnquiries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No inquiries in this tab</Text>
            <Text style={styles.emptySubtitle}>
              Request a test ride or ask about vehicle specs to get live response notes from dealers.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={14} color="#ffffff" />
              <Text style={styles.emptyActionText}>Book Test Ride / Ask Showroom</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredEnquiries.map((item) => {
            const isResponded = item.status === 'RESPONDED';
            const isClosed = item.status === 'CLOSED';

            return (
              <View key={item.id} style={styles.card}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Ionicons name="sparkles" size={11} color="#38bdf8" style={{ marginRight: 4 }} />
                    <Text style={styles.typeBadgeText}>{formatEnquiryType(item.enquiry_type)}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isResponded
                        ? styles.statusBadgeResponded
                        : isClosed
                        ? styles.statusBadgeClosed
                        : styles.statusBadgePending,
                    ]}
                  >
                    <Ionicons
                      name={
                        isResponded
                          ? 'checkmark-circle'
                          : isClosed
                          ? 'archive'
                          : 'time-outline'
                      }
                      size={11}
                      color={isResponded ? '#10b981' : isClosed ? '#94a3b8' : '#f59e0b'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isResponded ? '#10b981' : isClosed ? '#94a3b8' : '#f59e0b',
                        },
                      ]}
                    >
                      {isResponded
                        ? 'DEALER RESPONDED'
                        : isClosed
                        ? 'RESOLVED'
                        : 'AWAITING RESPONSE'}
                    </Text>
                  </View>
                </View>

                {/* Showroom context */}
                <Text style={styles.showroomScopeText}>
                  Target:{' '}
                  {item.broadcast_to_all
                    ? 'All Showroom Branches'
                    : item.target_showroom_name || 'Showroom Outlet'}
                </Text>

                {/* User message */}
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Your Inquiry / Request:</Text>
                  <Text style={styles.messageText}>"{item.message}"</Text>
                </View>

                {/* Official Dealer Response Note (Tracker Highlight) */}
                {item.response_notes ? (
                  <View style={styles.dealerResponseCard}>
                    <View style={styles.dealerResponseHeader}>
                      <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                      <Text style={styles.dealerResponseTitle}>Official Showroom Response</Text>
                    </View>
                    <Text style={styles.dealerResponseNotes}>{item.response_notes}</Text>
                  </View>
                ) : (
                  <View style={styles.pendingNoticeRow}>
                    <Ionicons name="hourglass-outline" size={12} color="#64748b" />
                    <Text style={styles.pendingNoticeText}>
                      Showroom team has received this and will post response notes soon.
                    </Text>
                  </View>
                )}

                {/* Footer Date */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    Submitted:{' '}
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* New Inquiry Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Book Test Ride or Inquire</Text>
                <Text style={styles.modalSub}>
                  Send your question directly to authorized dealership advisors
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Type Picker */}
            <Text style={styles.inputLabel}>Select Inquiry Type:</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.typeSelectBtn,
                  enquiryType === 'VEHICLE_PURCHASE' && styles.typeSelectBtnActive,
                ]}
                onPress={() => setEnquiryType('VEHICLE_PURCHASE')}
              >
                <Text
                  style={[
                    styles.typeSelectText,
                    enquiryType === 'VEHICLE_PURCHASE' && styles.typeSelectTextActive,
                  ]}
                >
                  🏍️ Test Ride
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeSelectBtn,
                  enquiryType === 'SERVICE_INQUIRY' && styles.typeSelectBtnActive,
                ]}
                onPress={() => setEnquiryType('SERVICE_INQUIRY')}
              >
                <Text
                  style={[
                    styles.typeSelectText,
                    enquiryType === 'SERVICE_INQUIRY' && styles.typeSelectTextActive,
                  ]}
                >
                  🔧 Service Query
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeSelectBtn,
                  enquiryType === 'GENERAL' && styles.typeSelectBtnActive,
                ]}
                onPress={() => setEnquiryType('GENERAL')}
              >
                <Text
                  style={[
                    styles.typeSelectText,
                    enquiryType === 'GENERAL' && styles.typeSelectTextActive,
                  ]}
                >
                  💬 General
                </Text>
              </TouchableOpacity>
            </View>

            {/* Message input */}
            <Text style={styles.inputLabel}>Your Request or Preferred Slot:</Text>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g., Interested in booking a test ride for Duke 390 this Saturday at 11:00 AM."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleCreateEnquiry}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={14} color="#ffffff" />
                    <Text style={styles.submitModalText}>Submit Inquiry</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  newInquiryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  newInquiryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  filterBarWrapper: {
    height: 44,
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 11,
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
    padding: 30,
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
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#38bdf8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  typeBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeResponded: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusBadgeClosed: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  showroomScopeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
  },
  messageLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  messageText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
  },
  dealerResponseCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  dealerResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dealerResponseTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dealerResponseNotes: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  pendingNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 4,
  },
  pendingNoticeText: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  dateText: {
    color: '#64748b',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeSelectBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeSelectBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  typeSelectText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  typeSelectTextActive: {
    color: '#38bdf8',
  },
  textArea: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 90,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelModalText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  submitModalBtn: {
    flex: 2,
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  submitModalText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
