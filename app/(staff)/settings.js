import {useEffect} from "react";
import {SafeAreaView,ScrollView,View,Text,StyleSheet,TouchableOpacity,} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import {removeItem, getItem} from '../../utils/storage';
import {BASE_URL} from '../../utils/config';

const Settings = () => {
  const router = useRouter();
    const fetchUser = async () => {
    try {
      const token = await getItem('token');
      const res = await fetch(`${BASE_URL}/charm/me`, {
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error('Failed to load user info');
      const data = await res.json();
        const agility= data.agility;
        if(agility !== 'staff'){
          triggerLocalNotification('Failed!','Access Denied');
          removeItem('token'); 
          router.replace('/');  
        }
        } catch (err) {
      console.error(err.message || String(err));
    }
  };

    useEffect(() => {
    fetchUser();
    }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={28} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings & Management</Text>
        </View>

        {/* Account Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/editprofile")}>
            <Text style={styles.rowText}>Update Profile</Text>
            <Icon name="chevron-right" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/updatepassword")}>
            <Text style={styles.rowText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/logout")}>
            <Text style={[styles.rowText, { color: "#EF4444" }]}>Logout</Text>
            <Icon name="sign-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

            {/* User Management  */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Management</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/users")}>
            <Text style={styles.rowText}>View Users</Text>
            <Icon name="users" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/managevcard")}>
            <Text style={styles.rowText}>View All cards</Text>
            <Icon name="id-card-o" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>App Version</Text>
            <Text style={[styles.rowText, { color: "#6B7280" }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  container: { 
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 50,
    maxWidth: 600, // Maximum width for large screens
    alignSelf: 'center', // Center the container on large screens
    width: '100%', // Take full width on small screens
  },

  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginLeft: 15 
  },

  card: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%', // Ensure card takes full width of container
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginBottom: 10 
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  rowText: { 
    fontSize: 16, 
    color: "#1F2937" 
  },
});

export default Settings;
