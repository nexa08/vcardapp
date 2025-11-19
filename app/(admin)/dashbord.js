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
  Alert,
  Dimensions,
} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter, usePathname } from "expo-router";
import { BASE_URL } from "../../utils/config";
import { triggerLocalNotification } from "../../utils/notifications";
import SessionGuard from "../../utils/session";
import { getItem, removeItem } from "../../utils/storage";
import { reverseGeocode } from "../../utils/reverse";

const { width } = Dimensions.get("window");

// === THEME CONSTANTS ===
const THEME = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  secondary: "#10B981",
  secondaryLight: "#D1FAE5",
  accent: "#F59E0B",
  accentLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    light: "#9CA3AF",
    inverse: "#FFFFFF"
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    card: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)"
  },
  border: {
    light: "#E5E7EB",
    medium: "#D1D5DB"
  },
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6
    }
  }
};

// === DASHBOARD TABS ===
const DASHBOARD_TABS = [
  { key: 'user', label: 'Dashboard', icon: 'list' },
  { key: 'admin', label: 'cPanel', icon: 'cog' }
];

// --- Statistics Card Component ---
const StatisticsCard = React.memo(({ title, value, subtitle, icon, color }) => (
  <View style={styles.statCard}>
    <View style={styles.statCardContent}>
      <View style={styles.statCardText}>
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.statCardIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color={THEME.text.inverse} />
      </View>
    </View>
  </View>
));

// --- Quick Action Card ---
const QuickActionCard = React.memo(({ label, iconName, badge, onPress }) => (
  <TouchableOpacity 
    style={styles.quickCard} 
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Quick action: ${label}`}
    accessibilityRole="button"
  >
    <Icon name={iconName} size={28} color={THEME.primary} />
    {label && <Text style={styles.quickCardLabel}>{label}</Text>}
    {badge && (
      <View style={styles.quickCardBadge}>
        <Text style={styles.quickCardBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
));

// --- Admin Action Card ---
const AdminActionCard = React.memo(({ label, iconName, description, onPress }) => (
  <TouchableOpacity 
    style={styles.adminCard} 
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Admin action: ${label}`}
    accessibilityRole="button"
  >
    <View style={styles.adminCardIcon}>
      <Icon name={iconName} size={32} color={THEME.primary} />
    </View>
    <View style={styles.adminCardContent}>
      <Text style={styles.adminCardTitle}>{label}</Text>
      <Text style={styles.adminCardDescription}>{description}</Text>
    </View>
    <Icon name="chevron-right" size={20} color={THEME.text.light} />
  </TouchableOpacity>
));

