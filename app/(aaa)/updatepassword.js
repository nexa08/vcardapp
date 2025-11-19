import {View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,ActivityIndicator,Modal} from 'react-native';
import  Ionicons  from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../utils/config';
import { triggerLocalNotification } from '../../utils/notifications';
import {getItem} from '../../utils/storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword0,setShowPassword0] = useState(false);

  const handleUpdatePassword = async () =>{
    const isValidPassword = (pwd) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{5,}$/.test(pwd);
    if (!password || !confirmPassword) {
      triggerLocalNotification('Error', 'All fields are required');return;
   }
    if (!isValidPassword(password)) {
      triggerLocalNotification('Weak Password', 'Password must have 5 characters, with atleast(1 capital & 1 small)letter & 1 number and 1 sign');return;
    }
  if (password !== confirmPassword) {
      triggerLocalNotification('Mismatch', 'Passwords do not match');return;
  }
  const token = await getItem('token');
    const res = await fetch(`${BASE_URL}/charm/UpdatePassword`, {
      method: 'POST',
       headers: { Authorization: token,'Content-Type': 'application/json',},
      body: JSON.stringify({ password }),
  });
   const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
     triggerLocalNotification('Success', 'Password has been reset');
     router.back();

  };
   
return(
     <View style={styles.container}>
    <Text style={styles.logo}>V-card<Text style={styles.logoSub}> App</Text></Text>
    <Text style={styles.subtitle}>Enter New Password</Text>
    <View style={styles.form}>
    <View style={{position: 'relative'}} >
    <TextInput
      style={styles.input}
      placeholder="New Password"
      placeholderTextColor="#777"
      secureTextEntry={!showPassword0}
      value={password}
      onChangeText={setPassword}/>
    <Pressable
      onPress={() => setShowPassword0(!showPassword0)}
      style={styles.eyeIcon}>
    <Ionicons
      name={showPassword0 ? 'eye-slash' : 'eye'}
      size={22}
      color="#4F46E5"/>
    </Pressable>
    </View>
    <View style={{position: 'relative'}}>
    <TextInput
      style={styles.input}
      placeholder="Confirm Password"
      placeholderTextColor="#777"
      secureTextEntry={!showPassword}
      value={confirmPassword}
      onChangeText={setConfirmPassword}/>
    <Pressable
      onPress={() => setShowPassword(!showPassword)}
      style={styles.eyeIcon}>
    <Ionicons
      name={showPassword ? 'eye-slash' : 'eye'}
      size={22}
      color="#4F46E5"/>
    </Pressable>
    </View>
    <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
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
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // same soft background as login
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5', // primary blue
    textAlign: 'center',
    fontFamily: 'BHH San Bartle',
  },
  logoSub: {
    color: '#1F2937', // dark text
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777', // dark neutral
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
    backgroundColor: '#FFF', // white input fields
    color: '#1F2937',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light gray border
    fontSize: 16,
    fontFamily: 'System',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },

  button: {
    backgroundColor: '#4F46E5', // primary button color
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
    color: '#4F46E5', // same as primary blue
    marginLeft: 10,
    fontFamily: 'BHH San Bartle',
  },
  buttonClose: {
    fontSize: 16,
    color: '#4F46E5',
    marginLeft: 15,
    fontFamily: 'BHH San Bartle',
  },
  textStyle: {
    color: '#1F2937',
    fontFamily: 'BHH San Bartle',
  },
});
