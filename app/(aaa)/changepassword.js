import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Modal } from 'react-native';
import Ionicons  from 'react-native-vector-icons/FontAwesome';
import { useRouter} from 'expo-router';
import { Pressable } from 'react-native';
import { BASE_URL } from '../../utils/config';
import { triggerLocalNotification } from '../../utils/notifications';

export default function ChangePasswordScreen() {
  const [email, setEmail] = useState('');
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2,setModalVisible2] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword0,setShowPassword0] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

//sendOTP handle
  const handleSendOTP = async () => {
if (!email) {
      triggerLocalNotification('Failed', 'Please enter your email.');
return;
    }
try {
  const response = await fetch(`${BASE_URL}/charm/sendOTP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
});
  const result = await response.json();
if (response.ok) {
    triggerLocalNotification('Success', 'OTP sent, visit your email.'); 
    setModalVisible1(true);             
} else {
    triggerLocalNotification('Failed', result.message || 'Failed to send OTP');
}
} catch (error) {
   triggerLocalNotification('Failed', 'OTP Request Failed.');
}
};

  //verify OTP handle
  const handleVerifyOTP = async () => {
if (!otp) {
   triggerLocalNotification('Failed', 'please enter otp to verify');return;
}  
try {
  const response = await fetch(`${BASE_URL} /charm/verifyOTP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp,email}),
});   
  const result = await response.json();
if (response.ok) {
   triggerLocalNotification('Success', 'OTP verified, Enter new password');
   setModalVisible2(true);           
} else {
   triggerLocalNotification('Failed', result.message || 'OTP verification failed.');
}
} catch (error) {
   triggerLocalNotification('Failed', 'OTP verification failed.');
}
};

  //enter new password handle
  const handlenewPassword = async () => {
  const isValidPassword = (pwd) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{5,}$/.test(pwd);
  if (!password || !confirmPassword) {
    triggerLocalNotification('Failed', 'All fields are required');return;
 }
  if (!isValidPassword(password)) {
    triggerLocalNotification('Weak Password', 'Password must have 5 characters, with atleast(1 capital & 1 small)letter & 1 number and 1 sign');return;
  }
if (password !== confirmPassword) {
    triggerLocalNotification('Mismatch', 'Passwords do not match');return;
}
  const res = await fetch(`${BASE_URL}/charm/newPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({email,password }),
});
 const data = await res.json();
if (!res.ok) throw new Error(data.message || 'Something went wrong');
   triggerLocalNotification('Success', 'Password has been reset');
  router.push('/login');
 };
  const paswordValue=(value)=>{
    setPassword(value);
 };
  
  return (
<View style={styles.container}>
<Text style={styles.logo}>V-Card<Text style={styles.logoSub}> App</Text></Text>
<Text style={styles.subtitle}>Reset your password</Text>
<View style={styles.form}>
<TextInput
style={styles.input}
placeholder="Email"
placeholderTextColor="#777"
onChangeText={setEmail}
value={email}/>
<TouchableOpacity style={styles.button} onPress={handleSendOTP}>
<Text style={styles.buttonText}>Reset</Text>
</TouchableOpacity>


{/* Back Button for main screen*/}
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
<Ionicons name="arrow-left" size={20} color="#4F46E5" />
<Text style={styles.backText}>Back</Text>
</TouchableOpacity>
</View>

{/*..................modal one start(verify OTP modal)...................... */}
  <Modal
  transparent={true}
  animationType="slide"
  visible={modalVisible1}
  onRequestClose={() => {
  showAlert('Modal has been closed.');
   setModalVisible1(!modalVisible1);
  }}> 
<View style={styles.container}>
<Text style={styles.logo}>Crime Report<Text style={styles.logoSub}> App</Text></Text>
<View style={styles.form}>
<Text style={styles.subtitle}>Enter OTP</Text>
<TextInput
 style={styles.input}
 placeholder="Enter OTP"
 placeholderTextColor="#777"
 value={otp}
 onChangeText={setOtp}
 keyboardType="numeric"/>
<TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
<Text style={styles.buttonText}>Verify OTP</Text>
</TouchableOpacity>
    {/* Back Button for OTP verification*/}
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
<Ionicons name="arrow-back" size={20} color="#4F46E5" />
<Text style={styles.backText}>Back</Text>
</TouchableOpacity>
</View>
</View>
</Modal>
{/* .........................modal one end.................... */}


{/* .......................modal two start (input new password modal).................. */}
<Modal
  transparent={true}
  animationType="slide"
  visible={modalVisible2}
  onRequestClose={() => {
    setModalVisible2(!modalVisible2);}}> 

 <View style={styles.container}>
<Text style={styles.logo}>Crime Report<Text style={styles.logoSub}> App</Text></Text>
<Text style={styles.subtitle}>Enter your new password</Text>
<View style={styles.form}>
  <View style={{position: 'relative'}} >
  <TextInput
  style={styles.input}
  placeholder="New Password"
  placeholderTextColor="#777"
  secureTextEntry={!showPassword0}
  value={password}
  onChangeText={paswordValue}/>
<Pressable
  onPress={() => setShowPassword0(!showPassword0)}
  style={styles.eyeIcon}>
<Ionicons
  name={showPassword0 ? 'eye-off-outline' : 'eye-outline'}
  size={22}
  color="#fff"/>
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
  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
  size={22}
  color="#fff"/>
</Pressable>
</View>
<TouchableOpacity style={styles.button} onPress={handlenewPassword}>
<Text style={styles.buttonText}>Reset Password</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
<Ionicons name="arrow-back" size={20} color="#4F46E5" />
<Text style={styles.backText}>Back</Text>
</TouchableOpacity>
</View>
</View>
</Modal>
{/* ..................................modal two ends..................... */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // same as Dashboard/Register
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
    color: '#777', // dark text
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
    backgroundColor: '#FFF', // white inputs
    color: '#1F2937', // text color
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light border
    fontSize: 16,
    fontFamily: 'System', // keep system font for input readability
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
    color: '#4F46E5', // primary accent
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
    color: '#FFF',
  },
});
