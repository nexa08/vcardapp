import React, { useEffect, useState, useCallback, useRef } from "react";
import {SafeAreaView, ScrollView,View,Text,StyleSheet,TouchableOpacity,ActivityIndicator,RefreshControl,Animated,Dimensions,Modal,} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { BASE_URL } from "../utils/config";
import { getItem } from "../utils/storage";
import {triggerLocalNotification} from '../utils/notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const ScanLogs = () => {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(new Set());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/scan_logzs`, {
        headers: { Authorization: token },
      });
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();

      // Use city and country directly from backend - no need for reverse geocoding
      const enrichedLogs = data.map(log => ({
        ...log,
        // Use backend values directly, fallback to "Unknown" if not provided
        city: log.city || "Unknown",
        country: log.country || "Unknown",
      }));

      setLogs(enrichedLogs);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error("Error fetching scan logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs().finally(() => setRefreshing(false));
  }, []);


  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedLogs(new Set());
  };

  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Modal Functions
  const openLogDetail = (log) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLog(null);
  };

  const getDeviceIcon = (userAgent, platform) => {
    const agent = userAgent?.toLowerCase() || '';
    const plat = platform?.toLowerCase() || '';
    
    if (agent.includes('iphone') || agent.includes('ipad') || plat.includes('ios')) {
      return { icon: "apple", color: "#000000", name: "iOS" };
    } else if (agent.includes('android') || plat.includes('android')) {
      return { icon: "android", color: "#3DDC84", name: "Android" };
    } else if (agent.includes('windows')) {
      return { icon: "windows", color: "#0078D4", name: "Windows" };
    } else if (agent.includes('mac')) {
      return { icon: "apple", color: "#000000", name: "Mac" };
    } else if (agent.includes('linux')) {
      return { icon: "linux", color: "#FCC624", name: "Linux" };
    } else {
      return { icon: "laptop", color: "#666666", name: "Desktop" };
    }
  };

  const getBrowserInfo = (userAgent) => {
    const agent = userAgent?.toLowerCase() || '';
    
    if (agent.includes('chrome') && !agent.includes('edg')) {
      return { name: "Chrome", color: "#4285F4" };
    } else if (agent.includes('safari') && !agent.includes('chrome')) {
      return { name: "Safari", color: "#000000" };
    } else if (agent.includes('firefox') || agent.includes('mozilla')) {
      return { name: "Firefox", color: "#FF7139" };
    } else if (agent.includes('edg')) {
      return { name: "Edge", color: "#0078D7" };
    } else {
      return { name: "Browser", color: "#666666" };
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
        second: '2-digit'
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Safe coordinate formatting
  const formatCoordinate = (coord) => {
    if (!coord) return "N/A";
    
    try {
      const num = typeof coord === 'string' ? parseFloat(coord) : coord;
      if (isNaN(num)) return "Invalid";
      return num.toFixed(4);
    } catch (error) {
      return "Error";
    }
  };

  const getLocationStatus = (log) => {
    const hasLocation = log.city && log.city !== "Unknown" && log.country && log.country !== "Unknown";
    
    if (hasLocation) {
      return { status: "available", color: "#10B981", text: "Location available" };
    } else {
      return { status: "unavailable", color: "#6B7280", text: "Location not available" };
    }
  };

  // Filter logs based on selection
  const filteredLogs = logs.filter(log => {
    const hasLocation = log.city && log.city !== "Unknown" && log.country && log.country !== "Unknown";
    
    if (selectedFilter === 'with_location') return hasLocation;
    if (selectedFilter === 'without_location') return !hasLocation;
    return true;
  });

  const locationLogsCount = logs.filter(log => 
    log.city && log.city !== "Unknown" && log.country && log.country !== "Unknown"
  ).length;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="camera" size={64} color="#D1D5DB" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No scan logs yet</Text>
      <Text style={styles.emptySubtitle}>
        QR code scans will appear here when people scan your vCards
      </Text>
    </View>
  );

  const renderLogCard = (log, index) => {
    const deviceInfo = getDeviceIcon(log.user_agent, log.platform);
    const browserInfo = getBrowserInfo(log.user_agent);
    const locationStatus = getLocationStatus(log);
    
    return (
      <Animated.View
        key={log.id || index}
        style={[
          styles.logCard,
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
          onPress={() => selectionMode ? toggleLogSelection(log.id) : openLogDetail(log)}
          onLongPress={() => !selectionMode && toggleLogSelection(log.id)}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          
          <View style={styles.cardMainContent}>
            {/* Header Row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIdContainer}>
                <Icon name="id-card" size={16} color="#4F46E5" />
                <Text style={styles.cardId}>Card: {log.card_id}</Text>
              </View>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(log.scanned_at)}
              </Text>
            </View>

            {/* Location Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Icon name="map-marker" size={16} color={locationStatus.color} />
                <Text style={[styles.detailText, { color: locationStatus.color }]}>
                  {log.city === "Unknown" ? "Location unavailable" : `${log.city}, ${log.country}`}
                </Text>
              </View>
            </View>

            {/* Device & Browser Row */}
            <View style={styles.techRow}>
              <View style={styles.techItem}>
                <Icon name={deviceInfo.icon} size={14} color={deviceInfo.color} />
                <Text style={styles.techText}>{deviceInfo.name}</Text>
              </View>
              
              <View style={styles.techDivider} />
              
              <View style={styles.techItem}>
                <Icon name="globe" size={14} color={browserInfo.color} />
                <Text style={styles.techText}>{browserInfo.name}</Text>
              </View>
              
              <View style={styles.techDivider} />
              
              <View style={styles.techItem}>
                <Icon name="wifi" size={14} color="#2563EB" />
                <Text style={styles.techText}>{log.ip}</Text>
              </View>
            </View>

            {/* Footer with chevron */}
            {!selectionMode && (
              <View style={styles.cardFooter}>
                <Text style={styles.viewDetails}>View details</Text>
                <Icon name="chevron-right" size={16} color="#9CA3AF" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const LogDetailModal = () => (
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
            <Text style={styles.modalTitle}>Scan Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedLog && (
              <>
                {/* Card ID */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Card Information</Text>
                  <View style={styles.modalRow}>
                    <Icon name="id-card" size={18} color="#4F46E5" />
                    <Text style={styles.modalLabel}>Card ID:</Text>
                    <Text style={styles.modalValue}>{selectedLog.card_id}</Text>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Location</Text>
                  <View style={styles.modalRow}>
                    <Icon name="map-marker" size={18} color="#059669" />
                    <Text style={styles.modalLabel}>City:</Text>
                    <Text style={styles.modalValue}>{selectedLog.city || "Unknown"}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="globe" size={18} color="#059669" />
                    <Text style={styles.modalLabel}>Country:</Text>
                    <Text style={styles.modalValue}>{selectedLog.country || "Unknown"}</Text>
                  </View>
                  {selectedLog.latitude && selectedLog.longitude && (
                    <View style={styles.modalRow}>
                      <Icon name="map" size={18} color="#059669" />
                      <Text style={styles.modalLabel}>Coordinates:</Text>
                      <Text style={styles.modalValue}>
                        {formatCoordinate(selectedLog.latitude)}, {formatCoordinate(selectedLog.longitude)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Device & Browser */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Device & Network</Text>
                  <View style={styles.modalRow}>
                    <Icon 
                      name={getDeviceIcon(selectedLog.user_agent, selectedLog.platform).icon} 
                      size={18} 
                      color={getDeviceIcon(selectedLog.user_agent, selectedLog.platform).color} 
                    />
                    <Text style={styles.modalLabel}>Platform:</Text>
                    <Text style={styles.modalValue}>
                      {selectedLog.platform || "Unknown"} ({getDeviceIcon(selectedLog.user_agent, selectedLog.platform).name})
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="globe" size={18} color={getBrowserInfo(selectedLog.user_agent).color} />
                    <Text style={styles.modalLabel}>Browser:</Text>
                    <Text style={styles.modalValue}>{getBrowserInfo(selectedLog.user_agent).name}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="wifi" size={18} color="#2563EB" />
                    <Text style={styles.modalLabel}>IP Address:</Text>
                    <Text style={styles.modalValue}>{selectedLog.ip}</Text>
                  </View>
                </View>

                {/* Timestamp */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Scan Time</Text>
                  <View style={styles.modalRow}>
                    <Icon name="clock-o" size={18} color="#EAB308" />
                    <Text style={styles.modalLabel}>Full Date:</Text>
                    <Text style={styles.modalValue}>
                      {formatFullDate(selectedLog.scanned_at)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Icon name="calendar" size={18} color="#EAB308" />
                    <Text style={styles.modalLabel}>Relative Time:</Text>
                    <Text style={styles.modalValue}>
                      {formatTimeAgo(selectedLog.scanned_at)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
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
                {selectionMode ? `${selectedLogs.size} selected` : "All Scans Log"}
              </Text>
            </View>
          </View>
        </View>



        {/* Stats & Filter Tabs */}
        {!selectionMode && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="camera" size={20} color="#4F46E5" />
                <Text style={styles.statNumber}>{logs.length}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="map-marker" size={20} color="#10B981" />
                <Text style={styles.statNumber}>{locationLogsCount}</Text>
                <Text style={styles.statLabel}>With Location</Text>
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'all' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === 'all' && styles.filterTextActive
                ]}>
                  All Scans
                </Text>
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>{logs.length}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'with_location' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter('with_location')}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === 'with_location' && styles.filterTextActive
                ]}>
                  With Location
                </Text>
                {locationLogsCount > 0 && (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>{locationLogsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'without_location' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter('without_location')}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === 'without_location' && styles.filterTextActive
                ]}>
                  No Location
                </Text>
                {(logs.length - locationLogsCount) > 0 && (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>{logs.length - locationLogsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </>
        )}

        {/* Scan Logs List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading scan logs...</Text>
          </View>
        ) : filteredLogs.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.logsList}>
            {filteredLogs.map(renderLogCard)}
          </View>
        )}
      </ScrollView>

      {/* Centered Modal */}
      <LogDetailModal />
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

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F1F5F9",
  },

  // Filter Tabs
// Filter Tabs - Ultra Compact
filterScrollView: {
  marginBottom: 20,
  width: '100%',
  height: 32, // Fixed container height
},
filterButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F1F5F9",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
  marginRight: 6,
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
  // Log Cards
  logsList: {
    gap: 12,
    width: '100%',
  },
  logCard: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  timeAgo: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  detailRow: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  techItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  techText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  techDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewDetails: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Modal Styles (Replaced Drawer)
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
    maxWidth: 500, 
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    maxHeight: SCREEN_HEIGHT * 0.5,
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

export default ScanLogs;