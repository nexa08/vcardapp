import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from 'expo-location';
import {triggerLocalNotification} from '../utils/notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    primary: "#1E293B",
    secondary: "#64748B",
    light: "#94A3B8",
    inverse: "#FFFFFF"
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    card: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)"
  },
  border: {
    light: "#F1F5F9",
    medium: "#E2E8F0"
  }
};

const MapPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get coordinates from params or use current location
  const initialLatitude = params.latitude ? parseFloat(params.latitude) : null;
  const initialLongitude = params.longitude ? parseFloat(params.longitude) : null;
  const locationName = params.name || 'Location Details';
  
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapProvider, setMapProvider] = useState('google');

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      // If coordinates are provided via params, use them
      if (initialLatitude && initialLongitude) {
        setLocation({
          latitude: initialLatitude,
          longitude: initialLongitude,
        });
        setLoading(false);
        return;
      }

      // Otherwise, get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Fallback to a default location
        setLocation({
          latitude: -6.7924,
          longitude: 39.2083,
        });
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error getting location:', err);
      // Fallback to default location
      setLocation({
        latitude: -6.7924,
        longitude: 39.2083,
      });
      setLoading(false);
    }
  };

  const getMapUrl = () => {
    if (!location) return '';
    
    if (mapProvider === 'google') {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`;
    } else {
      return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`;
    }
  };

  const handleGetDirections = () => {
    if (!location) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    
    Linking.openURL(url).catch(err => {
      triggerLocalNotification('Error', 'Could not open maps app');
      console.error('Error opening maps:', err);
    });
  };

  const handleOpenInMaps = () => {
    const url = getMapUrl();
    if (url) {
      Linking.openURL(url).catch(err => {
        triggerLocalNotification('Error', 'Could not open maps');
        console.error('Error opening maps:', err);
      });
    }
  };

  const handleShareLocation = () => {
    if (!location) return;

    const message = `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n\nOpen in Maps: ${getMapUrl()}`;
    
    if (navigator.share && Platform.OS === 'web') {
      navigator.share({
        title: 'Location',
        text: message,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(message).then(() => {
        triggerLocalNotification('Copied!', 'Location coordinates copied to clipboard');
      });
    }
  };

  const toggleMapProvider = () => {
    setMapProvider(current => current === 'google' ? 'openstreetmap' : 'google');
  };

  const MapPreviewCard = () => (
    <TouchableOpacity 
      style={styles.mapPreviewCard}
      onPress={handleOpenInMaps}
      activeOpacity={0.8}
    >
      <View style={styles.mapPreviewHeader}>
        <View style={styles.mapProviderBadge}>
          <Icon 
            name={mapProvider === 'google' ? 'google' : 'map'} 
            size={14} 
            color={THEME.primary} 
          />
          <Text style={styles.mapProviderText}>
            {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>
      
      <View style={styles.mapPreviewContent}>
        <Icon name="map" size={48} color={THEME.primary} />
        <Text style={styles.mapPreviewTitle}>Interactive Map</Text>
        <Text style={styles.mapPreviewSubtitle}>
          Tap to explore this location in {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
        </Text>
      </View>
      
      <View style={styles.mapPreviewFooter}>
        <Text style={styles.coordinatesPreview}>
          {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : ''}
        </Text>
        <Icon name="external-link" size={16} color={THEME.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  const WebMapEmbed = () => {
    if (!location) return <MapPreviewCard />;

    return (
      <View style={styles.mapContainer}>
        <iframe
          src={getMapUrl()}
          style={styles.mapIframe}
          title="Location Map"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <View style={styles.mapOverlay}>
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={handleOpenInMaps}
          >
            <Icon name="expand" size={20} color={THEME.text.inverse} />
            <Text style={styles.fullscreenText}>Open Fullscreen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={24} color={THEME.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location Map</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingTitle}>Loading Location</Text>
            <Text style={styles.loadingText}>Getting your map ready...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color={THEME.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{locationName}</Text>
          <Text style={styles.headerSubtitle}>
            {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={toggleMapProvider}
          style={styles.mapTypeButton}
        >
          <Icon 
            name={mapProvider === 'google' ? 'google' : 'globe'} 
            size={20} 
            color={THEME.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <Icon name="map-marker" size={20} color={THEME.primary} />
          <Text style={styles.sectionTitle}>Map View</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={initializeLocation}
          >
            <Icon name="refresh" size={16} color={THEME.primary} />
          </TouchableOpacity>
        </View>
        
        <WebMapEmbed />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickAction, styles.primaryAction]}
          onPress={handleGetDirections}
        >
          <View style={styles.actionIcon}>
            <Icon name="compass" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>Get Directions</Text>
          <Text style={styles.actionSubtitle}>Open in navigation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, styles.secondaryAction]}
          onPress={handleShareLocation}
        >
          <View style={styles.actionIcon}>
            <Icon name="share-alt" size={20} color={THEME.primary} />
          </View>
          <Text style={styles.actionTitle}>Share Location</Text>
          <Text style={styles.actionSubtitle}>Send to others</Text>
        </TouchableOpacity>
      </View>

      {/* Location Details */}
      <View style={styles.detailsSection}>
        <View style={styles.sectionHeader}>
          <Icon name="location-arrow" size={20} color={THEME.primary} />
          <Text style={styles.sectionTitle}>Location Details</Text>
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Icon name="compass" size={16} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Latitude</Text>
              <Text style={styles.detailValue}>
                {location?.latitude.toFixed(6)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Icon name="compass" size={16} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Longitude</Text>
              <Text style={styles.detailValue}>
                {location?.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Icon name="map" size={16} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Map Provider</Text>
              <Text style={styles.detailValue}>
                {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.detailCard}
            onPress={toggleMapProvider}
          >
            <View style={styles.detailIcon}>
              <Icon name="exchange" size={16} color={THEME.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Switch to</Text>
              <Text style={[styles.detailValue, styles.switchText]}>
                {mapProvider === 'google' ? 'OpenStreetMap' : 'Google Maps'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Note */}
      <View style={styles.footerNote}>
        <Icon name="globe" size={14} color={THEME.text.secondary} />
        <Text style={styles.footerText}>
          Map data from {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background.primary,
    maxWidth: 500, // Reduced width for large screens
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: THEME.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
  },
  backButton: {
    padding: 8,
    backgroundColor: THEME.primaryLight,
    borderRadius: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.text.secondary,
    marginTop: 2,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  mapTypeButton: {
    padding: 8,
    backgroundColor: THEME.primaryLight,
    borderRadius: 10,
  },
  placeholder: {
    width: 40,
  },
  mapSection: {
    margin: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    flex: 1,
  },
  refreshButton: {
    padding: 6,
    backgroundColor: THEME.primaryLight,
    borderRadius: 8,
  },
  mapContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border.light,
    position: 'relative',
  },
  mapIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  fullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  fullscreenText: {
    color: THEME.text.inverse,
    fontSize: 12,
    fontWeight: '500',
  },
  mapPreviewCard: {
    backgroundColor: THEME.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border.light,
    height: 280,
    justifyContent: 'space-between',
  },
  mapPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapProviderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mapProviderText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  mapPreviewContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  mapPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  mapPreviewSubtitle: {
    fontSize: 13,
    color: THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  mapPreviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border.light,
  },
  coordinatesPreview: {
    fontSize: 12,
    color: THEME.text.secondary,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: THEME.background.secondary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border.light,
  },
  primaryAction: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  secondaryAction: {
    backgroundColor: THEME.background.secondary,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  detailsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border.light,
    flex: 1,
    minWidth: '48%',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: THEME.text.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  switchText: {
    color: THEME.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: THEME.text.secondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: THEME.background.secondary,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border.light,
    width: '100%',
    maxWidth: 300,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    color: THEME.text.secondary,
    textAlign: 'center',
  },
});

export default MapPage;