import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from "../utils/config";
import { triggerLocalNotification } from "../utils/notifications";
import QRModal from '../utils/qrcode';
import { getItem } from "../utils/storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const MyCards = () => {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrValue, setQrCodeContent] = useState('');
  const [qrCardName, setQrCardName] = useState('');
  const [qrCardId, setQrCardId] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const fadeAnim = useState(new Animated.Value(0))[0];


  const loadCards = async () => {
    try {
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/savedCard`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const data = await response.json();
        const cardsWithStats = await Promise.all(
          data.vcards.map(async (card) => {
            const id = card.id;
            const statsResponse = await fetch(`${BASE_URL}/charm/scanLogs/${id}`, {
              headers: { Authorization: token },
            });
            
            let scanStats = { totalScans: 0 };
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              const numb =statsData.length;
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
        triggerLocalNotification("Error", "Failed to load your cards");
      }
    } catch (e) {
      console.error("Error fetching vCards", e);
      triggerLocalNotification("Oops!", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCards().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadCards();
  }, []);

  // Selection Mode Functions
  const toggleSelectionMode = () => {
    if (selectionMode) {
      exitSelectionMode();
    } else {
      setSelectionMode(true);
      setSelectedCards(new Set());
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedCards(new Set());
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = cards.map(card => card.id);
    setSelectedCards(new Set(allIds));
  };

  // Delete Functions
  const deleteSelectedCards = async () => {
    if (selectedCards.size === 0) return;
    
    triggerLocalNotification(
      "Delete Selected Cards",
      `Are you sure you want to delete ${selectedCards.size} vCard${selectedCards.size > 1 ? 's' : ''}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getItem("token");
              const selectedIds = Array.from(selectedCards);
              
              // Delete selected cards
              await Promise.all(
                selectedIds.map(id => 
                  fetch(`${BASE_URL}/charm/deleteCard/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                  })
                )
              );
          
              setCards(prev => prev.filter(card => !selectedCards.has(card.id)));
              triggerLocalNotification("Deleted", `${selectedIds.length} vCards deleted`);
              exitSelectionMode();
            } catch (error) {
              console.log("Error deleting selected cards:", error);
              triggerLocalNotification("Error", "Failed to delete vCards");
            }
          }
        },
      ]
    );
  };

  const deleteAllCards = async () => {
    triggerLocalNotification(
      "Delete All vCards",
      "Are you sure you want to delete all vCards? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getItem("token");
              
              // If backend has delete all endpoint
              const response = await fetch(`${BASE_URL}/charm/deleteAllCards`, {
                method: "DELETE",
                headers: { Authorization: token },
              });
              
              if (response.ok) {
                setCards([]);
                triggerLocalNotification("Deleted", "All vCards deleted");
                exitSelectionMode();
              } else {
                // Fallback: delete individually
                const deletePromises = cards.map(card => 
                  fetch(`${BASE_URL}/charm/deleteCard/${card.id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                  })
                );
                
                await Promise.all(deletePromises);
                setCards([]);
                triggerLocalNotification("Deleted", "All vCards deleted");
                exitSelectionMode();
              }
            } catch (error) {
              console.log("Error deleting all cards:", error);
              triggerLocalNotification("Error", "Failed to delete all vCards");
            }
          }
        },
      ]
    );
  };

  const handleShowQrCode = (cardData) => {
    const id = cardData.id;
    const s = btoa(id);
    const qrPath = `/ecard?s=${s}`;
    setQrCodeContent(qrPath);
    setQrCardName(cardData.name);
    setQrCardId(cardData.id);
    setQrCodeVisible(true);
    // router.push({ pathname: `/ecard?s=${s}` });
  };

  const handleDeleteConfirm = (card) => {
    triggerLocalNotification(
      'Confirm Deletion',
      `Are you sure you want to delete the vCard for ${card.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDelete(card), style: 'destructive' },
      ]
    );
  };

  const handleDelete = async (card) => {
    try {
      const token = await getItem('token');
      if (!token) {
        triggerLocalNotification('Login Required', 'Please log in to delete your vCard.');
        return;
      }

      const response = await fetch(`${BASE_URL}/charm/deleteCard/${card.id}`, {
        method: 'DELETE',
        headers: { Authorization: token },
      });

      if (response.ok) {
        if (response.status === 200) {
          triggerLocalNotification('Deleted', 'vCard has been removed.');
          loadCards();
        } else if (response.status === 401) {
          triggerLocalNotification('Oops!', 'Please Sign In to delete your vCard.');
        } else {
          triggerLocalNotification('Error', 'Failed to delete vCard.');
        }
      }
    } catch (e) {
      console.error('Failed to delete vCard', e);
      triggerLocalNotification('Error', 'Failed to delete vCard.');
    }
  };

  // Modal Functions
  const openCardDetail = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Never scanned";
    
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="id-card" size={64} color="#D1D5DB" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No vCards yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first vCard to start sharing with QR codes
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
        onPress={() => selectionMode ? toggleCardSelection(card.id) : openCardDetail(card)}
        onLongPress={() => !selectionMode && toggleCardSelection(card.id)}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <TouchableOpacity
            style={[
              styles.checkbox,
              selectedCards.has(card.id) && styles.checkboxSelected
            ]}
            onPress={() => toggleCardSelection(card.id)}
          >
            {selectedCards.has(card.id) && (
              <Icon name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.cardMainContent}>
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

          {/* Simple Stats & Actions Row */}
          <View style={styles.statsActionsRow}>
            <View style={styles.statItem}>
              <Icon name="camera" size={16} color="#4F46E5" />
              <Text style={styles.statNumber}>{card.totalScans}</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            
            <View style={styles.actionsDivider} />
            
            {!selectionMode && (
              <>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => handleShowQrCode(card)} >
                  <Icon name="qrcode" size={18} color="#4F46E5" />
                   <Text style={styles.statLabel}>Generate QR</Text>
                </TouchableOpacity>
                
                <View style={styles.actionsDivider} />
                
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => handleDeleteConfirm(card)}
                >
                  <Icon name="trash" size={18} color="#EF4444" />
                    <Text style={styles.statLabel}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
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

                {/* Scan Analytics */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Scan Analytics</Text>
                  <View style={styles.modalRow}>
                    <Icon name="camera" size={18} color="#059669" />
                    <Text style={styles.modalLabel}>Total Scans:</Text>
                    <Text style={styles.modalValue}>{selectedCard.totalScans}</Text>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Quick Actions</Text>
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalQrButton]}
                      onPress={() => {
                        closeModal();
                        handleShowQrCode(selectedCard);
                      }}
                    >
                      <Icon name="qrcode" size={20} color="#4F46E5" />
                      <Text style={styles.modalActionText}>Generate QR</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalScanButton]}
                      onPress={() => {
                        closeModal();
                        // router.push(`/scanned/${btoa(selectedCard.id)}`);
                        const soz = btoa(selectedCard.id);
                        router.push({ pathname: `/scanned?soz=${soz}`});
                      }}
                    >
                      <Icon name="list-alt" size={20} color="#059669" />
                      <Text style={styles.modalActionText}>card {selectedCard.id} scan logs</Text>
                    </TouchableOpacity>
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
            {!selectionMode ? (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Icon name="chevron-left" size={20} color="#4F46E5" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={exitSelectionMode}
                style={styles.backButton}
              >
                <Icon name="close" size={28} color="#EF4444" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.headerTitle}>
                {selectionMode ? `${selectedCards.size} selected` : "My vCards"}
              </Text>
              {!selectionMode && (
                <Text style={styles.headerSubtitle}>
                  {cards.length} card{cards.length !== 1 ? 's' : ''} created
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {selectionMode ? (
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={deleteSelectedCards}
                disabled={selectedCards.size === 0}
              >
                <Icon name="trash" size={22} color={selectedCards.size === 0 ? "#9CA3AF" : "#EF4444"} />
              </TouchableOpacity>
            ) : (
              <>
                {cards.length > 0 && (
                  <>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={toggleSelectionMode}
                    >
                      <Icon name="square-o" size={22} color="#4F46E5" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={deleteAllCards}
                    >
                      <Icon name="trash" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Selection Mode Actions */}
        {selectionMode && (
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={selectAll}
            >
              <Icon name="square-o" size={18} color="#4F46E5" />
              <Text style={styles.selectionActionText}>Select All</Text>
            </TouchableOpacity>
            <View style={styles.selectionDivider} />
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={deleteSelectedCards}
              disabled={selectedCards.size === 0}
            >
              <Icon name="trash" size={18} color={selectedCards.size === 0 ? "#9CA3AF" : "#EF4444"} />
              <Text style={[
                styles.selectionActionText,
                selectedCards.size === 0 && styles.selectionActionTextDisabled
              ]}>
                Delete ({selectedCards.size})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cards List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading your cards...</Text>
          </View>
        ) : cards.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.cardsList}>
            {cards.map(renderCard)}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - Moved to RIGHT */}
      {!selectionMode && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/card')}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* QR Code Modal */}
      <QRModal 
        visible={qrCodeVisible} 
        onClose={() => setQrCodeVisible(false)} 
        value={qrValue} 
        cardId={qrCardId} 
        cardName={qrCardName} 
      />

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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  // Selection Mode
  selectionActions: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selectionAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  selectionActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  selectionActionTextDisabled: {
    color: "#9CA3AF",
  },
  selectionDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },

  // Cards List
  cardsList: {
    gap: 12,
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
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  cardMainContent: {
    flex: 1,
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
    fontWeight: "600",
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

  // Floating Action Button - MOVED TO RIGHT
  fab: {
    position: "absolute",
    right: 80, 
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
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
    maxWidth: 500, // Same as ScanLogs
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
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  modalQrButton: {
    backgroundColor: '#EEF2FF',
  },
  modalScanButton: {
    backgroundColor: '#F0FDF4',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
});

export default MyCards;