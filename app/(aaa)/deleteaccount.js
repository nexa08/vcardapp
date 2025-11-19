import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { triggerLocalNotification } from '../../utils/notifications';
import { getItem } from '../../utils/storage';
import { BASE_URL } from '../../utils/config';

export default function DeleteAccountScreen() {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const token = await getItem('token');
      const response = await fetch(`${BASE_URL}/charm/DeleteAccount`, {
        method: 'DELETE',
        headers: { Authorization: token },
      });
      if (response.ok) {
        triggerLocalNotification('Deleted', 'Account Deleted Permanently!');
        router.push('/');
        return;
      } else {
        triggerLocalNotification('Error', 'Failed to Delete Account.');
      }
    } catch (e) {
      console.error('Failed to delete Account', e);
      triggerLocalNotification('Error', 'Failed to Delete Account.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.message}>
        Are you sure you want to delete your account?
      </Text>

      {/* Button Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
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
    backgroundColor: '#EEF2FF', // match login background
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
    color: '#1F2937', // dark gray
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
  deleteButton: {
    backgroundColor: '#EF4444',
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
