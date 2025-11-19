import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { removeItem } from '../utils/storage';
import { triggerLocalNotification } from '../utils/notifications';

export default function LogoutScreen() {
  const router = useRouter();

  const handleLogout = () => {
    removeItem('token');
    triggerLocalNotification('Success', 'Logged out successfully!');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logout</Text>
      <Text style={styles.message}>Are you sure you want to log out?</Text>

      {/* Horizontal Button Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // same as Delete Account
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#4F46E5', // primary blue
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'BHH San Bartle',
  },
  message: {
    fontSize: 16,
    color: '#1F2937', // neutral text
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'BHH San Bartle',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444', // red, matching delete
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BHH San Bartle',
  },
  cancelText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BHH San Bartle',
  },
});
