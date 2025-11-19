import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Platform,ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import  Ionicons  from  "react-native-vector-icons/FontAwesome";
import { BASE_URL } from '../../utils/config';
import { triggerLocalNotification } from '../../utils/notifications';
  
export default function RegisterScreen() {
  const [username, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] =useState(false);
  const router = useRouter();

const handleRegister = async () => {
  if(handleRegister){
    setLoading(true);
  }
const userData = {
  username: username,
  email: email,
  agility: "staff",
  };
  // Send data to backend (Node.js API)
  const response = await fetch(`${BASE_URL}/charm/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();
if(response){
  setLoading(false);
}
  if (response.ok) {
    // Registration successful
    triggerLocalNotification('Success', 'Staff Account created!'); 
    router.replace('/Dashbord'); 
  } else {
    // Handle error
    triggerLocalNotification('Failed:',result.message);
  }
};
  const getInputStyle = (inputName) => ({
    ...styles.input,
    borderColor: focused === inputName ? '#f5dd90' : '#2c2c2c'
  });

 if(loading) return <ActivityIndicator style={{flex: 1}} size="large" />;
   return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={{ fontWeight: 'bold' }}>V-card</Text><Text style={styles.logoSub}> App</Text></Text>
        <Text style={styles.subtitle}>Staff Registration</Text>
      <View style={styles.form}>
        <TextInput
          style={getInputStyle('fullName')}
          placeholder="Staff Username"
          placeholderTextColor="#777"
          onChangeText={setFullName}
          value={username}
          onFocus={() => setFocused('fullName')}
          onBlur={() => setFocused(null)}
        />
        <TextInput
          style={getInputStyle('email')}
          placeholder="Email"
          placeholderTextColor="#777"
          onChangeText={setEmail}
          value={email}
          keyboardType="email"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
        <TouchableOpacity  
          onPress={handleRegister}
          style={styles.button}
        >
          <Text style={styles.buttonText}>submit</Text>
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
    color: '#4F46E5', 
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