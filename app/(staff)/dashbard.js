import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Pressable,
  Image,
  RefreshControl,
  FlatList,

  Dimensions,
} from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter, usePathname } from "expo-router";
import { BASE_URL } from "../../utils/config";
import { triggerLocalNotification } from "../../utils/notifications";
import SessionGuard from "../../utils/session";
import { getItem, removeItem } from "../../utils/storage";
import { reverseGeocode } from "../../utils/reverse";

const { width } = Dimensions.get("window");

// --- Statistics Card Component ---
const StatisticsCard = ({ title, value, subtitle, icon, color, gradient }) => (
  <View style={[styles.statCard, gradient && styles.statCardGradient]}>
    <View style={styles.statCardContent}>
      <View style={styles.statCardText}>
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.statCardIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="#FFF" />
      </View>
    </View>
  </View>
);

// --- Extracted Components ---

const QuickActionCard = ({ label, iconName, badge, onPress }) => (
  <TouchableOpacity 
    style={styles.quickCard} 
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Quick action: ${label}`}
    accessibilityRole="button"
  >
    <Icon name={iconName} size={28} color="#4F46E5" />
    {label && <Text style={styles.quickCardLabel}>{label}</Text>}
    {badge && (
      <View style={styles.quickCardBadge}>
        <Text style={styles.quickCardBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const SidebarItem = ({ icon, label, badge, isActive, onPress, color }) => (
  <TouchableOpacity
    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Menu item: ${label}`}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
  >
    <Icon name={icon} size={22} color={color || "#4F46E5"} />
    <Text style={[styles.sidebarText, color ? { color } : {}]}>{label}</Text>
    {badge && (
      <View style={styles.sidebarBadge}>
        <Text style={styles.sidebarBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const ScanLogsCard = ({ logs, isLoading }) => {
  const recentLogs = useMemo(() => logs.slice(0, 5), [logs]);

const getPlatformIcon = (platform) => {
  const platformLower = platform?.toLowerCase();
  if (platformLower?.includes('ios') || platformLower?.includes('apple')) return "apple";
  if (platformLower?.includes('android')) return "android";
  if (platformLower?.includes('windows')) return "windows";
  if (platformLower?.includes('mac')) return "apple";
  return "laptop";
};

  const getLocationText = (log) => {
    if (log.city && log.country) return `${log.city}, ${log.country}`;
    if (log.country) return log.country;
    return "Unknown Location";
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Scans</Text>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonText}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonShort]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent Scans</Text>
      {recentLogs.length > 0 ? (
        <FlatList
          data={recentLogs}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          scrollEnabled={false}
          renderItem={({ item: log }) => (
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Icon
                  name={getPlatformIcon(log.platform)}
                  size={22}
                  color="#4F46E5"
                />
              </View>
              <View style={styles.statText}>
                <Text style={styles.statValue}>{getLocationText(log)}</Text>
                <Text style={styles.statLabel}>
                  {new Date(log.scanned_at).toLocaleString()}
                </Text>
                {log.platform && (
                  <Text style={styles.statPlatform}>{log.platform}</Text>
                )}
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="qrcode" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No scan activity yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your scan history will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const SavedCardsList = ({ cards, isLoading, onCardAction }) => {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your vCards</Text>
        <View style={styles.skeletonContainer}>
          {[1, 2].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonShort]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Your vCards</Text>
        <Text style={styles.cardCount}>({cards.length})</Text>
      </View>
      {cards.length > 0 ? (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          scrollEnabled={false}
          renderItem={({ item: card }) => (
 <View style={styles.savedCardRow}>
  <View style={styles.savedCardLeft}>
    {card.photoUri ? (
      <Image source={{ uri: `${BASE_URL}${card.photoUri}` }} style={styles.avatar} />
    ) : (
      <View style={styles.iconCircle}>
        <Icon name="user" size={20} color="#fff" />
      </View>
    )}
  </View>
  <View style={styles.savedCardContent}>
    <Text style={styles.savedCardName}>{card.name || 'Unnamed Card'}</Text>
    <Text style={styles.savedCardTitle}>{card.title || 'No title'}</Text>
    {card.company && (
      <Text style={styles.savedCardCompany}>{card.company}</Text>
    )}
  </View>
</View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="id-card" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No vCards created yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first vCard to get started
          </Text>
        </View>
      )}
    </View>
  );
};
// --- Custom Hook for Data Fetching ---
const useDashboardData = () => {
  const [data, setData] = useState({
    user: null,
    cards: [],
    logs: [],
    unreadCount: 0
  });
  const [loading, setLoading] = useState({
    user: true,
    cards: true,
    logs: true,
    notifications: true
  });
  const [error, setError] = useState(null);

  // Geocoding cache
  const geocodeCache = useRef({});

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const token = await getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const [userRes, cardsRes, logsRes, notificationsRes] = await Promise.all([
        fetch(`${BASE_URL}/charm/me`, { 
          headers: { Authorization: token } 
        }),
        fetch(`${BASE_URL}/charm/savedCard`, { 
          headers: { Authorization: token } 
        }),
        fetch(`${BASE_URL}/charm/scan_logs`, { 
          headers: { Authorization: token } 
        }),
        fetch(`${BASE_URL}/charm/notification`, { 
          headers: { Authorization: token } 
        })
      ]);

      // Process user data
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.agility !== "staff") {
          throw new Error("Access Denied");
        }
        userData.avatar = userData.profile ? `${BASE_URL}${userData.profile}` : null;
        setData(prev => ({ ...prev, user: userData }));
      } else {
        throw new Error("Failed to fetch user data");
      }

      // Process cards data
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        const cardsList = cardsData.vcards || cardsData || [];
        setData(prev => ({ ...prev, cards: cardsList }));
      } else {
        console.warn("Failed to fetch cards data");
      }

      // Process scan logs with CONDITIONAL geocoding
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        const logsList = logsData || [];
        
        const enrichedLogs = await Promise.all(
          logsList.map(async (log) => {
            // Only use reverse geocoding if city or country are missing/unknown
            if (!log.city || !log.country || log.city === "Unknown" || log.country === "Unknown") {
              try {
                if (log.latitude && log.longitude) {
                  const cacheKey = `${log.latitude},${log.longitude}`;
                  
                  // Check cache first
                  if (!geocodeCache.current[cacheKey]) {
                    geocodeCache.current[cacheKey] = await reverseGeocode(log.latitude, log.longitude);
                  }
                  
                  const location = geocodeCache.current[cacheKey];
                  return {
                    ...log,
                    city: location.city || log.city || "Unknown",
                    country: location.country || log.country || "Unknown"
                  };
                }
              } catch (error) {
                console.log("Reverse geocoding failed for log:", log.id, error);
                // Keep original values if reverse geocoding fails
              }
            }
            
            // Return original log if city and country are already available
            return log;
          })
        );
        setData(prev => ({ ...prev, logs: enrichedLogs }));
      } else {
        console.warn("Failed to fetch scan logs");
      }

      // Process notifications
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        const unreadCount = typeof notificationsData === 'number' ? notificationsData : 0;
        setData(prev => ({ ...prev, unreadCount }));
      } else {
        console.warn("Failed to fetch notifications");
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
      triggerLocalNotification("Ooops..!", "LogIn to create limitless cards.");
      
      if (err.message === "Access Denied" || err.message.includes("authentication")) {
        await removeItem("token");
      }
    } finally {
      setLoading({ user: false, cards: false, logs: false, notifications: false });
    }
  }, []);

  return { data, loading, error, refetch: fetchData };
};
// --- Profile Component ---
const ProfileSection = ({ user, onPress }) => (
  <TouchableOpacity 
    style={styles.profileSection}
    onPress={onPress}
    accessible={true}
    accessibilityLabel="Go to profile"
    accessibilityRole="button"
  >
    {user?.avatar ? (
      <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
    ) : (
      <View style={[styles.profileAvatar, styles.placeholderAvatar]}>
        <Icon name="user" size={20} color="#FFF" />
      </View>
      
    )}
  </TouchableOpacity>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-280)).current;
  const router = useRouter();
  const pathname = usePathname();

  const { data, loading, error, refetch } = useDashboardData();

  // Quick Actions & Sidebar Configuration
  const quickActions = useMemo(() => [
    { label: "Profile", icon: "user", route: "profile" },
    { label: "My Cards", icon: "id-card", route: "mycards" },
    { label: "Notifications", icon: "bell", route: "notifications", badge: data.unreadCount > 0 ? `${data.unreadCount}` : undefined },
    { label: "Settings", icon: "cog", route: "settings" },
    { label: "Activities", icon: "bar-chart", route: "scanactivity" },
    { label: "Create Card", icon: "plus-circle", route: "card" },
  ], [data.unreadCount]);

  const sidebarItems = useMemo(() => [
    { label: "Dashboard", icon: "home", route: "dashbard" },
    ...quickActions,
    { label: "Logout", icon: "sign-out", color: "#EF4444", route: "logout" },
  ], [quickActions]);

  // Statistics data
  const statistics = useMemo(() => [
    {
      title: "Total Scans",
      value: data.logs.length.toString(),
      subtitle: "All time",
      icon: "camera",
      color: "#4F46E5"
    },
    {
      title: "vCards",
      value: data.cards.length.toString(),
      subtitle: "Created",
      icon: "id-card",
      color: "#10B981"
    },
    {
      title: "Today's Scans",
      value: data.logs.filter(log => {
        const today = new Date();
        const logDate = new Date(log.scanned_at);
        return logDate.toDateString() === today.toDateString();
      }).length.toString(),
      subtitle: "Today",
      icon: "calendar",
      color: "#F59E0B"
    },
    {
      title: "Active Cards",
      value: data.cards.filter(card => card.is_active !== false).length.toString(),
      subtitle: "Currently active",
      icon: "check",
      color: "#EF4444"
    }
  ], [data.logs, data.cards]);

  // Sidebar Animation - Fixed to stay completely off-screen when closed
  const toggleSidebar = useCallback((open) => {
    const toValue = open ? 0 : -280;
    setSidebarOpen(open);
    Animated.timing(sidebarAnim, { 
      toValue, 
      duration: 300, 
      useNativeDriver: true
    }).start();
  }, [sidebarAnim]);

  // Close sidebar when route changes
  useEffect(() => {
    if (sidebarOpen) {
      toggleSidebar(false);
    }
  }, [pathname]);

  // Navigation Handler
  const handleNavigate = useCallback((route) => {
    if (route === 'Logout') {
    router.push('/Logout');
    } else {
      router.push(`/${route}`);
    }
    toggleSidebar(false);
  }, [router, toggleSidebar]);

  // Card Actions Handler
  const handleCardAction = useCallback((action, card) => {
    switch (action) {
      case 'download':
        triggerLocalNotification("Info", `Download ${card.name}`);
        break;
      case 'qrcode':
        triggerLocalNotification("Info", `Show QR for ${card.name}`);
        break;
      case 'edit':
        router.push(`/card?edit=${card.id}`);
        break;
      case 'delete':
        triggerLocalNotification(
          "Delete Card",
          `Delete ${card.name}?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Delete", 
              style: "destructive",
              onPress: () => {
                triggerLocalNotification("Success", "Card deleted");
                // You would call your delete API here
              }
            }
          ]
        );
        break;
    }
  }, [router]);

  // Pull to Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Error Boundary Fallback
  if (error && error === "Access Denied") {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="warning" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>You don't have permission to access this dashboard.</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.errorButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SessionGuard>
      <SafeAreaView style={styles.safeArea}>
        {/* Sidebar Overlay - Only show when sidebar is open */}
        {sidebarOpen && (
          <Pressable 
            style={styles.overlay} 
            onPress={() => toggleSidebar(false)}
          />
        )}

        {/* Sidebar - Completely off-screen when closed */}
        <Animated.View 
          style={[
            styles.sidebar, 
            { 
              transform: [{ translateX: sidebarAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => toggleSidebar(false)} 
            style={styles.sidebarToggle}
          >
            <Icon name="close" size={28} color="#4F46E5" />
          </TouchableOpacity>
          
          {sidebarItems.map((item, idx) => (
            <SidebarItem
              key={idx}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              color={item.color}
              isActive={pathname === `/${item.route}`}
              onPress={() => handleNavigate(item.route)}
            />
          ))}
        </Animated.View>

        {/* Main Content */}
        <View style={styles.main}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => toggleSidebar(true)}
              accessible={true}
              accessibilityLabel="Open menu"
              accessibilityRole="button"
              style={styles.menuButton}
            >
              <Icon name="bars" size={28} color="#4F46E5" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Dashboard</Text>
            
            {/* Enhanced Profile Section */}
            <ProfileSection 
              user={data.user} 
              onPress={() => handleNavigate('Profile')}
            />
          </View>

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
            {/* Statistics Section */}
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statisticsGrid}>
              {statistics.map((stat, index) => (
                <StatisticsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </View>

            {/* Quick Actions Section */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickCardGrid}>
              {quickActions.map((item) => (
                <QuickActionCard
                  key={item.label}
                  label={item.label}
                  iconName={item.icon}
                  badge={item.badge}
                  onPress={() => handleNavigate(item.route)}
                />
              ))}
            </View>

            {/* Recent Scans Section */}
            <ScanLogsCard 
              logs={data.logs} 
              isLoading={loading.logs} 
            />

            {/* Saved Cards Section */}
            <SavedCardsList 
              cards={data.cards}
              isLoading={loading.cards}
              onCardAction={handleCardAction}
            />
          </ScrollView>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => handleNavigate('card')}
          accessible={true}
          accessibilityLabel="Create new card"
          accessibilityRole="button"
        >
          <Icon name="plus" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            &copy; 2025. Arusha Prime Design. All rights reserved.
          </Text>
        </View>
      </SafeAreaView>
    </SessionGuard>
  );
};

// === Enhanced Styles ===
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24
  },
  errorButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  errorButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16
  },
  overlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    bottom: 0, 
    right: 0, 
    backgroundColor: "rgba(0,0,0,0.4)", 
    zIndex: 5 
  },
  sidebar: { 
    position: "absolute", 
    top: 0, 
    bottom: 0, 
    width: 280, 
    backgroundColor: "#EEF2FF", 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10
  },
  sidebarToggle: { 
    marginBottom: 30,
    alignSelf: 'flex-end'
  },
  sidebarItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 8, 
    padding: 12, 
    borderRadius: 12 
  },
  sidebarItemActive: { 
    backgroundColor: "#E0E7FF" 
  },
  sidebarText: { 
    marginLeft: 12, 
    fontWeight: "600", 
    color: "#4F46E5",
    fontSize: 16
  },
  sidebarBadge: { 
    backgroundColor: "#EF4444", 
    borderRadius: 10, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    marginLeft: "auto",
    minWidth: 20,
    alignItems: "center",
    justifyContent: 'center'
  },
  sidebarBadgeText: { 
    color: "#FFF", 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  main: { 
    flex: 1,
    zIndex: 1
  },
  container: { 
    padding: 20,
    paddingBottom: 100
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 70,
  },
  menuButton: {
    padding: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#1F2937",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10
  },
  // Enhanced Profile Section Styles
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    marginRight: 10,
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: 'right',
  },
  profileRole: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: 'right',
    marginTop: 2,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  placeholderAvatar: { 
    backgroundColor: '#4F46E5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  // Statistics Styles
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  statCardGradient: {
    backgroundColor: "#4F46E5",
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardText: {
    flex: 1,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#1F2937",
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: "#4F46E5",
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quickCardGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginBottom: 24
  },
  quickCard: { 
    backgroundColor: "#EEF2FF",
    borderRadius: 16, 
    padding: 20, 
    width: "48%", 
    marginBottom: 16, 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  quickCardLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1F2937", 
    marginTop: 8, 
    textAlign: "center" 
  },
  quickCardBadge: { 
    position: "absolute", 
    top: -6, 
    right: -6, 
    backgroundColor: "#EF4444", 
    borderRadius: 10, 
    paddingHorizontal: 6, 
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickCardBadgeText: { 
    color: "#FFF", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  card: { 
    backgroundColor: "#EEF2FF",
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#1F2937"
  },
  cardCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: '600'
  },
  statRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: "#E5E7EB"
  },
  statIcon: { 
    width: 44, 
    alignItems: "center" 
  },
  statText: { 
    flex: 1, 
    marginLeft: 12 
  },
  statValue: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#1F2937" 
  },
  statLabel: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginTop: 2 
  },
  statPlatform: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    fontStyle: 'italic'
  },
  savedCardRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "#FFFFFF", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  savedCardContent: { 
    flex: 1 
  },
  savedCardName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1F2937" 
  },
  savedCardTitle: { 
    fontSize: 14, 
    color: "#6c757d", 
    marginTop: 2 
  },
  savedCardCompany: {
    fontSize: 12,
    color: "#4F46E5",
    marginTop: 2,
    fontStyle: 'italic'
  },
  savedCardActions: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  cardAction: {
    padding: 6
  },
  noCardsText: { 
    textAlign: "center", 
    color: "#6c757d", 
    fontSize: 14, 
    marginTop: 15 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginBottom: 16 
  },
  fab: { 
    position: "absolute", 
    bottom: 80, 
    right: 65, 
    backgroundColor: "#4F46E5", 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000 
  },
  footer: { 
    padding: 20, 
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB"
  },
  footerText: { 
    color: "#6B7280", 
    fontSize: 12 
  },
  // Skeleton Loading Styles
  skeletonContainer: {
    marginTop: 8
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E7EB'
  },
  skeletonText: {
    flex: 1,
    marginLeft: 12
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8
  },
  skeletonShort: {
    width: '60%'
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 12
  },
  skeletonContent: {
    flex: 1
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center'
  }
});

export default Dashboard;