import { useState, useEffect, useCallback } from "react";
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

const AllCards = () => {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadCards = async () => {
    try {
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/AllCards`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        const cardsWithStats = await Promise.all(
          data.vcards.map(async (card) => {
            const statsResponse = await fetch(`${BASE_URL}/charm/scanLogs/${card.id}`, {
              headers: { Authorization: token },
            });
            
            let scanStats = { totalScans: 0 };
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              const numb = statsData.length;
              scanStats = {
                totalScans: numb || 0,
              };
            }
            
            return {
              ...card,
              ...scanStats
            };
          })
        );
        
        setCards(cardsWithStats);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        
      } else {
        console.error("Failed to fetch vCards", response.status);
        triggerLocalNotification("Error", "Failed to load cards");
      }
    } catch (e) {
      console.error("Error fetching vCards", e);
      triggerLocalNotification("Oops!", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = await getItem("token");
      const id = userId;
      const response = await fetch(`${BASE_URL}/charm/mee/${id}`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserDetails(userData[0]);
      } else {
        console.error("Failed to fetch user details", response.status);
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails(null);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCards().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadCards();
  }, []);

  // Modal Functions
  const openCardDetail = async (card) => {
    setSelectedCard(card);
    setModalVisible(true);
    // Fetch user details when card is selected
    if (card.user_id) {
      await fetchUserDetails(card.user_id);
    } else {
      setUserDetails(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
    setUserDetails(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const getUserRoleText = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'yuza': 'Standard User',
      'staff': 'Staff Member',
      'business': 'Business User'
    };
    return roleMap[role] || role || 'User';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="id-card" size={64} color="#D1D5DB" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No vCards Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no vCards created in the system yet
      </Text>
    </View>
  );

  const renderCard = (card, index) => (
    <Animated.View
      key={card.id}
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
        onPress={() => openCardDetail(card)}
        activeOpacity={0.7}
      >
        {/* Card Identity */}
        <View style={styles.cardIdentity}>
          {card.photoUri ? (
            <Image source={{ uri: `${BASE_URL}${card.photoUri}` }} style={styles.avatar} />
          ) : (
            <View style={styles.iconCircle}>
              <Icon name="user" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        </View>

        {/* Centered Scans Count */}
        <View style={styles.statsActionsRow}>
          <View style={styles.centeredStatItem}>
            <Icon name="camera" size={20} color="#4F46E5" />
            <Text style={styles.statNumber}>{card.totalScans}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const CardDetailModal = () => (
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
            <Text style={styles.modalTitle}>Card Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedCard && (
              <>
                {/* Card Information */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Card Information</Text>
                  <View style={styles.modalRow}>
                    <Icon name="user" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Name:</Text>
                    <Text style={styles.modalValue}>{selectedCard.name}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="briefcase" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Title:</Text>
                    <Text style={styles.modalValue}>{selectedCard.title}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="calendar" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Created:</Text>
                    <Text style={styles.modalValue}>
                      {formatDate(selectedCard.created_at)}
                    </Text>
                  </View>
                </View>

                {/* User Information */}
                {userDetails && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Creator Information</Text>
                    <View style={styles.modalRow}>
                      <Icon name="user-circle" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Username:</Text>
                      <Text style={styles.modalValue}>{userDetails.username || "N/A"}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Icon name="envelope" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Email:</Text>
                      <Text style={styles.modalValue}>{userDetails.email || "N/A"}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Icon name="shield" size={18} color="#8B5CF6" />
                      <Text style={styles.modalLabel}>Role:</Text>
                      <Text style={[styles.modalValue, styles.roleText]}>
                        {getUserRoleText(userDetails.agility)}
                        
                      </Text>
                    </View>
                  </View>
                )}

                {/* Scan Analytics */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Scan Analytics</Text>
                  <View style={styles.modalRow}>
                    <Icon name="camera" size={18} color="#8B5CF6" />
                    <Text style={styles.modalLabel}>Total Scans:</Text>
                    <Text style={styles.modalValue}>{selectedCard.totalScans}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalActions}>
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
              <Text style={styles.headerTitle}>All Cards</Text>
              <Text style={styles.headerSubtitle}>
                {cards.length} card{cards.length !== 1 ? 's' : ''} in system
              </Text>
            </View>
          </View>
        </View>

        {/* Cards List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading all cards...</Text>
          </View>
        ) : cards.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.cardsList}>
            {cards.map(renderCard)}
          </View>
        )}
      </ScrollView>

      {/* Card Detail Modal */}
      <CardDetailModal />
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

  // Cards List
  cardsList: {
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
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: "#64748B",
  },

  // Stats & Actions Row
  statsActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  centeredStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
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
  modalActions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
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

export default AllCards;