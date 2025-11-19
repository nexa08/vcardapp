import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View,} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from '../utils/config';
import { pickFile } from '../utils/filepicker';
import { triggerLocalNotification } from '../utils/notifications';
import { getItem } from '../utils/storage';

const ProfileScreen = () => {
  const { height, width } = useWindowDimensions();
  const router = useRouter();

  const [expandedSections, setExpandedSections] = useState({
    personal: false,
    security: false,
    activity: false,
    account: false,
  });

  const [formState, setFormState] = useState({ file: null, fileUri: '' });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // avatar modal & uploading state
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

const fetchUser = async () => {
  try {
    const token = await getItem('token');
    const res = await fetch(`${BASE_URL}/charm/me`, {
      headers: { Authorization: token },
    });
    if (!res.ok) throw new Error('Failed to load user info');
    const data = await res.json();

    // prepend BASE_URL if avatar exists
    if (data.profile) {
      data.avatar = `${BASE_URL}${data.profile}`;
    } else {
      data.avatar = null;
    }

    setUser(data);
  } catch (err) {
    setError(err.message || String(err));
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUser();
    requestMediaLibraryPermissions();
  }, []);

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          triggerLocalNotification('Permission Required', 'Camera and Media Library permissions are needed to select photos.');
        }
      } catch (e) {
        // ignore permission errors for now
      }
    }
  };

  // open modal
  const openAvatarModal = () => setAvatarModalVisible(true);
  const closeAvatarModal = () => {
    // clear temporary file state
    setFormState({ file: null, fileUri: '' });
    setAvatarModalVisible(false);
  };

  // Pick file using your pickFile util (web-friendly)
  const handlePickAndUpload = async () => {
    try {
      // pick file
      const selectedFile = await pickFile();
      if (!selectedFile) {
        // user cancelled
        return;
      }

      // size guard (10MB)
      if (selectedFile.size && selectedFile.size > 10 * 1024 * 1024) {
        triggerLocalNotification('File Too Large', 'Please select a file under 10MB.');
        return;
      }

      // preview immediately
      setFormState({ file: selectedFile.file, fileUri: selectedFile.uri });
      setUser((prev) => ({ ...prev, avatar: selectedFile.uri })); // immediate preview

      // upload
      setUploading(true);
      const formData = new FormData();
      // append using a conventional field name 'file' — change if your backend expects 'avatar' instead
      formData.append('file', selectedFile.file);

      const token = await getItem('token');
      // On web don't set Content-Type (browser sets boundary automatically). On other platforms this often works too.
      const res = await fetch(`${BASE_URL}/charm/Avatar`, {
        method: 'POST',
        headers: { Authorization: token },
        body: formData,
      });

      if (!res.ok) {
        // try alternate endpoint (some of your earlier code used different paths)
        const text = await res.text();
        console.error('Avatar upload failed:', res.status, text);
        triggerLocalNotification('Failed', 'Profile photo not updated!');
        // optional: revert preview fetchUser to get server state
        await fetchUser();
      } else {
        // success - update user from server response if available
        let data = null;
        try {
          data = await res.json();
        } catch (_) {
          // response may be empty
        }
        // if server returns updated avatar url, use it; otherwise keep preview uri
        const newAvatarUrl = data?.avatar || data?.url || formState.fileUri || selectedFile.uri;
        setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
        triggerLocalNotification('Success', 'Profile picture updated successfully!');
      }
    } catch (e) {
      console.error('Upload error', e);
      triggerLocalNotification('Error', 'Failed to update profile photo. Check your connection.');
      await fetchUser();
    } finally {
      setUploading(false);
      setFormState({ file: null, fileUri: '' });
      setAvatarModalVisible(false);
    }
  };

  // Remove avatar (confirmed in modal)
  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      const token = await getItem('token');
      const res = await fetch(`${BASE_URL}/charm/removeAvatar`, {
        method: 'DELETE',
        headers: { Authorization: token },
      });
      if (!res.ok) {
        triggerLocalNotification('Failed', 'Could not remove avatar.');
      } else {
        setUser((prev) => ({ ...prev, avatar: null }));
        triggerLocalNotification('Success', 'Avatar removed.');
      }
    } catch (e) {
      console.error('Remove avatar error', e);
      triggerLocalNotification('Error', 'Failed to remove avatar.');
    } finally {
      setUploading(false);
      setAvatarModalVisible(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.mainCard, { width: width * 0.92, maxWidth: 400, maxHeight: height * 0.97 }]}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.headerBackground} />

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={openAvatarModal}
            activeOpacity={0.85}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Icon name="user" size={56} color="#FFF" />
              </View>
            )}

            {/* pencil badge */}
            <View style={styles.editIconWrapper}>
              <Icon name="pencil" size={16} color="#FFF" />
            </View>

            {/* subtle ring */}
            <View style={styles.avatarRing} pointerEvents="none" />
          </TouchableOpacity>

        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={{ height: 14 }} />

          {/* Personal Info */}
          <Section
            title="Personal Info"
            expanded={expandedSections.personal}
            onToggle={() => toggleSection('personal')}
          >
            <DetailRow icon="envelope" label="Email" value={user?.email} />
            <DetailRow icon="user" label="Username" value={user?.username} />
          </Section>

          {/* Security */}
          <Section title="Security" expanded={expandedSections.security}   onToggle={() => toggleSection('security')} >
            <SecurityButton text="Update Password" icon="key" onPress={() => router.push('/updatepassword')} />
            <SecurityButton text="Delete Account" icon="trash" danger onPress={() => router.push('/deleteaccount')} />
          </Section>

          {/* Activity */}
          <Section title="Recent Activity" expanded={expandedSections.activity} onToggle={() => toggleSection('activity')}>
          <SecurityButton text="Scan Logs" icon="qrcode" onPress={() => router.push('/scanactivity')} />
          <SecurityButton text="My Cards" icon="id-card" onPress={() => router.push('/mycards')} />
          </Section>

          {/* Account */}
          <Section title="Account" expanded={expandedSections.account} onToggle={() => toggleSection('account')}>
            <SecurityButton text="Edit Profile" icon="pencil" onPress={() => router.push('/editprofile')} activeOpacity={0.8} />
           <SecurityButton text="Logout" icon="sign-out" danger onPress={() => router.push('/logout')}  />
        
          </Section>
        </ScrollView>
      </View>

      {/* Avatar options modal */}
      <Modal visible={avatarModalVisible} transparent animationType="fade" onRequestClose={closeAvatarModal}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>Profile Photo</Text>

            {/* Upload button */}
            <TouchableOpacity style={modalStyles.primaryButton} onPress={handlePickAndUpload} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="cloud-upload" size={18} color="#fff" />
                  <Text style={modalStyles.primaryText}>Update Photo</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Remove only shown when avatar exists */}
            {user?.avatar ? (
              <TouchableOpacity style={modalStyles.dangerButton} onPress={handleRemoveAvatar} disabled={uploading}>
                <Icon name="trash" size={18} color="#fff" />
                <Text style={modalStyles.dangerText}>Remove Photo</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={modalStyles.cancelButton} onPress={closeAvatarModal} disabled={uploading}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* Small reusable components */
const Section = ({ title, expanded, onToggle, children }) => (
  <TouchableOpacity style={styles.cardSection} activeOpacity={0.95} onPress={onToggle}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
    </View>
    {expanded && (
      <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutUp.duration(150)} style={styles.cardContent}>
        {children}
      </Animated.View>
    )}
  </TouchableOpacity>
);

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={20} color={Colors.primary} />
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const SecurityButton = ({ text, icon, onPress, danger }) => (
  <TouchableOpacity style={[styles.securityBtn, danger && styles.dangerBtn]} onPress={onPress}>
    <Icon name={icon} size={18} color="#fff" />
    <Text style={styles.securityBtnText}>{text}</Text>
  </TouchableOpacity>
);

/* Styling */
const Colors = {
  primary: '#4F46E5',
  bg: '#E0E7FF',
  card: '#FFF',
  textDark: '#1F2937',
  textLight: '#6B7280',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 18 },
  mainCard: {
    backgroundColor: Colors.bg,
    borderRadius: 28,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 14,
    alignSelf: 'center',
  },
  header: { justifyContent: 'center', alignItems: 'center', paddingVertical: 42 },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    zIndex: -1,
    opacity: 0.95,
  },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 3, borderColor: '#FFF', marginBottom: 12, zIndex: 2 },
  placeholderAvatar: { backgroundColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center' },
  avatarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 0,
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 3,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF', zIndex: 2 },
  bio: { fontSize: 13, color: '#E6E6F0', marginBottom: 12, zIndex: 2 },
  container: { paddingHorizontal: 20, paddingBottom: 25 },
  cardSection: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 18,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  cardContent: { marginTop: 12, rowGap: 10 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243,244,246,0.95)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  label: { fontSize: 12, color: Colors.textLight },
  value: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  securityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginVertical: 8,
    gap: 10,
  },
  securityBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dangerBtn: { backgroundColor: '#EF4444' },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(249,250,251,0.95)',
    marginVertical: 8,
  },
  accountBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  accountBtnSubText: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,235,238,0.95)' },
});

/* Modal styles */
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,6,7,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dangerButton: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  dangerText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelButton: { marginTop: 6 },
  cancelText: { color: '#444' },
});

export default ProfileScreen;
