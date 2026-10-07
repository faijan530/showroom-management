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
import { EnquiryItem, EnquiryStatus, respondToEnquiry } from '../lib/enquiries-api';

interface AdminEnquiriesScreenProps {
  enquiries: EnquiryItem[];
  onRefresh: () => Promise<void>;
}

export const AdminEnquiriesScreen: React.FC<AdminEnquiriesScreenProps> = ({
  enquiries,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Modal response state
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [responseStatus, setResponseStatus] = useState<EnquiryStatus>('RESPONDED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredEnquiries = enquiries.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'RESPONDED') return item.status === 'RESPONDED';
    if (filter === 'CLOSED') return item.status === 'CLOSED';
    return true;
  });

  const openResponseModal = (item: EnquiryItem) => {
    setSelectedEnquiry(item);
    setResponseNotes(item.response_notes || '');
    setResponseStatus(item.status === 'PENDING' ? 'RESPONDED' : item.status);
  };

  const handleSendResponse = async () => {
    if (!selectedEnquiry) return;
    if (!responseNotes.trim()) {
      Alert.alert('Response Required', 'Please enter a response note or update for the customer.');
      return;
    }

    try {
      setIsSubmitting(true);
      await respondToEnquiry(selectedEnquiry.id, {
        status: responseStatus,
        response_notes: responseNotes.trim(),
      });
      Alert.alert(
        'Response Sent',
        `Official response for ${selectedEnquiry.customer_name} has been published.`
      );
      setSelectedEnquiry(null);
      setResponseNotes('');
      await onRefresh();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update inquiry response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'RESPONDED':
        return {
          label: 'RESPONDED',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          text: '#10b981',
          icon: 'checkmark-circle-outline' as const,
        };
      case 'CLOSED':
        return {
          label: 'CLOSED',
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.3)',
          text: '#94a3b8',
          icon: 'archive-outline' as const,
        };
      case 'PENDING':
      default:
        return {
          label: 'PENDING ACTION',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#f59e0b',
          icon: 'time-outline' as const,
        };
    }
  };

  const formatEnquiryType = (type: string) => {
    switch (type) {
      case 'VEHICLE_PURCHASE':
        return 'Test Ride & Purchase';
      case 'SPARE_PART_PURCHASE':
        return 'Spare Part Request';
      case 'SERVICE_INQUIRY':
        return 'Service Consultation';
      default:
        return 'General Inquiry';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inquiries & Test Rides</Text>
        <Text style={styles.headerSubtitle}>
          Track customer test rides, showroom queries, and dispatch dealer responses
        </Text>
      </View>

      {/* Filter Chips Bar */}
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
              Pending ({enquiries.filter((e) => e.status === 'PENDING').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'RESPONDED' && styles.filterChipActive]}
            onPress={() => setFilter('RESPONDED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'RESPONDED' && styles.filterTextActive]}>
              Responded ({enquiries.filter((e) => e.status === 'RESPONDED').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'CLOSED' && styles.filterChipActive]}
            onPress={() => setFilter('CLOSED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'CLOSED' && styles.filterTextActive]}>
              Closed ({enquiries.filter((e) => e.status === 'CLOSED').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Inquiry Cards List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#a855f7" />
        }
      >
        {filteredEnquiries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={44} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No inquiries found</Text>
            <Text style={styles.emptySubtitle}>
              Customer test rides and vehicle inquiries matching this filter will show here.
            </Text>
          </View>
        ) : (
          filteredEnquiries.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <View key={item.id} style={styles.inquiryCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.customer_name}</Text>
                    <View style={styles.contactRow}>
                      <Ionicons name="call-outline" size={12} color="#94a3b8" />
                      <Text style={styles.contactText}>{item.customer_phone}</Text>
                      {item.customer_email ? (
                        <>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Ionicons name="mail-outline" size={12} color="#94a3b8" />
                          <Text style={styles.contactText} numberOfLines={1}>
                            {item.customer_email}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Ionicons name={badge.icon} size={11} color={badge.text} style={{ marginRight: 3 }} />
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Inquiry Type & Target Scope */}
                <View style={styles.typeScopeRow}>
                  <View style={styles.typeBadge}>
                    <Ionicons name="sparkles" size={11} color="#38bdf8" style={{ marginRight: 4 }} />
                    <Text style={styles.typeBadgeText}>
                      {formatEnquiryType(item.enquiry_type)}
                    </Text>
                  </View>

                  {item.broadcast_to_all ? (
                    <View style={styles.scopeBadge}>
                      <Text style={styles.scopeBadgeText}>Broadcast (All Outlets)</Text>
                    </View>
                  ) : item.target_showroom_name ? (
                    <View style={styles.scopeBadge}>
                      <Text style={styles.scopeBadgeText}>{item.target_showroom_name}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Message Body */}
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Customer Message / Test Ride Request:</Text>
                  <Text style={styles.messageText}>"{item.message}"</Text>
                </View>

                {/* Existing Response Note if any */}
                {item.response_notes ? (
                  <View style={styles.responseBox}>
                    <View style={styles.responseHeaderRow}>
                      <Ionicons name="chatbubble-ellipses" size={12} color="#10b981" />
                      <Text style={styles.responseLabel}>Official Dealer Response:</Text>
                    </View>
                    <Text style={styles.responseText}>{item.response_notes}</Text>
                  </View>
                ) : null}

                {/* Card Action Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>

                  <TouchableOpacity
                    style={styles.respondBtn}
                    onPress={() => openResponseModal(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color="#ffffff" />
                    <Text style={styles.respondBtnText}>
                      {item.response_notes ? 'Update Note' : 'Respond to Inquiry'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Response Action Modal */}
      <Modal
        visible={!!selectedEnquiry}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEnquiry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Inquiry Response Tracker</Text>
                <Text style={styles.modalSub}>
                  For {selectedEnquiry?.customer_name} ({selectedEnquiry ? formatEnquiryType(selectedEnquiry.enquiry_type) : ''})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedEnquiry(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Customer Message Summary */}
            <View style={styles.modalMsgSummary}>
              <Text style={styles.modalMsgLabel}>Customer Query:</Text>
              <Text style={styles.modalMsgText}>"{selectedEnquiry?.message}"</Text>
            </View>

            {/* Status Picker */}
            <Text style={styles.inputLabel}>Set Tracker Status:</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  responseStatus === 'RESPONDED' && styles.statusToggleRespondedActive,
                ]}
                onPress={() => setResponseStatus('RESPONDED')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={responseStatus === 'RESPONDED' ? '#10b981' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.statusToggleText,
                    responseStatus === 'RESPONDED' && { color: '#10b981', fontWeight: '800' },
                  ]}
                >
                  Responded
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  responseStatus === 'CLOSED' && styles.statusToggleClosedActive,
                ]}
                onPress={() => setResponseStatus('CLOSED')}
              >
                <Ionicons
                  name="archive"
                  size={14}
                  color={responseStatus === 'CLOSED' ? '#cbd5e1' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.statusToggleText,
                    responseStatus === 'CLOSED' && { color: '#cbd5e1', fontWeight: '800' },
                  ]}
                >
                  Closed / Resolved
                </Text>
              </TouchableOpacity>
            </View>

            {/* Response Notes Input */}
            <Text style={styles.inputLabel}>Dealer Response / Notes to Customer:</Text>
            <TextInput
              style={styles.textArea}
              value={responseNotes}
              onChangeText={setResponseNotes}
              placeholder="e.g., Test ride confirmed for Saturday 11:00 AM at showroom. Please carry a valid driving license."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedEnquiry(null)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSendResponse}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={14} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Publish Response</Text>
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
  inquiryCard: {
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  contactText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  dotSeparator: {
    color: '#475569',
    fontSize: 11,
    marginHorizontal: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  typeScopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
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
  scopeBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scopeBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 3,
  },
  messageText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
  },
  responseBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  responseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  responseLabel: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  responseText: {
    color: '#e2e8f0',
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
  dateText: {
    color: '#64748b',
    fontSize: 11,
  },
  respondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#a855f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  respondBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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
    marginBottom: 12,
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
  modalCloseBtn: {
    padding: 4,
  },
  modalMsgSummary: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  modalMsgLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  modalMsgText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusToggleRespondedActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  statusToggleClosedActive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#94a3b8',
  },
  statusToggleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
