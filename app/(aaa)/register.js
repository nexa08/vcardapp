import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import  Ionicons  from 'react-native-vector-icons/FontAwesome';
import {triggerLocalNotification} from '../../utils/notifications';
import { BASE_URL } from '../../utils/config';

  
export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] =useState(false);
  const router = useRouter();


  //register button after been pressed
const handleRegister = async () => {
  if(handleRegister){
    setLoading(true);
  }
const infoz = {
  username: username,
  email: email,
  password: password,
  agility: "yuza",
  };
const isValidPassword = (pwd) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{5,}$/.test(pwd);
  if (!isValidPassword(password)) {
    triggerLocalNotification('Weak Password', 'Password must have 5 characters, with atleast(1 capital & 1 small)letter & 1 number and 1 sign');
    
    return(setLoading(false));
  }
 
  const response = await fetch(`${BASE_URL}/charm/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(infoz),
  });

  const result = await response.json();
if(response){
  setLoading(false);
}
  if (response.ok) {
    // Registration successful
    triggerLocalNotification('Success', 'Account created!'); 
    router.push('/login'); 
  } else {
    // Handle error
    triggerLocalNotification('Failed:',result.message);
  }
};


 if(loading) return <ActivityIndicator style={{flex: 1}} size="large" />;
   return (
    <View style={styles.container}>
<Text style={styles.logo}>V-Card<Text style={styles.logoSub}> App</Text></Text>
        <Text style={styles.subtitle}>register</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="UserName"
          placeholderTextColor="#777"
          onChangeText={setUsername}
          value={username}
          onFocus={() => setFocused('fullName')}
          onBlur={() => setFocused(null)}
        />
        <TextInput
           style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          onChangeText={setEmail}
          value={email}
          keyboardType="email"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
        <View style={{ position: 'relative' }}>
          <TextInput
             style={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            value={password}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-slash' : 'eye'}
              size={22}
              color="#4F46E5"
            />
          </Pressable>
        </View>
        <TouchableOpacity  
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>
            Have an account
            <Text style={styles.linkSub}> login</Text> here.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // Dashboard/Register bg
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5', // primary
    textAlign: 'center',
    fontFamily: 'BHH San Bartle', // updated font
  },
  logoSub: {
    color: '#1F2937', // dark accent
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
    backgroundColor: '#FFF', // white input
    color: '#1F2937', // text color
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light border
    fontSize: 16,
    fontFamily: 'System', // keep default for input readability
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  strengthText: {
    marginTop: -10,
    marginBottom: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#999',
    fontFamily: 'BHH San Bartle',
  },
  button: {
    backgroundColor: '#4F46E5', // primary
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
  link: {
    textAlign: 'center',
    color: '#6B7280', // secondary
    marginTop: 18,
    fontSize: 14,
    fontFamily: 'BHH San Bartle',
  },
  linkSub: {
    color: '#4F46E5', // primary accent
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
});
