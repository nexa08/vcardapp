import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../utils/config';
import { getItem } from '../utils/storage';
import  Ionicons  from  "react-native-vector-icons/FontAwesome";
import { triggerLocalNotification } from '../utils/notifications';

export default function FormScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');


  const handleSubmit = async () => {
      if (!title || !description) {
        triggerLocalNotification('Validation Failed', 'Please fill all fields required');
        return;
      }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
 console.log('the upload data', formData);
  const token = await getItem('token');
  const response = await fetch(`${BASE_URL}/charm/contactUs`, {
        method: 'POST',
        headers: {
        Authorization: token, 
            },
            body: formData,
          });

  const result = await response.json();
  
      if (response.ok) {
        triggerLocalNotification('Success', 'Thank You For The Feedback');
        router.push('/(tabs)');
      } else {
        triggerLocalNotification('Error', result.message || 'Failed to submit complain.');
      }
      
  }
   return (
  <View style={styles.container}>
  <Text style={styles.logo}>
  <Text style={{ fontWeight: 'bold'}}>Vcard</Text>
  <Text style={styles.logoSub}> App</Text></Text>
  <Text style={styles.subtitle}>Submit Your Complain</Text>
  <View style={styles.form}>
  <TextInput style={styles.input} placeholder="eg. delayed feedback, system failure e.t.c" placeholderTextColor="#777" onChangeText={setTitle} value={title}multiline />
  <TextInput style={[styles.input, { height: 100 }]} placeholder="Short Description about your complain" placeholderTextColor="#777" onChangeText={setDescription} value={description}multiline />
  <TouchableOpacity style={styles.button} onPress={handleSubmit}>
  <Text style={styles.buttonText}>Submit</Text>
  </TouchableOpacity>
           {/* Back Button for main screen*/}
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
    backgroundColor: '#EEF2FF', // match login background
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5', // primary color
    textAlign: 'center',
    fontFamily: 'BHH San Bartle',
  },
  logoSub: {
    color: '#1F2937', // dark secondary
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777', // neutral text
    marginVertical: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'BHH San Bartle',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#FFF', // white input background
    color: '#1F2937', // dark text
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#4F46E5', // primary login button color
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
    color: '#4F46E5', // primary color for back text
    marginLeft: 10,
    fontFamily: 'BHH San Bartle',
  },
  forgot: {
    textAlign: 'center',
    color: '#EF4444', // red accent
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'BHH San Bartle',
  },
  link: {
    textAlign: 'center',
    color: '#6B7280', // secondary text
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

