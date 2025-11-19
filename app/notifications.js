import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { getItem } from "../utils/storage";
import { Swipeable } from "react-native-gesture-handler";
import { BASE_URL } from "../utils/config";
import { triggerLocalNotification } from "../utils/notifications";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

export default function NotificationInbox() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userRole, setUserRole] = useState('user');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const rowRefs = useRef({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0)).current;

  const categorizeNotification = (notification) => {
    const title = notification.title?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    
    if (title.includes('scan') || message.includes('scan') || message.includes('qr')) {
      return 'scan';
    } else if (title.includes('update') || title.includes('updated')) {
      return 'update';
    } else if (title.includes('delete') || title.includes('deleted')) {
      return 'deletion';
    } else if (title.includes('create') || title.includes('created') || title.includes('new')) {
      return 'creation';
    }
    
    return 'general';
  };

  const fetchNotifications = async () => {
    try {
      const token = await getItem("token");
      const userData = await getItem("userData");
      
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.agility || 'user');
      }

      const response = await fetch(`${BASE_URL}/charm/notifications`, {
        headers: { Authorization: token },
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();

      const normalized = data.map((n) => ({
        ...n,
        read: n.is_read === 1 || n.is_read === true,
        category: categorizeNotification(n),
        date: n.date ? new Date(n.date).toISOString() : new Date().toISOString(),
      }));

      normalized.sort((a, b) => {
        if (a.read === b.read) return new Date(b.date) - new Date(a.date);
        return a.read ? 1 : -1;
      });

      setNotifications(normalized);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.log("Error fetching notifications:", error);
      triggerLocalNotification("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  }, []);

  const markAsRead = async (id, swipeClose = false) => {
    try {
      const token = await getItem("token");
      await fetch(`${BASE_URL}/charm/notifications/read/${id}`, {
        method: "PUT",
        headers: { Authorization: token },
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      
      if (swipeClose && rowRefs.current[id]) {
        rowRefs.current[id].close();
      }
    } catch (error) {
      console.log("Error marking read:", error);
    }
  };

  const markSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      const token = await getItem("token");
      const selectedIds = Array.from(selectedNotifications);
      
      await Promise.all(
        selectedIds.map(id => 
          fetch(`${BASE_URL}/charm/notifications/read/${id}`, {
            method: "PUT",
            headers: { Authorization: token },
          })
        )
      );
      
      setNotifications((prev) =>
        prev.map((n) => (selectedNotifications.has(n.id) ? { ...n, read: true } : n))
      );
      
      triggerLocalNotification("Done", `${selectedIds.length} notifications marked as read`);
      exitSelectionMode();
    } catch (error) {
      console.log("Error marking selected as read:", error);
      triggerLocalNotification("Error", "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getItem("token");
      await fetch(`${BASE_URL}/charm/notifications/readAll`, {
        method: "PUT",
        headers: { Authorization: token },
      });
      
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSelectedNotifications(new Set());
      triggerLocalNotification("Done", "All notifications marked as read");
    } catch (error) {
      console.log("Error marking all as read:", error);
      triggerLocalNotification("Error", "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      if (rowRefs.current[id]) rowRefs.current[id].close();
      
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/deleteNotification/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        triggerLocalNotification("Deleted", "Notification removed");
      } else {
        triggerLocalNotification("Error", "Failed to delete");
      }
    } catch (error) {
      console.log("Delete error:", error);
      triggerLocalNotification("Error", "Failed to delete notification");
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    triggerLocalNotification(
      "Delete Selected",
      `Are you sure you want to delete ${selectedNotifications.size} notification${selectedNotifications.size > 1 ? 's' : ''}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getItem("token");
              const selectedIds = Array.from(selectedNotifications);
              
              await Promise.all(
                selectedIds.map(id => 
                  fetch(`${BASE_URL}/charm/deleteNotification/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                  })
                )
              );
              
              setNotifications((prev) => prev.filter((n) => !selectedNotifications.has(n.id)));
              triggerLocalNotification("Deleted", `${selectedIds.length} notifications deleted`);
              exitSelectionMode();
            } catch (error) {
              console.log("Error deleting selected:", error);
              triggerLocalNotification("Error", "Failed to delete notifications");
            }
          }
        },
      ]
    );
  };

  const deleteAll = async () => {
    triggerLocalNotification(
      "Delete All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getItem("token");
              // If your backend has a delete all endpoint, use it. Otherwise delete individually.
              const response = await fetch(`${BASE_URL}/charm/deleteAllNotifications`, {
                method: "DELETE",
                headers: { Authorization: token },
              });
              
              if (response.ok) {
                setNotifications([]);
                triggerLocalNotification("Deleted", "All notifications deleted");
                exitSelectionMode();
              } else {
                // Fallback: delete individually
                const deletePromises = notifications.map(notif => 
                  fetch(`${BASE_URL}/charm/deleteNotification/${notif.id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                  })
                );
                
                await Promise.all(deletePromises);
                setNotifications([]);
                triggerLocalNotification("Deleted", "All notifications deleted");
                exitSelectionMode();
              }
            } catch (error) {
              console.log("Error deleting all:", error);
              triggerLocalNotification("Error", "Failed to delete all notifications");
            }
          }
        },
      ]
    );
  };

  const openNotificationDetail = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    
    setSelectedNotification(notif);
    setDetailModalVisible(true);
    
    modalScale.setValue(0);
    Animated.spring(modalScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDetailModalVisible(false);
      setSelectedNotification(null);
    });
  };

  // Selection mode functions
  const toggleSelectionMode = () => {
    if (selectionMode) {
      exitSelectionMode();
    } else {
      setSelectionMode(true);
      setSelectedNotifications(new Set());
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotifications(new Set());
  };

  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(new Set(allIds));
  };

  const getAvailableCategories = () => {
    const baseCategories = [
      { key: 'all', label: 'All', count: notifications.length },
      { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
      { key: 'scan', label: 'QR Scans', count: notifications.filter(n => n.category === 'scan').length },
      { key: 'update', label: 'Updates', count: notifications.filter(n => n.category === 'update').length },
    ];

    if (userRole === 'supa' || userRole === 'stafu') {
      baseCategories.push(
        { key: 'user', label: 'Users', count: notifications.filter(n => n.title?.toLowerCase().includes('user')).length }
      );
    }

    baseCategories.push(
      { key: 'deletion', label: 'Deletions', count: notifications.filter(n => n.category === 'deletion').length }
    );

    return baseCategories;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedFilter === 'unread') return !notif.read;
    if (selectedFilter === 'scan') return notif.category === 'scan';
    if (selectedFilter === 'update') return notif.category === 'update';
    if (selectedFilter === 'user') return notif.title?.toLowerCase().includes('user');
    if (selectedFilter === 'deletion') return notif.category === 'deletion';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (category) => {
    const iconMap = {
      scan: "qrcode",
      update: "repeat",
      deletion: "trash",
      creation: "plus-circle",
      user: "user",
      general: "bell",
    };
    
    return iconMap[category] || iconMap.general;
  };

  const getNotificationColor = (category) => {
    const colorMap = {
      scan: "#3B82F6",
      update: "#10B981",
      deletion: "#EF4444",
      creation: "#8B5CF6",
      user: "#F59E0B",
      general: "#6B7280",
    };
    
    return colorMap[category] || colorMap.general;
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

  const formatFullDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const renderRightActions = (progress, dragX, item) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        {/* Mark as Read Button */}
        {!item.read && (
          <Animated.View style={{ transform: [{ translateX }] }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.readButton]}
              onPress={() => markAsRead(item.id, true)}
            >
              <Icon name="check-square" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Read</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Delete Button */}
        <Animated.View style={{ transform: [{ translateX }] }}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteNotification(item.id)}
          >
            <Icon name="trash" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name="bell" 
        size={64} 
        color="#D1D5DB" 
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? "We'll notify you when something happens" 
          : `No ${selectedFilter} notifications`
        }
      </Text>
    </View>
  );

  const renderNotificationItem = (item) => (
    <Swipeable
      key={item.id}
      ref={(ref) => (rowRefs.current[item.id] = ref)}
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      friction={2}
      rightThreshold={40}
      enabled={!selectionMode}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: item.read ? "#FFFFFF" : "#F0F9FF",
            borderLeftColor: getNotificationColor(item.category),
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContentWrapper}
          activeOpacity={0.7}
          onPress={() => selectionMode ? toggleNotificationSelection(item.id) : openNotificationDetail(item)}
          onLongPress={() => !selectionMode && toggleNotificationSelection(item.id)}
          delayLongPress={300}
        >
          {/* Selection Checkbox */}
          {selectionMode && (
            <TouchableOpacity
              style={[
                styles.checkbox,
                selectedNotifications.has(item.id) && styles.checkboxSelected
              ]}
              onPress={() => toggleNotificationSelection(item.id)}
            >
              {selectedNotifications.has(item.id) && (
                <Icon name="check-square" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: getNotificationColor(item.category) },
            ]}
          >
            <Icon
              name={getNotificationIcon(item.category)}
              size={20}
              color="#fff"
            />
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={[
                styles.title,
                item.read && styles.readTitle
              ]}>
                {item.title}
              </Text>
              {!item.read && !selectionMode && (
                <View style={styles.unreadDot} />
              )}
            </View>
            
            <Text style={[
              styles.message,
              item.read && styles.readMessage
            ]} numberOfLines={2}>
              {item.message}
            </Text>
            
            <Text style={styles.date}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          
          {!selectionMode && (
            <Icon name="chevron-right" size={18} color="#D1D5DB" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );

  const NotificationDetailModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={detailModalVisible}
      onRequestClose={closeModal}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: modalScale },
                {
                  translateY: modalScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }
              ],
              opacity: modalScale,
            }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[
                styles.modalIconCircle,
                { backgroundColor: getNotificationColor(selectedNotification?.category) }
              ]}>
                <Icon
                  name={getNotificationIcon(selectedNotification?.category)}
                  size={24}
                  color="#fff"
                />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {formatTimeAgo(selectedNotification?.created_at)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{selectedNotification?.message}</Text>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailItem}>
                <Icon name="clock-o" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>Sent: </Text>
                <Text style={styles.detailValue}>
                  {formatFullDate(selectedNotification?.date)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="tag" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>Type: </Text>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getNotificationColor(selectedNotification?.category) + '20' }
                ]}>
                  <Text style={[
                    styles.categoryText,
                    { color: getNotificationColor(selectedNotification?.category) }
                  ]}>
                    {selectedNotification?.category?.charAt(0).toUpperCase() + selectedNotification?.category?.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="check-circle" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>Status: </Text>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: selectedNotification?.read ? '#10B98120' : '#F59E0B20',
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: selectedNotification?.read ? '#10B981' : '#F59E0B' }
                  ]}>
                    {selectedNotification?.read ? 'Read' : 'Unread'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  closeModal();
                  setTimeout(() => deleteNotification(selectedNotification?.id), 300);
                }}
              >
                <Icon name="trash" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.closeButtonPrimary]}
                onPress={closeModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
                <Icon name="chevron-left" size={28} color="#4F46E5" />
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
                {selectionMode ? `${selectedNotifications.size} selected` : "Notifications"}
              </Text>
              {!selectionMode && unreadCount > 0 && (
                <Text style={styles.headerSubtitle}>
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {selectionMode ? (
              <>
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={markSelectedAsRead}
                  disabled={selectedNotifications.size === 0}
                >
                  <Icon name="check-square" size={22} color={selectedNotifications.size === 0 ? "#9CA3AF" : "#10B981"} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={deleteSelected}
                  disabled={selectedNotifications.size === 0}
                >
                  <Icon name="trash" size={22} color={selectedNotifications.size === 0 ? "#9CA3AF" : "#EF4444"} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {unreadCount > 0 && (
                  <TouchableOpacity 
                    style={styles.headerActionButton}
                    onPress={markAllAsRead}
                  >
                    <Icon name="check" size={22} color="#4F46E5" />
                  </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                  <>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={toggleSelectionMode}
                    >
                      <Icon name="check-square-o" size={22} color="#4F46E5" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={deleteAll}
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
              <Icon name="check-square-o" size={18} color="#4F46E5" />
              <Text style={styles.selectionActionText}>Select All</Text>
            </TouchableOpacity>
            <View style={styles.selectionDivider} />
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={markSelectedAsRead}
              disabled={selectedNotifications.size === 0}
            >
              <Icon name="eye" size={18} color={selectedNotifications.size === 0 ? "#9CA3AF" : "#10B981"} />
              <Text style={[
                styles.selectionActionText,
                selectedNotifications.size === 0 && styles.selectionActionTextDisabled
              ]}>
                Mark Read
              </Text>
            </TouchableOpacity>
            <View style={styles.selectionDivider} />
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={deleteSelected}
              disabled={selectedNotifications.size === 0}
            >
              <Icon name="trash" size={18} color={selectedNotifications.size === 0 ? "#9CA3AF" : "#EF4444"} />
              <Text style={[
                styles.selectionActionText,
                selectedNotifications.size === 0 && styles.selectionActionTextDisabled
              ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Tabs */}
        {!selectionMode && notifications.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollViewContent}
            >
              {getAvailableCategories().map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === category.key && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter(category.key)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === category.key && styles.filterTextActive
                  ]}>
                    {category.label}
                  </Text>
                  {category.count > 0 && (
                    <View style={styles.filterCount}>
                      <Text style={styles.filterCountText}>
                        {category.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Notifications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          renderEmptyState()
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredNotifications.map(renderNotificationItem)}
          </Animated.View>
        )}
      </ScrollView>

      <NotificationDetailModal />
    </SafeAreaView>
  );
}

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
    width: '100%',
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
  },

  // Filter Tabs - Compact and Fixed Height
  filterContainer: {
    marginBottom: 16,
    height: 40, // Fixed container height
  },
  filterScrollViewContent: {
    paddingHorizontal: 4, // Small padding to prevent edge clipping
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4, // Use horizontal margin instead of right
    gap: 4,
    height: 32, // Fixed height
    minWidth: 70,
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterCount: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCountText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 10,
  },

  // Notification Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    width: '100%', // Ensure card takes full width
  },
  cardContentWrapper: { 
    flexDirection: "row", 
    alignItems: "center",
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
  },
  checkboxSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { 
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  readTitle: {
    color: "#64748B",
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  readMessage: {
    color: "#94A3B8",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Swipe Actions
  rightActions: {
    flexDirection: "row",
    width: 160,
    marginBottom: 8,
  },
  actionButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 8,
  },
  readButton: {
    backgroundColor: "#10B981",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
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
    width: '100%',
    maxWidth: 500, // Limit modal width on large screens
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 16,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 4,
    marginTop: 4,
  },
  modalBody: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalMessage: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  detailsSection: {
    padding: 24,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    minWidth: 50,
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  closeButtonPrimary: {
    backgroundColor: '#4F46E5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
});