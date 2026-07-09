import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Linking
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

// Adjust this URL to match your environment
const API_URL = 'http://localhost:1337/api';

const INITIAL_BILLINGS = [
  {
    id: '1',
    ticketId: 'T-001',
    patientName: 'Maria Santos',
    status: 'Overdue',
    consultationType: 'Video Consultation',
    balance: 850.00,
    billableServices: ['Medical Certificate', 'Lab Request'],
    invoiceDate: '2026-04-15',
    lastReminderSent: '2026-04-17',
  },
  {
    id: '2',
    ticketId: 'T-002',
    patientName: 'Juan Dela Cruz',
    status: 'Pending',
    consultationType: 'Chat Consultation',
    balance: 300.00,
    billableServices: ['Medical Clearance'],
    invoiceDate: '2026-04-18',
    lastReminderSent: null,
  },
  {
    id: '3',
    ticketId: 'T-003',
    patientName: 'Anna Reyes',
    status: 'HMO Pending',
    consultationType: 'Specialist Consultation',
    balance: 1200.00,
    billableServices: ['Treatment Plan', 'Follow-up'],
    invoiceDate: '2026-04-17',
    lastReminderSent: '2026-04-18',
  },
  {
    id: '4',
    ticketId: 'T-004',
    patientName: 'Roberto Garcia',
    status: 'Partial',
    consultationType: 'Voice Consultation',
    balance: 450.00,
    billableServices: [],
    invoiceDate: '2026-04-17',
    lastReminderSent: '2026-04-18',
  },
  {
    id: '5',
    ticketId: 'T-005',
    patientName: 'Sofia Martinez',
    status: 'Failed',
    consultationType: 'Video Consultation',
    balance: 650.00,
    billableServices: ['Lab Request', 'Medical Certificate'],
    invoiceDate: '2026-04-16',
    lastReminderSent: '2026-04-18',
  },
];

