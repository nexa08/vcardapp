import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getItem, removeItem } from '../../utils/storage';
import { useRouter } from 'expo-router';
import  Ionicons  from 'react-native-vector-icons/FontAwesome';

import { BASE_URL } from '../../utils/config';
import { triggerLocalNotification } from '../../utils/notifications';

export default function EditProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(null);
  const router = useRouter();


    const fetchProfile = async () => {
      try {
        const token = await getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch(`${BASE_URL}/charm/me`, {
          headers: { Authorization: token },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();

        // handle response as object or array
        const profile = Array.isArray(data) ? data[0] : data;

        if (!profile) throw new Error('Profile data empty');

        setUser(profile);
        setUsername(profile.username || '');
        setEmail(profile.email || '');
      } catch (err) {
        console.log('Profile fetch error:', err.message);
        triggerLocalNotification('Error', err.message);
      } finally {
        setLoading(false); // always stop loading
      }
    };
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const token = await getItem('token');
      const res = await fetch(`${BASE_URL}/charm/UpdateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ email, username }),
      });
      const result = await res.json();

      if (res.ok) {
        triggerLocalNotification('Success', 'Profile updated!');
        router.back();
      } else {
        triggerLocalNotification('Failed', result.message || 'Update failed');
      }
    } catch (err) {
      console.log('Update error:', err.message);
      triggerLocalNotification('Error', err.message);
    }
  };

  const getInputStyle = (inputName) => ({
    ...styles.input,
    borderColor: focused === inputName ? '#f5dd90' : '#2c2c2c',
  });



  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={{ fontWeight: 'bold'}}>V-card</Text>
        <Text style={styles.logoSub}> App</Text>
      </Text>
      <Text style={styles.subtitle}>Update Profile</Text>

      <View style={styles.form}>
        <TextInput
          style={getInputStyle('username')}
          placeholder="Username"
          placeholderTextColor="#777"
          onChangeText={setUsername}
          value={username}
          onFocus={() => setFocused('username')}
          onBlur={() => setFocused(null)}
        />
        <TextInput
          style={getInputStyle('email')}
          placeholder="Email"
          placeholderTextColor="#777"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
        <TouchableOpacity onPress={handleProfileUpdate} style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
   <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Ionicons name="arrow-left" size={20} color="#4F46E5" />
    <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF' // same bg as login
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // theme background
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5', // primary blue
    textAlign: 'center',
    fontFamily: 'BHH San Bartle', // match login
  },
  logoSub: {
    color: '#1F2937', // dark text
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 16,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#FFF', // white fields
    color: '#1F2937',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light gray border
    fontSize: 16,
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#4F46E5', // primary button
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'BHH San Bartle',
  },
  backButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 6,
  },
  backText: {
    fontSize: 16,
    color: '#4F46E5', // same as primary accent
    marginLeft: 10,
    fontFamily: 'BHH San Bartle',
  },
});
