import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons  from 'react-native-vector-icons/FontAwesome';
import {  saveItem} from '../../utils/storage';
import { BASE_URL } from '../../utils/config';
import { triggerLocalNotification } from '../../utils/notifications';



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const[loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
  if(!email || !password){
    triggerLocalNotification('Warning:','Please Fill Required Fields!');return;
  }
    if(handleLogin){
      setLoading(true);
     }
  const userData = {
      email: email,
      password: password,
    };
  
    const response = await fetch(`${BASE_URL}/charm/login`, {
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
    const token =result.token;
    if (response.ok) {
    const agility=result.user.agility;

   if(agility==="supa"){
    await saveItem('token',token);  
    triggerLocalNotification('Success', ' Dear Admin Warmly Welcome!');
    router.push('/dashbord');  
   }
   else if(agility==="yuza"){
   await saveItem('token',token); 
   triggerLocalNotification('Success','Welcome');
   router.push('/dashboard');   
   }  else if(agility==="staff"){
    await saveItem('token',token);
    triggerLocalNotification('Success','Dear Admin Warmly Welcome!');
    router.push('/dashbard');
  }
    } else {
    triggerLocalNotification('Failed!', result.message || 'Login failed.');
    }
  };
  
 if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  return (
    <View style={styles.container}>
    <Text style={styles.logo}>V-Card<Text style={styles.logoSub}> App</Text></Text>
      <Text style={styles.subtitle}>Login</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          onChangeText={setEmail}
          value={email}
        />

        <View style={{ position: 'relative' }}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
        />
        <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon} >
            <Ionicons
              name={showPassword ? 'eye-slash' : 'eye'}
              size={22}
              color="#4F46E5"
            />
          </Pressable></View>
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>
            Create a new <Text style={styles.linkSub}>account!</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/changepassword')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // Dashboard bg
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32, // prominent
    fontWeight: '700', // bold
    color: '#4F46E5', // primary
    textAlign: 'center',
    fontFamily: 'BHH San Bartle', // updated font
  },
  logoSub: {
    color: '#1F2937', // dark text
    fontWeight: '600',
    fontFamily: 'BHH San Bartle', // updated font
  },
  subtitle: {
    textAlign: 'center',
    color: '#777', // dark text
    marginVertical: 16,
    fontSize: 12, // readable
    fontWeight: '600',
    fontFamily: 'BHH San Bartle', // updated font
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#FFF',
    color: '#1F2937',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    fontFamily: 'System', // keep system for readability in input
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
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
    fontFamily: 'BHH San Bartle', // updated font
  },
  link: {
    textAlign: 'center',
    color: '#6B7280', // secondary
    marginTop: 18,
    fontSize: 14,
    fontFamily: 'BHH San Bartle', // updated font
  },
  linkSub: {
    color: '#4F46E5', // primary accent
    fontWeight: '600',
    fontFamily: 'BHH San Bartle', // updated font
  },
  forgot: {
    textAlign: 'center',
    color: '#EF4444', // red
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'BHH San Bartle', // updated font
  },
});