export default function PostConsultationBillingTracker({ visible, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [billings, setBillings] = useState(INITIAL_BILLINGS);

  const filterOptions = [
    'All Status',
    'Overdue',
    'Pending',
    'Partially Paid',
    'HMO Pending',
    'Payment Failed'
  ];

  const statusMap = {
    'All Status': 'All',
    'Overdue': 'Overdue',
    'Pending': 'Pending',
    'Partially Paid': 'Partial',
    'HMO Pending': 'HMO Pending',
    'Payment Failed': 'Failed'
  };

  // Compute metrics dynamically
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let overdueCount = 0;
    let outstandingTotal = 0;

    billings.forEach(item => {
      outstandingTotal += item.balance;
      if (item.status === 'Overdue') {
        overdueCount++;
      }
      if (item.status === 'Pending' || item.status === 'Partial' || item.status === 'HMO Pending') {
        pendingCount++;
      }
    });

    return { pendingCount, overdueCount, outstandingTotal };
  }, [billings]);

  // Filter and Search logic
  const filteredBillings = useMemo(() => {
    return billings.filter(item => {
      const matchesSearch = 
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

      const targetStatus = statusMap[selectedStatus];
      const matchesStatus = targetStatus === 'All' || item.status === targetStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus, billings]);

  // API Call: Mark as Paid
  const markPaid = async (billingId) => {
    try {
      const response = await fetch(`${API_URL}/billing/${billingId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setBillings(prevBillings => 
          prevBillings.map(b => 
            b.id === billingId ? { ...b, status: 'Paid', balance: 0 } : b
          )
        );
        console.log(`Successfully marked billing ${billingId} as paid.`);
      } else {
        console.error('Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  // API Call: Export Billing Report
  const exportBillingReport = () => {
    const targetUrl = `${API_URL}/billing/export`;
    Linking.openURL(targetUrl).catch((err) => {
      console.error('Failed to open export link:', err);
    });
  };

  const handleAction = (actionType, id) => {
    console.log(`Executed action: ${actionType} on ticket/id: ${id}`);
    if (actionType === 'Mark Paid') {
      markPaid(id);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Overdue':
        return { bg: '#FFF5F5', border: '#FEB2B2', text: '#C53030', leftAccent: '#E53E3E', icon: 'error-outline' };
      case 'Pending':
        return { bg: '#FFFDF0', border: '#FEFCBF', text: '#B7791F', leftAccent: '#ECC94B', icon: 'schedule' };
      case 'HMO Pending':
        return { bg: '#EBF8FF', border: '#BEE3F8', text: '#2B6CB0', leftAccent: '#3182CE', icon: 'schedule' };
      case 'Partial':
        return { bg: '#FFFAF0', border: '#FEEBC8', text: '#DD6B20', leftAccent: '#ED8936', icon: 'warning' };
      case 'Failed':
        return { bg: '#FFF5F5', border: '#FEB2B2', text: '#C53030', leftAccent: '#E53E3E', icon: 'highlight-off' };
      case 'Paid':
        return { bg: '#F0FFF4', border: '#C6F6D5', text: '#2F855A', leftAccent: '#48BB78', icon: 'check-circle-outline' };
      default:
        return { bg: '#EDF2F7', border: '#E2E8F0', text: '#4A5568', leftAccent: '#718096', icon: 'info-outline' };
    }
  };

  const renderBillingCard = ({ item }) => {
    const stylesConfig = getStatusStyles(item.status);

    return (
      <View style={[styles.card, { borderLeftColor: stylesConfig.leftAccent }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.ticketBadgeContainer}>
            <Text style={styles.ticketIdText}>{item.ticketId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: stylesConfig.bg, borderColor: stylesConfig.border }]}>
              <MaterialIcons name={stylesConfig.icon} size={13} color={stylesConfig.text} style={{ marginRight: 3 }} />
              <Text style={[styles.statusBadgeText, { color: stylesConfig.text }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <Text style={styles.balanceValue}>₱{item.balance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.consultationType}>{item.consultationType}</Text>

          {item.billableServices.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesHeading}>Added Billable Services</Text>
              <View style={styles.tagWrapper}>
                {item.billableServices.map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceTagText}>{service}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.cardDivider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Invoice Date</Text>
              <Text style={styles.metaValue}>{item.invoiceDate}</Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Last Reminder Sent</Text>
              <Text style={styles.metaValue}>{item.lastReminderSent || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Action Button Matrix */}
        <View style={styles.cardActionsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cardBtn} onPress={() => handleAction('View Invoice', item.ticketId)}>
              <Ionicons name="eye-outline" size={16} color="#2D3748" style={{ marginRight: 6 }} />
              <Text style={styles.cardBtnText}>View Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardBtn} onPress={() => handleAction('Resend Link', item.ticketId)}>
              <Feather name="send" size={14} color="#2D3748" style={{ marginRight: 6 }} />
              <Text style={styles.cardBtnText}>Resend Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cardBtn} onPress={() => handleAction('Follow-up', item.ticketId)}>
              <Ionicons name="mail-outline" size={15} color="#2D3748" style={{ marginRight: 6 }} />
              <Text style={styles.cardBtnText}>Follow-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardBtn, styles.markPaidBtn]} onPress={() => handleAction('Mark Paid', item.id)}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.markPaidBtnText}>Mark Paid</Text>
            </TouchableOpacity>
          </View>

          {item.status === 'Overdue' && (
            <TouchableOpacity 
              style={styles.escalateBtn} 
              onPress={() => handleAction('Escalate to Admin', item.ticketId)}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#C53030" style={{ marginRight: 6 }} />
              <Text style={styles.escalateBtnText}>Escalate to Admin Billing</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalWindowContainer}>
        
        {/* Navigation Action Header Block linked to Nurse Dashboard */}
        <View style={styles.trackerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backHeaderNavigationButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.mainHeaderTitle}>Post-Consultation Billing Tracker</Text>
            </View>
            <Text style={styles.mainHeaderSubtitle}>Manage and track pending patient billing profiles</Text>
          </View>
        </View>

        {/* Aggregate Summary Metrics Row */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>Total Pending</Text>
            <Text style={[styles.metricValueText, { color: '#ED8936' }]}>{metrics.pendingCount}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>Overdue</Text>
            <Text style={[styles.metricValueText, { color: '#E53E3E' }]}>{metrics.overdueCount}</Text>
          </View>
          <View style={[styles.metricCard, { flex: 1.3 }]}>
            <Text style={styles.metricLabelText}>Outstanding</Text>
            <Text style={[styles.metricValueText, { color: '#38A169' }]}>₱{metrics.outstandingTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Filter Control Section */}
        <View style={styles.filterControlRow}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search-outline" size={18} color="#A0AEC0" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInputField}
              placeholder="Search by patient name or ticket ID..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.dropdownTriggerButton} 
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Ionicons name="filter-outline" size={18} color="#4A5568" style={{ marginRight: 6 }} />
            <Text style={styles.dropdownTriggerText}>{selectedStatus}</Text>
            <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={14} color="#4A5568" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Floating Layer */}
        {dropdownOpen && (
          <View style={styles.dropdownFloatingListLayer}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownItemRow, selectedStatus === option && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedStatus(option);
                  setDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedStatus === option && styles.dropdownItemTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Patient Invoices Data Stream */}
        <FlatList
          data={filteredBillings}
          keyExtractor={(item) => item.id}
          renderItem={renderBillingCard}
          contentContainerStyle={styles.listContentPane}
          ListEmptyComponent={
            <View style={styles.emptyContainerPane}>
              <Ionicons name="receipt-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyStateText}>No matching post-consultation invoices found.</Text>
            </View>
          }
        />

        {/* Global Action Footer */}
        <View style={styles.globalFooterActionsBar}>
          <TouchableOpacity style={styles.globalCloseButton} onPress={onClose}>
            <Text style={styles.globalCloseButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.globalExportButton} onPress={exportBillingReport}>
            <Ionicons name="document-text-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.globalExportButtonText}>Export Billing Report</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWindowContainer: { flex: 1, backgroundColor: '#FFFDFB' },
  trackerHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', backgroundColor: '#FFF9F6', alignItems: 'center' },
  backHeaderNavigationButton: { padding: 6, marginRight: 8, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitleContainer: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  mainHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C' },
  mainHeaderSubtitle: { fontSize: 12, color: '#718096' },
  metricsStrip: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },
  metricCard: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, padding: 12, marginRight: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  metricLabelText: { fontSize: 12, color: '#718096', marginBottom: 6, fontWeight: '500' },
  metricValueText: { fontSize: 18, fontWeight: '700' },
  filterControlRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', zIndex: 10 },
  searchBarWrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 8, alignItems: 'center', paddingHorizontal: 12, height: 40, marginRight: 8 },
  searchInputField: { flex: 1, fontSize: 13, color: '#2D3748' },
  dropdownTriggerButton: { flexDirection: 'row', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 8, alignItems: 'center', paddingHorizontal: 12, height: 40 },
  dropdownTriggerText: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  dropdownFloatingListLayer: { position: 'absolute', top: 52, right: 16, left: 16, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 6, zIndex: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  dropdownItemRow: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  dropdownItemActive: { backgroundColor: '#F7FAFC' },
  dropdownItemText: { fontSize: 14, color: '#4A5568' },
  dropdownItemTextActive: { fontWeight: '700', color: '#ED8936' },
  listContentPane: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainerPane: { alignItems: 'center', marginTop: 60 },
  emptyStateText: { color: '#A0AEC0', marginTop: 12, fontSize: 14, textAlign: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderLeftWidth: 5, borderWidth: 1, borderColor: '#EDF2F7', padding: 16, marginTop: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  ticketBadgeContainer: { flexDirection: 'row', alignItems: 'center' },
  ticketIdText: { fontSize: 14, fontWeight: '700', color: '#2D3748', marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  balanceContainer: { alignItems: 'flex-end' },
  balanceLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },
  balanceValue: { fontSize: 18, fontWeight: '800', color: '#E53E3E', marginTop: 2 },
  cardContent: { marginBottom: 14 },
  patientName: { fontSize: 17, fontWeight: '700', color: '#1A202C', marginBottom: 2 },
  consultationType: { fontSize: 13, color: '#718096', marginBottom: 12 },
  servicesContainer: { marginTop: 4, marginBottom: 8 },
  servicesHeading: { fontSize: 12, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceTag: { backgroundColor: '#EDF2F7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  serviceTagText: { fontSize: 12, color: '#2D3748', fontWeight: '500' },
  cardDivider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 10 },
  metaGrid: { flexDirection: 'row' },
  metaColumn: { flex: 1 },
  metaLabel: { fontSize: 11, color: '#A0AEC0', uppercase: true, fontWeight: '600', marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '500', color: '#2D3748' },
  cardActionsContainer: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#F7FAFC', paddingTop: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardBtn: { flex: 1, flexDirection: 'row', height: 38, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', marginHorizontal: 4, marginRight: 8 },
  cardBtnText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  markPaidBtn: { backgroundColor: '#38A169', borderColor: '#38A169', marginRight: 0 },
  markPaidBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  escalateBtn: { flexDirection: 'row', height: 38, borderWidth: 1, borderColor: '#FED7D7', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F5', marginTop: 2 },
  escalateBtnText: { fontSize: 13, fontWeight: '700', color: '#C53030' },
  globalFooterActionsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#EDF2F7', backgroundColor: '#FFF' },
  globalCloseButton: { flex: 1, height: 46, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', marginRight: 12 },
  globalCloseButtonText: { fontSize: 15, fontWeight: '600', color: '#2D3748' },
  globalExportButton: { flex: 1.8, flexDirection: 'row', height: 46, backgroundColor: '#1A73E8', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  globalExportButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});