// --- Sidebar Item ---
const SidebarItem = React.memo(({ icon, label, badge, isActive, onPress, color }) => (
  <TouchableOpacity
    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Menu item: ${label}`}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
  >
    <Icon name={icon} size={22} color={color || THEME.primary} />
    <Text style={[styles.sidebarText, color ? { color } : {}]}>{label}</Text>
    {badge && (
      <View style={styles.sidebarBadge}>
        <Text style={styles.sidebarBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
));

// --- Scan Logs Card ---
const ScanLogsCard = React.memo(({ logs, isLoading }) => {
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
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recent Scans</Text>
        <Text style={styles.cardCount}>{recentLogs.length}</Text>
      </View>
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
                  color={THEME.primary}
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
          <Icon name="camera" size={48} color={THEME.text.light} />
          <Text style={styles.emptyStateText}>No scan activity yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your scan history will appear here
          </Text>
        </View>
      )}
    </View>
  );
});

// --- Saved Cards List ---
const SavedCardsList = React.memo(({ cards, isLoading }) => {
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
          <Icon name="id-card" size={48} color={THEME.text.light} />
          <Text style={styles.emptyStateText}>No vCards created yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first vCard to get started
          </Text>
        </View>
      )}
    </View>
  );
});

// --- Profile Component ---
const ProfileSection = React.memo(({ user, onPress }) => (
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
        <Icon name="user" size={20} color={THEME.text.inverse} />
      </View>
    )}
  </TouchableOpacity>
));

// --- Tab Navigation Component ---
const TabNavigation = React.memo(({ activeTab, onTabChange, userRole }) => {
  // Only show admin tab if user has admin privileges
  const availableTabs = DASHBOARD_TABS.filter(tab => 
    tab.key !== 'admin' || userRole === 'supa' || userRole === 'staff'
  );

  return (
    <View style={styles.tabContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollViewContent}
      >
        {availableTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Icon 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.key ? THEME.primary : THEME.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const sidebarAnim = useRef(new Animated.Value(-280)).current;
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Quick Actions & Sidebar Configuration
  const quickActions = useMemo(() => [
    { label: "Profile", icon: "user", route: "profile" },
    { label: "My Cards", icon: "id-card", route: "mycards" },
    { label: "Notifications", icon: "bell", route: "notifications", badge: unreadCount > 0 ? `${unreadCount}` : undefined },
    { label: "Settings", icon: "cog", route: "setting" },
    { label: "Activities", icon: "bar-chart", route: "scanactivity" },
    { label: "Create Card", icon: "plus-circle", route: "card" },
  ], [unreadCount]);

  // Admin Actions - ONLY for cPanel, not in sidebar
  const adminActions = useMemo(() => [
    { 
      label: "User Management", 
      icon: "users", 
      description: "Manage users, roles and permissions,with corresponding payments",
      route: "users" 
    },
        { 
      label: "Staff Management", 
      icon: "users", 
      description: "Manage Staffs,role,permission",
      route: "manage" 
    },
        { 
      label: "New Staff", 
      icon: "plus-circle", 
      description: "Add New Staff",
      route: "staff" 
    },
    { 
      label: "Scans Analytics", 
      icon: "qrcode", 
      description: "View qr codes scans,locations and performance metrics",
      route: "allscans" 
    },

    { 
      label: "VCard Management", 
      icon: "id-card", 
      description: "View all vcard create and activity logs for each card ",
      route: "managevcard" 
    },
  ], []);

  // Sidebar items - ONLY regular user actions, NO admin actions
  const sidebarItems = useMemo(() => [
    { label: "Dashboard", icon: "home", route: "dashbord" },
    ...quickActions,
    { label: "Logout", icon: "sign-out", color: THEME.danger, route: "logout" },
  ], [quickActions]);

  // Statistics data for User Dashboard
  const userStatistics = useMemo(() => [
    {
      title: "Total Scans",
      value: scanLogs.length.toString(),
      subtitle: "All time",
      icon: "camera",
      color: THEME.primary
    },
    {
      title: "vCards",
      value: savedCards.length.toString(),
      subtitle: "Created",
      icon: "id-card",
      color: THEME.secondary
    },
    {
      title: "Today's Scans",
      value: scanLogs.filter(log => {
        const today = new Date();
        const logDate = new Date(log.scanned_at);
        return logDate.toDateString() === today.toDateString();
      }).length.toString(),
      subtitle: "Today",
      icon: "calendar",
      color: THEME.accent
    },
    {
      title: "Active Cards",
      value: savedCards.filter(card => card.is_active !== false).length.toString(),
      subtitle: "Currently active",
      icon: "check-circle",
      color: THEME.danger
    }
  ], [scanLogs, savedCards]);

  // --- Fetch saved cards ---
  const loadSavedCards = async () => {
    try {
      const token = await getItem("token");
      const response = await fetch(`${BASE_URL}/charm/savedCard`, {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.vcards || []);
      }
    } catch (e) {
      console.error("Network error fetching vCards:", e);
      triggerLocalNotification("Ooops..!", "Log in to create limitless cards.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch user info ---
  const fetchUser = async () => {
    try {
      const token = await getItem("token");
      const res = await fetch(`${BASE_URL}/charm/me`, {
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Failed to load user info");
      const data = await res.json();
      if (data.agility !== "supa") {
        triggerLocalNotification("Failed!", "Access Denied");
        removeItem("token");
        router.push("/login");
      }
      data.avatar = data.profile ? `${BASE_URL}${data.profile}` : null;
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch unread notifications ---
  const fetchUnreadCount = async () => {
    try {
      const token = await getItem("token");
      const res = await fetch(`${BASE_URL}/charm/notification`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setUnreadCount(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Fetch recent scan logs ---
  const geocodeCache = {};
  const fetchScanLogs = async () => {
    try {
      const token = await getItem("token");
      const res = await fetch(`${BASE_URL}/charm/scan_logs`, {
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Failed to fetch scan logs");
      const data = await res.json();

      const enrichedLogs = await Promise.all(
        data.map(async (log) => {
          if (!log.city || !log.country || log.city === "Unknown" || log.country === "Unknown") {
            try {
              if (log.latitude && log.longitude) {
                const cacheKey = `${log.latitude},${log.longitude}`;
                
                if (!geocodeCache[cacheKey]) {
                  geocodeCache[cacheKey] = await reverseGeocode(log.latitude, log.longitude);
                }
                
                const location = geocodeCache[cacheKey];
                return {
                  ...log,
                  city: location.city || log.city || "Unknown",
                  country: location.country || log.country || "Unknown"
                };
              }
            } catch (error) {
              console.log("Reverse geocoding failed for log:", log.id, error);
            }
          }
          
          return log;
        })
      );

      setScanLogs(enrichedLogs);
    } catch (error) {
      console.error("Error fetching scan logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchUser(),
      loadSavedCards(),
      fetchUnreadCount(),
      fetchScanLogs()
    ]);
  }, []);

  // Sidebar Animation
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
      router.push('/logout');
    } else {
      router.push(`/${route}`);
    }
    toggleSidebar(false);
  }, [router, toggleSidebar]);

  // Admin action handler
  const handleAdminAction = useCallback((route) => {
    router.push(`/${route}`);
  }, [router]);

  // Pull to Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render User Dashboard
  const renderUserDashboard = () => (
    <>
      {/* Statistics Section */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statisticsGrid}>
        {userStatistics.map((stat, index) => (
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
        logs={scanLogs} 
        isLoading={logsLoading} 
      />

      {/* Saved Cards Section */}
      <SavedCardsList 
        cards={savedCards}
        isLoading={isLoading}
      />
    </>
  );

  // Render Admin cPanel - ONLY actions now
  const renderAdminCPanel = () => (
    <>
      {/* Welcome Header */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <Icon name="shield" size={32} color={THEME.primary} />
          <Text style={styles.welcomeTitle}>Admin Control Panel</Text>
        </View>
        <Text style={styles.welcomeSubtitle}>
          Manage your system and users with the tools below
        </Text>
      </View>

      {/* Admin Actions Section */}
      <Text style={styles.sectionTitle}>Admin Actions</Text>
      <View style={styles.adminActionsGrid}>
        {adminActions.map((action) => (
          <AdminActionCard
            key={action.label}
            label={action.label}
            iconName={action.icon}
            description={action.description}
            onPress={() => handleAdminAction(action.route)}
          />
        ))}
      </View>
    </>
  );

  // Error Boundary Fallback
  if (user && user.agility !== "supa" ) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="warning" size={64} color={THEME.danger} />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>You don't have permission to access this page.</Text>
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
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <Pressable 
            style={styles.overlay} 
            onPress={() => toggleSidebar(false)}
          />
        )}

        {/* Sidebar */}
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
            <Icon name="close" size={28} color={THEME.primary} />
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
              <Icon name="bars" size={28} color={THEME.primary} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {activeTab === 'user' ? 'Dashboard' : 'Control Panel'}
            </Text>
            
            <ProfileSection 
              user={user} 
              onPress={() => handleNavigate('profile')}
            />
          </View>

          {/* Tab Navigation */}
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={user?.agility}
          />

          <ScrollView 
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[THEME.primary]}
                tintColor={THEME.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'user' ? renderUserDashboard() : renderAdminCPanel()}
          </ScrollView>
        </View>

        {/* Floating Action Button - Only show on user dashboard */}
        {activeTab === 'user' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => handleNavigate('card')}
            accessible={true}
            accessibilityLabel="Create new card"
            accessibilityRole="button"
          >
            <Icon name="plus" size={28} color={THEME.text.inverse} />
          </TouchableOpacity>
        )}

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
// === THEMED STYLES ===
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: THEME.background.secondary 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.background.secondary
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: THEME.text.secondary,
    textAlign: 'center',
    marginBottom: 24
  },
  errorButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  errorButtonText: {
    color: THEME.text.inverse,
    fontWeight: '600',
    fontSize: 16
  },
  overlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    bottom: 0, 
    right: 0, 
    backgroundColor: THEME.background.overlay, 
    zIndex: 5 
  },
  sidebar: { 
    position: "absolute", 
    top: 0, 
    bottom: 0, 
    width: 280, 
    backgroundColor: THEME.primaryLight, 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    zIndex: 10,
    ...THEME.shadow.lg
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
    color: THEME.primary,
    fontSize: 16
  },
  sidebarBadge: { 
    backgroundColor: THEME.danger, 
    borderRadius: 10, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    marginLeft: "auto",
    minWidth: 20,
    alignItems: "center",
    justifyContent: 'center'
  },
  sidebarBadgeText: { 
    color: THEME.text.inverse, 
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
    backgroundColor: THEME.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
    minHeight: 70,
  },
  menuButton: {
    padding: 8,
    backgroundColor: THEME.primaryLight,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border.light
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: THEME.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border.light,
    minWidth: 120,
    ...THEME.shadow.sm,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.text.primary,
    textAlign: 'left',
  },
  profileRole: {
    fontSize: 12,
    color: THEME.text.secondary,
    textAlign: 'left',
    marginTop: 2,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  placeholderAvatar: { 
    backgroundColor: THEME.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: THEME.background.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
    height: 50,
  },
  tabScrollViewContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: THEME.background.secondary,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: THEME.primaryLight,
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.secondary,
  },
  tabTextActive: {
    color: THEME.primary,
  },

  // Welcome Card Styles
  welcomeCard: {
    backgroundColor: THEME.background.card,
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    ...THEME.shadow.md,
    borderWidth: 1,
    borderColor: THEME.border.light,
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginLeft: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Statistics Styles
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: THEME.background.card,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    ...THEME.shadow.md,
    borderWidth: 1,
    borderColor: THEME.border.light
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
    color: THEME.text.primary,
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  // Quick Actions & Admin Actions
  quickCardGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginBottom: 24
  },
  quickCard: { 
    backgroundColor: THEME.primaryLight,
    borderRadius: 16, 
    padding: 20, 
    width: "48%", 
    marginBottom: 16, 
    alignItems: "center", 
    justifyContent: "center",
    ...THEME.shadow.sm,
    borderWidth: 1,
    borderColor: THEME.border.light
  },
  quickCardLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: THEME.text.primary, 
    marginTop: 8, 
    textAlign: "center" 
  },
  quickCardBadge: { 
    position: "absolute", 
    top: -6, 
    right: -6, 
    backgroundColor: THEME.danger, 
    borderRadius: 10, 
    paddingHorizontal: 6, 
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickCardBadgeText: { 
    color: THEME.text.inverse, 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  
  // Admin Cards - Centered with min width
  adminActionsGrid: {
    marginBottom: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  adminCard: {
    backgroundColor: THEME.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadow.md,
    borderWidth: 1,
    borderColor: THEME.border.light,
    minWidth: 600,
  },
  adminCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  adminCardContent: {
    flex: 1,
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: 6,
  },
  adminCardDescription: {
    fontSize: 14,
    color: THEME.text.secondary,
    lineHeight: 20,
  },

  // Card Styles
  card: { 
    backgroundColor: THEME.background.card,
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
    ...THEME.shadow.sm,
    borderWidth: 1,
    borderColor: THEME.border.light
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
    color: THEME.text.primary
  },
  cardCount: {
    fontSize: 14,
    color: THEME.text.secondary,
    fontWeight: '600'
  },
  
  // Existing styles for other components...
  statRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.border.light
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
    color: THEME.text.primary 
  },
  statLabel: { 
    fontSize: 14, 
    color: THEME.text.secondary, 
    marginTop: 2 
  },
  statPlatform: {
    fontSize: 12,
    color: THEME.text.light,
    marginTop: 2,
    fontStyle: 'italic'
  },
  savedCardRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: THEME.background.secondary, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border.light
  },
  savedCardLeft: {
    marginRight: 12,
  },
  savedCardContent: { 
    flex: 1 
  },
  savedCardName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: THEME.text.primary 
  },
  savedCardTitle: { 
    fontSize: 14, 
    color: THEME.text.secondary, 
    marginTop: 2 
  },
  savedCardCompany: {
    fontSize: 12,
    color: THEME.primary,
    marginTop: 2,
    fontStyle: 'italic'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: THEME.text.primary, 
    marginBottom: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  fab: { 
    position: "absolute", 
    bottom: 80, 
    right: 80, 
    backgroundColor: THEME.primary, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: "center", 
    alignItems: "center", 
    ...THEME.shadow.lg,
    zIndex: 1000 
  },
  footer: { 
    padding: 20, 
    alignItems: "center",
    backgroundColor: THEME.background.secondary,
    borderTopWidth: 1,
    borderTopColor: THEME.border.light
  },
  footerText: { 
    color: THEME.text.secondary, 
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
    borderBottomColor: THEME.border.light
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: THEME.border.light
  },
  skeletonText: {
    flex: 1,
    marginLeft: 12
  },
  skeletonLine: {
    height: 16,
    backgroundColor: THEME.border.light,
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
    backgroundColor: THEME.background.secondary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border.light
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.border.light,
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
    color: THEME.text.secondary,
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.text.light,
    textAlign: 'center'
  }
});

export default Dashboard;