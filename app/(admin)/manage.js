import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  RefreshControl,
  Animated,
  Modal,
} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../utils/config";
import { getItem } from "../../utils/storage";
import { triggerLocalNotification } from "../../utils/notifications";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StaffPanel = () => {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffStats, setStaffStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadStaff = async () => {
    try {
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/getStaffs`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Fetch additional stats for each staff member
        const staffWithStats = await Promise.all(
          data.map(async (staffMember) => {
            try {
              // Fetch staff's cards count
              const cardsResponse = await fetch(`${BASE_URL}/charm/pickCards/${staffMember.id}`, {
                headers: { Authorization: token },
              });
              
              let totalCards = 0;
              let totalScans = 0;
              
              if (cardsResponse.ok) {
                const cardsData = await cardsResponse.json();
                // Handle the response structure: { vcards: Array }
                const vcardsArray = cardsData.vcards || [];
                totalCards = vcardsArray.length || 0;
                
                // Calculate total scans from all cards
                if (totalCards > 0) {
                  const scanPromises = vcardsArray.map(async (card) => {
                    try {
                      const scanResponse = await fetch(`${BASE_URL}/charm/scanLogs/${card.id}`, {
                        headers: { Authorization: token },
                      });
                      if (scanResponse.ok) {
                        const scanData = await scanResponse.json();
                        // Handle scan logs response structure
                        const scanLogsArray = scanData.scanLogs || scanData || [];
                        return scanLogsArray.length || 0;
                      }
                      return 0;
                    } catch (error) {
                      console.error("Error fetching scan logs:", error);
                      return 0;
                    }
                  });
                  
                  const scanCounts = await Promise.all(scanPromises);
                  totalScans = scanCounts.reduce((sum, count) => sum + count, 0);
                }
              }
              
              return {
                ...staffMember,
                totalCards,
                totalScans
              };
            } catch (error) {
              console.error("Error fetching staff stats:", error);
              return {
                ...staffMember,
                totalCards: 0,
                totalScans: 0
              };
            }
          })
        );
        
        setStaff(staffWithStats);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        
      } else {
        console.error("Failed to fetch staff", response.status);
        triggerLocalNotification("Error", "Failed to load staff");
      }
    } catch (e) {
      console.error("Error fetching staff:", e);
      triggerLocalNotification("Oops!", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaffStats = async (staffId) => {
    try {
      const token = await getItem("token");
      
      // Fetch detailed staff stats for modal
      const cardsResponse = await fetch(`${BASE_URL}/charm/pickCards/${staffId}`, {
        headers: { Authorization: token },
      });
      
      let staffCards = [];
      let totalScans = 0;
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        // Handle the response structure: { vcards: Array }
        const vcardsArray = cardsData.vcards || [];
        staffCards = vcardsArray;
      
        // Get detailed scan info for each card
        const cardsWithScans = await Promise.all(
          staffCards.map(async (card) => {
            try {
              const scanResponse = await fetch(`${BASE_URL}/charm/scanLogs/${card.id}`, {
                headers: { Authorization: token },
              });
              
              let scanCount = 0;
              
              if (scanResponse.ok) {
                const scanData = await scanResponse.json();
                // Handle scan logs response structure
                const scanLogsArray = scanData.scanLogs || scanData || [];
                scanCount = scanLogsArray.length || 0;
              }
              
              return {
                ...card,
                scanCount
              };
            } catch (error) {
              console.error("Error fetching card scan logs:", error);
              return {
                ...card,
                scanCount: 0
              };
            }
          })
        );
        
        staffCards = cardsWithScans;
        totalScans = cardsWithScans.reduce((sum, card) => sum + card.scanCount, 0);
      }
      
      setStaffStats({
        totalCards: staffCards.length,
        totalScans,
        staffCards
      });
      
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      setStaffStats({
        totalCards: 0,
        totalScans: 0,
        staffCards: []
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStaff().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadStaff();
  }, []);

  // Delete staff function
  const deleteStaff = async (staffId) => {
    triggerLocalNotification(
      "Confirm Deletion",
      `Are you sure you want to delete this staff member? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getItem("token");
              const response = await fetch(`${BASE_URL}/charm/deleteStaff/${staffId}`, {
                method: "DELETE",
                headers: { Authorization: token },
              });

              if (response.ok) {
                triggerLocalNotification("Deleted", "Staff member deleted successfully");
                setStaff(prev => prev.filter(staff => staff.id !== staffId));
                closeModal();
              } else {
                triggerLocalNotification("Error", "Failed to delete staff member");
              }
            } catch (error) {
              console.error("Delete Error:", error);
              triggerLocalNotification("Error", "An error occurred while deleting");
            }
          }
        },
      ]
    );
  };

  // Modal Functions
  const openStaffDetail = async (staffMember) => {
    setSelectedStaff(staffMember);
    setModalVisible(true);
    await fetchStaffStats(staffMember.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStaff(null);
    setStaffStats(null);
  };

  const formatFullDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return "Recently";
    }
  };
  

  const updatePaymentStatus = async (status) => {
  try {
    const token = await getItem("token");
    const response = await fetch(`${BASE_URL}/charm/bills/${selectedStaff.id}`, {
      method: "PUT",
      headers: { 
        Authorization: token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bills: status })
    });

    if (response.ok) {
      triggerLocalNotification("Success", "Payment status updated successfully");
      // Update local state
      setSelectedStaff(prev => ({ ...prev, bills: status }));
      setStaff(prev => prev.map(user => 
        user.id === selectedStaff.id ? { ...user, bills: status } : user
      ));
    } else {
      triggerLocalNotification("Error", "Failed to update payment status");
    }
  } catch (error) {
    console.error("Update Error:", error);
    triggerLocalNotification("Error", "An error occurred while updating");
  }
};

  const statusColor = (bills) => {
  const THEME = {
    secondary: "#10B981",
    primary: "#4F46E5",
    danger: "#EF4444",
  };
  const billMap = {
    'not paid': THEME.primary,
    'paid': THEME.secondary,
    'suspended': THEME.danger,
  };
  return billMap[bills] || THEME.primary; 
};

  const getStaffRoleText = (role) => {
    const roleMap = {
      'supa': 'Administrator',
      'staff': 'Staff',
      'yuza': 'user'
    };
    return roleMap[role] || role || 'Staff';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="user" size={64} color="#D1D5DB" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No Staff Members Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no staff members registered in the system yet
      </Text>
    </View>
  );

  const renderStaffCard = (staffMember, index) => (
    <Animated.View
      key={staffMember.id}
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => openStaffDetail(staffMember)}
        activeOpacity={0.7}
      >
        {/* Staff Identity */}
        <View style={styles.cardIdentity}>
          {staffMember.profile ? (
            <Image source={{ uri: `${BASE_URL}${staffMember.profile}` }} style={styles.avatar} />
          ) : (
            <View style={styles.iconCircle}>
              <Icon name="user" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{staffMember.username}</Text>
            <Text style={styles.staffEmail}>{staffMember.email}</Text>
            <Text style={styles.joinDate}>
              Joined {formatTimeAgo(staffMember.created_at)}
            </Text>
          </View>
        </View>

        {/* Stats Row with Icons */}
        <View style={styles.statsActionsRow}>
          <View style={styles.statItem}>
            <Icon name="id-card" size={16} color="#4F46E5" />
            <Text style={styles.statNumber}>{staffMember.totalCards}</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          
          <View style={styles.actionsDivider} />
          
          <View style={styles.statItem}>
            <Icon name="camera" size={16} color="#4F46E5" />
            <Text style={styles.statNumber}>{staffMember.totalScans}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.actionsDivider} />
                    
          <View style={styles.statItem}>
            {staffMember.bills === 'paid'?(
          <Icon name="check-circle" size={16} color="#059669" />
             ):(
          <Icon name="warning" size={16} color="red" />
          )}
         <Text style={styles.statLabel}>{staffMember.bills}</Text>
        </View>

          <View style={styles.actionsDivider} />
          
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => deleteStaff(staffMember.id)}
          >
            <Icon name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const StaffDetailModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Staff Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedStaff && (
              <>
                {/* Staff Information */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Staff Information</Text>
                  <View style={styles.modalRow}>
                    <Icon name="user" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Username:</Text>
                    <Text style={styles.modalValue}>{selectedStaff.username}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="envelope" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Email:</Text>
                    <Text style={styles.modalValue}>{selectedStaff.email}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="shield" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Role:</Text>
                    <Text style={[styles.modalValue, styles.roleText]}>
                      {getStaffRoleText(selectedStaff.agility || selectedStaff.role)}
                    </Text>
                  </View>
                  {selectedStaff.created_at && (
                    <>
                      <View style={styles.modalRow}>
                        <Icon name="calendar" size={18} color="#4F46E5" />
                        <Text style={styles.modalLabel}>Joined Date:</Text>
                        <Text style={styles.modalValue}>
                          {formatFullDate(selectedStaff.created_at)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Icon name="clock-o" size={18} color="#4F46E5" />
                        <Text style={styles.modalLabel}>Member for:</Text>
                        <Text style={styles.modalValue}>
                          {formatTimeAgo(selectedStaff.created_at)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>


               {/*payments & billimg */}
                {selectedStaff && (
                  <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Payments & Billings</Text>
                    <View style={styles.modalRow}>
                      <Icon name="credit-card" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Payments Status:</Text>
                       <Text style={[styles.modalValue, { color: statusColor(selectedStaff.bills) }]}>
                          {selectedStaff.bills || 'not paid'}
                        </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Icon name="check-circle" size={18} color="#059669" />
                      <Text style={styles.modalLabel}>Activate Payments:</Text>
                      {selectedStaff.bills === 'suspended' || selectedStaff.bills === 'not paid'? (
                       <TouchableOpacity style={[styles.modalValue, styles.roleButton]} onPress={() => updatePaymentStatus('paid')}>Activate</TouchableOpacity>
                      ):(
                       <TouchableOpacity style={[styles.modalValue, styles.roleButton]} onPress={() => updatePaymentStatus('suspended')}>Suspend</TouchableOpacity>
                      )}
                    </View>
                  </View>
                  </>
                )}
                {/* Staff Analytics */}
                {staffStats && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Staff Analytics</Text>
                    <View style={styles.modalRow}>
                      <Icon name="id-card" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Total Cards:</Text>
                      <Text style={styles.modalValue}>{staffStats.totalCards}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Icon name="camera" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Total Scans:</Text>
                      <Text style={styles.modalValue}>{staffStats.totalScans}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteButton]}
              onPress={() => selectedStaff && deleteStaff(selectedStaff.id)}
            >
              <Icon name="trash" size={18} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.primaryButton]}
              onPress={closeModal}
            >
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Icon name="chevron-left" size={28} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Staff Management</Text>
              <Text style={styles.headerSubtitle}>
                {staff.length} staff member{staff.length !== 1 ? 's' : ''} registered
              </Text>
            </View>
          </View>
        </View>

        {/* Staff List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : staff.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.staffList}>
            {staff.map(renderStaffCard)}
          </View>
        )}
      </ScrollView>

      {/* Staff Detail Modal */}
      <StaffDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  container: { 
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxWidth: 600, // Maximum width for large screens
    alignSelf: 'center', // Center the container on large screens
    width: '100%', // Take full width on small screens
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },

  // Staff List
  staffList: {
    gap: 12,
    width: '100%',
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
    width: '100%', // Ensure card takes full width of container
  },
  cardContent: {
    padding: 16,
  },
  cardIdentity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // Stats & Actions Row
  statsActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  actionsDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E8F0",
  },
  actionIcon: {
    padding: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500, // Limit modal width on large screens
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    minWidth: 80,
  },
  modalValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  roleText: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
    roleButton:{ 
   flexDirection: "row",
   fontWeight: '1000',
    alignItems: "center",
    color: "#8B5CF6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    gap: 4,
    height: 32, 
   },
  // Modal Actions
  modalActions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty & Loading States
  emptyContainer: { 
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    width: '100%',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
});

export default StaffPanel;