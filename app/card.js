import { useState, useEffect, useCallback, useReducer } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { pickFile } from '../utils/filepicker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { triggerLocalNotification } from '../utils/notifications';
import { BASE_URL } from '../utils/config';
import { getItem } from '../utils/storage';
import QRModal from '../utils/qrcode';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const isTabletOrLargeScreen = windowWidth >= 768;
const isSmallScreen = windowWidth < 375; 

// Constants for better maintainability
const CONSTANTS = {
  MAX_PHONES: 5,
  MAX_EMAILS: 5,
  MAX_LINKS: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};



// Form reducer for better state management
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_SOCIAL':
      return {
        ...state,
        socials: { ...state.socials, [action.field]: action.value },
      };
    case 'ADD_FIELD':
      return {
        ...state,
        [action.field]: [...state[action.field], ''],
      };
    case 'REMOVE_FIELD':
      return {
        ...state,
        [action.field]: state[action.field].filter((_, i) => i !== action.index),
      };
    case 'UPDATE_ARRAY_FIELD':
      const newArray = [...state[action.field]];
      newArray[action.index] = action.value;
      return { ...state, [action.field]: newArray };
    case 'RESET_FORM':
      return initialState;
    case 'SET_EDIT_DATA':
      return {
        ...initialState,
        ...action.data,
        fileUri: action.data.photoUri ? `${BASE_URL}${action.data.photoUri}` : '',
        file: null,
      };
    case 'SET_FILE':
      return {
        ...state,
        file: action.file,
        fileUri: action.fileUri,
      };
    default:
      return state;
  }
};

const initialState = {
  name: '',
  title: '',
  phones: [''],
  emails: [''],
  socials: {
    whatsapp: '',
    instagram: '',
    youtube: '',
    telegram: '',
  },
  otherLinks: [''],
  file: null,
  fileUri: '',
};

// API service functions
const vCardAPI = {
  save: async (formData, token) => {
    const response = await fetch(`${BASE_URL}/charm/saveCard`, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData,
    });
    return response;
  },

  update: async (id, formData, token) => {
    const response = await fetch(`${BASE_URL}/charm/updateCard/${id}`, {
      method: 'PUT',
      headers: { Authorization: token },
      body: formData,
    });
    return response;
  },

  delete: async (id, token) => {
    const response = await fetch(`${BASE_URL}/charm/deleteCard/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    return response;
  },

  fetchAll: async (token) => {
    const response = await fetch(`${BASE_URL}/charm/savedCard`, {
      headers: { Authorization: token },
    });
    return response;
  },
};

// Reusable ContactFieldGroup component
const ContactFieldGroup = ({
  fieldName,
  placeholder,
  icon,
  type = 'text',
  formState,
  onUpdate,
  onRemove,
  onAdd,
  maxFields,
}) => {
  const currentCount = formState[fieldName].length;
  const isMaxReached = currentCount >= maxFields;
  
  return (
    <View>
      <View style={styles.addButtonContainer}>
        <View>
          <Text style={styles.label}>{placeholder}</Text>
          <Text style={styles.fieldCount}>
            {currentCount}/{maxFields} added
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onAdd(fieldName, maxFields)}
          style={[styles.addButton, isMaxReached && styles.addButtonDisabled]}
          disabled={isMaxReached}
        >
          <Icon 
            name="plus" 
            size={isSmallScreen ? 10 : 12} 
            color={isMaxReached ? "#9ca3af" : "#6b7280"} 
            style={{ marginRight: 4 }} 
          />
          <Text style={[styles.addButtonText, isMaxReached && styles.addButtonTextDisabled]}>
            Add More
          </Text>
        </TouchableOpacity>
      </View>
      {formState[fieldName].map((value, index) => (
        <View key={`${fieldName}-${index}`} style={styles.inputGroup}>
          <View style={styles.inputGroupText}>
            <Icon name={icon} size={isSmallScreen ? 16 : 20} color="#6b7280" />
          </View>
          <TextInput
            style={styles.inputGroupInput}
            placeholder={`${placeholder} ${index + 1}`}
            placeholderTextColor="#9ca3af"
            value={value}
            onChangeText={(text) => onUpdate(fieldName, index, text)}
            keyboardType={type}
          />
          {formState[fieldName].length > 1 && (
            <TouchableOpacity
              onPress={() => onRemove(fieldName, index)}
              style={{ marginLeft: 8 }}
            >
              <Icon name="times-circle" size={isSmallScreen ? 20 : 24} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {isMaxReached && (
        <Text style={styles.maxLimitText}>
          Maximum limit of {maxFields} reached
        </Text>
      )}
    </View>
  );
};

const generateVcardContent = (cardData) => {
  let vcf = `BEGIN:VCARD\nVERSION:2.0.8\nFN:${cardData.name}\n`;
  if (cardData.title) vcf += `TITLE:${cardData.title}\n`;
  cardData.phones.forEach((p) => p.trim() && (vcf += `TEL;TYPE=CELL:${p}\n`));
  cardData.emails.forEach((e) => e.trim() && (vcf += `EMAIL;TYPE=INTERNET:${e}\n`));
  if (cardData.socials.whatsapp.trim())
    vcf += `URL;TYPE=WhatsApp:https://wa.me/${cardData.socials.whatsapp}\n`;
  if (cardData.socials.instagram.trim())
    vcf += `URL;TYPE=Instagram:${cardData.socials.instagram}\n`;
  if (cardData.socials.youtube.trim())
    vcf += `URL;TYPE=YouTube:${cardData.socials.youtube}\n`;
  if (cardData.socials.telegram.trim())
    vcf += `URL;TYPE=Telegram:https://t.me/${cardData.socials.telegram}\n`;
  cardData.otherLinks.forEach((l) => l.trim() && (vcf += `URL:${l}\n`));
  vcf += 'END:VCARD';
  return vcf;
};

const App = () => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [savedCards, setSavedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [activeTab, setActiveTab] = useState('form');
  const [hasToken, setHasToken] = useState(false);
  const [userBillsStatus, setUserBillsStatus] = useState(null);
  const router = useRouter();
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrValue, setQrCodeContent] = useState('');
  const [qrCardName, setQrCardName] = useState('');
  const [qrCardId, setQrCardId] = useState('');

  // Handler functions
  const handleInputChange = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const handleSocialsChange = (platform, value) => {
    dispatch({ type: 'UPDATE_SOCIAL', field: platform, value });
  };

  const handleArrayFieldUpdate = (fieldName, index, value) => {
    dispatch({ type: 'UPDATE_ARRAY_FIELD', field: fieldName, index, value });
  };

  const handleArrayFieldRemove = (fieldName, index) => {
    dispatch({ type: 'REMOVE_FIELD', field: fieldName, index });
  };

  const handleArrayFieldAdd = (fieldName, maxFields) => {
    const currentCount = formState[fieldName].length;
    
    if (currentCount >= maxFields) {
      const fieldDisplayName = fieldName === 'phones' ? 'phone numbers' : 
                              fieldName === 'emails' ? 'email addresses' : 
                              'links';
      triggerLocalNotification('Limit Reached', `You can only add up to ${maxFields} ${fieldDisplayName}.`);
      return;
    }
    
    dispatch({ type: 'ADD_FIELD', field: fieldName, max: maxFields });
  };

  const setFile = (file, fileUri) => {
    dispatch({ type: 'SET_FILE', file, fileUri });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    setEditingKey(null);
  };

  // Add this function to check bill status
  const checkUserBillsStatus = useCallback(async () => {
    try {
      const token = await getItem('token');
      if (!token) {
        setUserBillsStatus(null);
        return;
      }

      const response = await fetch(`${BASE_URL}/charm/me`, {
        headers: { Authorization: token },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserBillsStatus(userData.bills);
      } else {
        setUserBillsStatus(null);
      }
    } catch (error) {
      console.error('Error checking bill status:', error);
      setUserBillsStatus(null);
    }
  }, []);

  // Update the checkAuthentication function
  const checkAuthentication = useCallback(async () => {
    try {
      const token = await getItem('token');
      const authenticated = !!token;
      setHasToken(authenticated);
      
      if (authenticated) {
        await checkUserBillsStatus();
      } else {
        setUserBillsStatus(null);
      }
      
      return authenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setHasToken(false);
      setUserBillsStatus(null);
      return false;
    }
  }, [checkUserBillsStatus]);

  // Add this helper function to check if user can access card features
  const canAccessCardFeatures = useCallback(() => {
    if (!hasToken) {
      return true; // Unauthenticated users can still preview
    }
    
    // Authenticated users with suspended or unpaid bills cannot access
    if (userBillsStatus === 'suspended' || userBillsStatus === 'not paid') {
      return false;
    }
    
    return true;
  }, [hasToken, userBillsStatus]);

  // Load saved cards with proper error handling
  const loadSavedCards = useCallback(async () => {
    try {
      const token = await getItem('token');
      
      // If no token, user is not logged in - this is normal for new users
      if (!token) {
        setHasToken(false);
        setUserBillsStatus(null); // Reset bill status
        setSavedCards([]);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      setHasToken(true);
      
      // Fetch user data to get bill status
      const userResponse = await fetch(`${BASE_URL}/charm/me`, {
        headers: { Authorization: token },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserBillsStatus(userData.bills);
      }
      
      const response = await vCardAPI.fetchAll(token);
      
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.vcards || []);
      } else if (response.status === 401) {
        // Token is invalid or expired
        setHasToken(false);
        setUserBillsStatus(null);
        setSavedCards([]);
        triggerLocalNotification('Oops!', 'Please Sign In to access your vCards.');
      } else {
        console.error('Failed to fetch saved vCards:', response.status);
        triggerLocalNotification('Error', 'Failed to load saved cards. Please try again.');
      }
    } catch (e) {
      console.error('Network error fetching vCards:', e);
      // Don't show error for network issues - just show empty state
      setSavedCards([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load and permissions
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isMounted) {
        await checkAuthentication();
        await loadSavedCards();
        await requestMediaLibraryPermissions();
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [loadSavedCards, checkAuthentication]);

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        triggerLocalNotification(
          'Permission Required',
          'Camera and Media Library permissions are needed to select and take photos.'
        );
      }
    }
  };

  // File handling
  const pickImage = async () => {
    try {
      const selectedFile = await pickFile();
      if (selectedFile) {
        if (selectedFile.size > CONSTANTS.MAX_FILE_SIZE) {
          triggerLocalNotification('File Too Large', 'Please select a file under 10MB.');
          return;
        }
        setFile(selectedFile.file, selectedFile.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      triggerLocalNotification('Error', 'Failed to select image.');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const photo = result.assets[0];
        setFile(
          { uri: photo.uri, name: 'photo.jpg', type: 'image/jpeg' },
          photo.uri
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      triggerLocalNotification('Error', 'Failed to take photo.');
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formState.name.trim()) {
      triggerLocalNotification('Failed', 'Name is required.');
      return false;
    }

    const hasValidPhones = formState.phones.some(phone => phone.trim());
    const hasValidEmails = formState.emails.some(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email.trim() && emailRegex.test(email);
    });

    if (!hasValidPhones && !hasValidEmails) {
      triggerLocalNotification('Failed', 'At least one phone number or valid email is required.');
      return false;
    }

    return true;
  };

  // Handle save with authentication and bill status check
  const handleSave = async () => {
    if (!validateForm()) return;

    // Check authentication before saving
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      triggerLocalNotification(
        'Login Required', 
        'Please log in to save your vCard. You can still preview and test the form without an account.'
      );
      return;
    }

    // Check bill status for authenticated users
    if (!canAccessCardFeatures()) {
      triggerLocalNotification(
        'Access Denied', 
        'Please settle your bills to create new vCards.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getItem('token');
      const formData = new FormData();
      
      formData.append('name', formState.name);
      formData.append('title', formState.title);
      formData.append('phones', JSON.stringify(formState.phones));
      formData.append('emails', JSON.stringify(formState.emails));
      formData.append('socials', JSON.stringify(formState.socials));
      formData.append('otherLinks', JSON.stringify(formState.otherLinks));
      
      if (formState.file) {
        formData.append('file', formState.file);
      }

      const response = await vCardAPI.save(formData, token);
      
      if (response.ok) {
        triggerLocalNotification('Success', 'vCard Saved Successfully!');
        loadSavedCards();
        resetForm();
        if (!isTabletOrLargeScreen) setActiveTab('cards');
      } else if (response.status === 401) {
        triggerLocalNotification('Oops!', 'Please Sign In to save your vCard.');
        setHasToken(false);
      } else {
        triggerLocalNotification('Failed', 'vCard Not Saved! Please try again.');
      }
    } catch (e) {
      console.error('Failed to save vCard', e);
      triggerLocalNotification('Error', 'Failed to save vCard. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      triggerLocalNotification('Login Required', 'Please log in to update your vCard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getItem('token');
      const formData = new FormData();
      
      formData.append('name', formState.name);
      formData.append('title', formState.title);
      formData.append('phones', JSON.stringify(formState.phones));
      formData.append('emails', JSON.stringify(formState.emails));
      formData.append('socials', JSON.stringify(formState.socials));
      formData.append('otherLinks', JSON.stringify(formState.otherLinks));
      
      if (formState.file) {
        formData.append('file', formState.file);
      }

      const response = await vCardAPI.update(editingKey, formData, token);
      
      if (response.ok) {
        triggerLocalNotification('Success', 'Card updated successfully');
        loadSavedCards();
        resetForm();
      } else if (response.status === 401) {
        triggerLocalNotification('Oops!', 'Please Sign In to update your vCard.');
        setHasToken(false);
      } else {
        const errorData = await response.json();
        triggerLocalNotification('Error', errorData.message || 'Failed to update card');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      triggerLocalNotification('Error', 'An error occurred while updating the card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = () => {
    if (editingKey) {
      handleUpdate();
    } else {
      handleSave();
    }
  };

  const handleClearForm = () => {
    triggerLocalNotification(
      'Confirm Clear',
      'Are you sure you want to clear the current form?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: resetForm, style: 'destructive' },
      ]
    );
  };

  // Card actions with authentication check
  const handleEdit = useCallback(async (card) => {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      triggerLocalNotification('Login Required', 'Please log in to edit your vCard.');
      return;
    }

    // Check bill status for editing
    if (!canAccessCardFeatures()) {
      triggerLocalNotification('Access Denied', 'Please settle your bills to edit vCards.');
      return;
    }

    dispatch({ type: 'SET_EDIT_DATA', data: card });
    setEditingKey(card.id);
    if (!isTabletOrLargeScreen) setActiveTab('form');
  }, [checkAuthentication, canAccessCardFeatures]);

  const handleDelete = async (card) => {
    try {
      const token = await getItem('token');
      if (!token) {
        triggerLocalNotification('Login Required', 'Please log in to delete your vCard.');
        return;
      }

      const response = await vCardAPI.delete(card.id, token);
      
      if (response.ok) {
        triggerLocalNotification('Deleted', 'vCard has been removed.');
        loadSavedCards();
      } else if (response.status === 401) {
        triggerLocalNotification('Oops!', 'Please Sign In to delete your vCard.');
        setHasToken(false);
      } else {
        triggerLocalNotification('Error', 'Failed to delete vCard.');
      }
    } catch (e) {
      console.error('Failed to delete vCard', e);
      triggerLocalNotification('Error', 'Failed to delete vCard.');
    }
  };

  const handleDeleteConfirm = (card) => {
    triggerLocalNotification(
      'Confirm Deletion',
      `Are you sure you want to delete the vCard for ${card.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDelete(card), style: 'destructive' },
      ]
    );
  };

  const handleDownloadVcard = async (cardData) => {
    try {
      const vcfContent = generateVcardContent(cardData);
      const filename = `${cardData.name.replace(/\s/g, '_') || 'contact'}.vcf`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerLocalNotification('Download Started', 'Your vCard file is downloading.');
      } else {
        if (await Sharing.isAvailableAsync()) {
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(fileUri, vcfContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/vcard',
            UTI: 'com.apple.contact.vcard',
            dialogTitle: `Share ${cardData.name}'s vCard`,
          });
        } else {
          triggerLocalNotification('Sharing not available', 'File sharing is not supported on this device.');
        }
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      triggerLocalNotification('Error', 'Failed to share the vCard.');
    }
  };

  const handleShowQrCode = (cardData) => {
    const id = cardData.id;
    const s = btoa(id);
    const qrPath = `/ecard?s=${s}`; 
    setQrCodeContent(qrPath); 
    setQrCardName(cardData.name); 
    setQrCardId(cardData.id);
    setQrCodeVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedCards();
  }, [loadSavedCards]);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleSignupRedirect = () => {
    router.push('/register');
  };


// Render functions
const renderContactFields = (fieldName, placeholder, icon, type = 'text') => {

  const maxFieldsMap = {
    'phones': CONSTANTS.MAX_PHONES,
    'emails': CONSTANTS.MAX_EMAILS,
    'otherLinks': CONSTANTS.MAX_LINKS
  };
  
  const maxFields = maxFieldsMap[fieldName];
  
  return (
    <ContactFieldGroup
      fieldName={fieldName}
      placeholder={placeholder}
      icon={icon}
      type={type}
      formState={formState}
      onUpdate={handleArrayFieldUpdate}
      onRemove={handleArrayFieldRemove}
      onAdd={handleArrayFieldAdd}
      maxFields={maxFields}
    />
  );
};

  const renderSocialField = (platform, icon, color, placeholder) => (
    <View style={styles.inputGroup}>
      <View style={styles.inputGroupText}>
        <Icon name={icon} size={isSmallScreen ? 16 : 20} color={color} />
      </View>
      <TextInput
        style={styles.inputGroupInput}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={formState.socials[platform]}
        onChangeText={(text) => handleSocialsChange(platform, text)}
      />
    </View>
  );

  // Tab navigation for small screens
  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'form' && styles.activeTab]}
        onPress={() => setActiveTab('form')}
      >
        <Icon name="edit" size={16} color={activeTab === 'form' ? '#fff' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>
          Create vCard
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
        onPress={() => setActiveTab('cards')}
      >
        <Icon name="list" size={16} color={activeTab === 'cards' ? '#fff' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
          My Cards ({savedCards.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Welcome message for new/unauthenticated users
  const renderWelcomeMessage = () => (
    <View style={styles.welcomeCard}>
      <Icon name="rocket" size={48} color="#4f46e5" />
      <Text style={styles.welcomeTitle}>Welcome to vCard Creator!</Text>
      <Text style={styles.welcomeText}>
        Create amazing digital business cards. You can preview your vCard without an account, 
        but you'll need to log in to save and manage your cards.
      </Text>
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginRedirect}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignupRedirect}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormSection = () => (
    <ScrollView contentContainerStyle={styles.columnScrollContent} showsVerticalScrollIndicator={false}>
      {/* Show welcome message for unauthenticated users */}
      {!hasToken && renderWelcomeMessage()}
      
      <View style={styles.cardWhite}>
        <Text style={styles.cardTitle}>
          {hasToken ? 'Create Your vCard' : 'Try vCard Creator'}
        </Text>
        
        {/* Authentication status indicator */}
        {!hasToken && (
          <View style={styles.authStatus}>
            <Icon name="info-circle" size={16} color="#f59e0b" />
            <Text style={styles.authStatusText}>
              Preview mode - Log in to save your vCard
            </Text>
          </View>
        )}

        {/* Add Bill Status Warning */}
        {hasToken && !canAccessCardFeatures() && (
          <View style={styles.billWarning}>
            <Icon name="warning" size={16} color="#dc3545" />
            <Text style={styles.billWarningText}>
              Your account has billing issues. Please settle your bills to create new vCards.
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Full Name"
            placeholderTextColor="#9ca3af"
            value={formState.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        </View>

        <View>
          <Text style={styles.label}>Job Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g: Accountant, IT Officer"
            placeholderTextColor="#9ca3af"
            value={formState.title}
            onChangeText={(text) => handleInputChange('title', text)}
          />
        </View>

        {renderContactFields('phones', 'Phone Number(s)', 'phone', 'phone-pad')}
        {renderContactFields('emails', 'Email(s)', 'envelope', 'email-address')}

        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Social & Messaging</Text>
          {renderSocialField('whatsapp', 'whatsapp', '#25D366', 'WhatsApp Number')}
          {renderSocialField('instagram', 'instagram', '#c13584', 'Instagram Profile URL')}
          {renderSocialField('youtube', 'youtube', '#ff0000', 'YouTube Channel URL')}
          {renderSocialField('telegram', 'telegram', '#0088cc', 'Telegram Username')}
        </View>

        {renderContactFields('otherLinks', 'Other Links', 'link')}

        <View style={{ marginTop: 16, marginBottom: 16 }}>
          <Text style={styles.label}>Profile Photo</Text>
          <View style={styles.photoUploadContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Icon name="image" size={isSmallScreen ? 16 : 20} color={Colors.buttonMain} />
              <Text style={styles.photoButtonText}>Gallery</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Icon name="camera" size={isSmallScreen ? 16 : 20} color={Colors.buttonMain} />
                <Text style={styles.photoButtonText}>Camera</Text>
              </TouchableOpacity>
            )}
          </View>
          {formState.fileUri ? (
            <Image source={{ uri: formState.fileUri }} style={styles.selectedPhotoPreview} />
          ) : (
            <Text style={styles.noPhotoText}>No photo selected</Text>
          )}
        </View>

        <View style={styles.formButtonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, styles.clearButton]}
            onPress={handleClearForm}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              !canAccessCardFeatures() && styles.submitButtonDisabled
            ]}
            onPress={handleFormSubmit}
            disabled={isSubmitting || !canAccessCardFeatures()}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {hasToken ? 
                  (canAccessCardFeatures() ? 
                    (editingKey !== null ? 'Update' : 'Save') : 
                    'Bill Issue') : 
                  'Preview & Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Card - Only show on larger screens, hidden on small screens to save space */}
      {!isSmallScreen && (
        <View style={styles.previewCardContainer}>
          <LinearGradient
            colors={['#1e3a8a', '#7c3aed']}
            style={styles.previewCardInner}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          >
            <View style={styles.previewHeader}>
              <Image
                source={{
                  uri: formState.fileUri || 'https://placehold.co/128x128/9CA3AF/FFFFFF?text=JP',
                }}
                style={styles.profilePic}
              />
              <View style={styles.previewHeaderContent}>
                <Text style={styles.previewName}>{formState.name || 'Full Name'}</Text>
                <Text style={styles.previewTitle}>{formState.title || 'Job Title'}</Text>
              </View>
            </View>

            <View style={styles.previewContactList}>
              {formState.phones.map(
                (p, i) =>
                  p.trim() && (
                    <View key={`phone-${i}`} style={styles.contactItem}>
                      <Icon name="phone" size={isSmallScreen ? 14 : 18} color="#fff" />
                      <Text style={styles.contactText}>{p}</Text>
                    </View>
                  )
              )}
              {formState.emails.map(
                (e, i) =>
                  e.trim() && (
                    <View key={`email-${i}`} style={styles.contactItem}>
                      <Icon name="envelope" size={isSmallScreen ? 14 : 18} color="#fff" />
                      <Text style={styles.contactText}>{e}</Text>
                    </View>
                  )
              )}
              {formState.otherLinks.map(
                (l, i) =>
                  l.trim() && (
                    <View key={`link-${i}`} style={styles.contactItem}>
                      <Icon name="link" size={isSmallScreen ? 14 : 18} color="#fff" />
                      <Text style={styles.contactText}>{l}</Text>
                    </View>
                  )
              )}
            </View>

            <View style={styles.previewContactList}>
              {formState.socials.whatsapp.trim() && (
                <View style={styles.contactItem}>
                  <Icon name="whatsapp" size={isSmallScreen ? 14 : 18} color="#25D366" />
                  <Text style={styles.contactText}>{formState.socials.whatsapp}</Text>
                </View>
              )}
              {formState.socials.instagram.trim() && (
                <View style={styles.contactItem}>
                  <Icon name="instagram" size={isSmallScreen ? 14 : 18} color="#fff" />
                  <Text style={styles.contactText}>{formState.socials.instagram}</Text>
                </View>
              )}
              {formState.socials.youtube.trim() && (
                <View style={styles.contactItem}>
                  <Icon name="youtube" size={isSmallScreen ? 14 : 18} color="#ff0000" />
                  <Text style={styles.contactText}>{formState.socials.youtube}</Text>
                </View>
              )}
              {formState.socials.telegram.trim() && (
                <View style={styles.contactItem}>
                  <Icon name="telegram" size={isSmallScreen ? 14 : 18} color="#0088cc" />
                  <Text style={styles.contactText}>{formState.socials.telegram}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Live Preview</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </ScrollView>
  );

  const renderCardsSection = () => (
    <ScrollView
      contentContainerStyle={styles.columnScrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
      }
      showsVerticalScrollIndicator={false}
    >
      {!hasToken ? (
        <View style={styles.cardWhite}>
          {renderWelcomeMessage()}
        </View>
      ) : (
        <View style={styles.cardWhite}>
          <Text style={styles.cardTitle}>My vCards ({savedCards.length})</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4f46e5" />
          ) : savedCards.length > 0 ? (
            savedCards.map((card) => (
              <View key={card.id} style={styles.savedCardRow}>
                <View style={styles.savedCardContent}>
                  <Text style={styles.savedCardName}>{card.name}</Text>
                  <Text style={styles.savedCardTitle}>{card.title}</Text>
                </View>
                <View style={styles.savedCardActions}>
                  <TouchableOpacity
                    onPress={() => handleDownloadVcard(card)}
                    style={styles.actionButtonIcon}
                  >
                    <Icon name="download" size={isSmallScreen ? 16 : 20} color="#6c757d" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShowQrCode(card)}
                    style={styles.actionButtonIcon}
                  >
                    <Icon name="qrcode" size={isSmallScreen ? 16 : 20} color="#007bff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEdit(card)}
                    style={styles.actionButtonIcon}
                  >
                    <Icon name="edit" size={isSmallScreen ? 16 : 20} color="#ffc107" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteConfirm(card)}
                    style={styles.actionButtonIcon}
                  >
                    <Icon name="trash" size={isSmallScreen ? 16 : 20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="address-card" size={48} color="#9ca3af" />
              <Text style={styles.noCardsText}>No vCards saved yet</Text>
              <Text style={styles.noCardsSubtext}>Create your first vCard to get started</Text>
              <TouchableOpacity 
                style={styles.createFirstButton}
                onPress={() => setActiveTab('form')}
              >
                <Text style={styles.createFirstButtonText}>Create First vCard</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#1f2937', '#111827']}
      style={styles.linearGradient}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          {/* For large screens: Side by side layout */}
          {isTabletOrLargeScreen ? (
            <>
              <View style={styles.column}>
                {renderFormSection()}
              </View>
              <View style={styles.column}>
                {renderCardsSection()}
              </View>
            </>
          ) : (
            /* For small screens: Tab navigation */
            <>
              {renderTabNavigation()}
              <View style={styles.tabContent}>
                {activeTab === 'form' ? renderFormSection() : renderCardsSection()}
              </View>
            </>
          )}
        </View>
        <QRModal visible={qrCodeVisible} onClose={() => setQrCodeVisible(false)} value={qrValue} cardId={qrCardId} cardName={qrCardName} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const Colors = {
  darkBg: '#1f2937',
  gradientStart: '#1e3a8a',
  gradientEnd: '#7c3aed',
  cardBg: '#111827',
  cardWhite: '#ffffff',
  cardBorder: '#4f46e5',
  buttonMain: '#2563eb',
  textLight: '#e5e7eb',
  textDark: '#1f2937',
  placeholder: '#9ca3af',
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: isTabletOrLargeScreen ? 'row' : 'column',
    padding: isTabletOrLargeScreen ? 16 : 0,
    gap: 16,
    alignSelf: 'center',
    maxWidth: isTabletOrLargeScreen ? 1024 : '100%',
    width: '100%',
  },
  column: {
    flex: 1,
  },
  columnScrollContent: {
    flexGrow: 1,
    padding: isTabletOrLargeScreen ? 0 : 16,
    paddingVertical: isSmallScreen ? 12 : 24,
  },
  // Welcome message styles
  welcomeCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    padding: isSmallScreen ? 16 : 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.cardBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  loginButton: {
    flex: 1,
    backgroundColor: Colors.buttonMain,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 14 : 16,
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  signupButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 14 : 16,
  },
  authStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  authStatusText: {
    color: '#92400e',
    marginLeft: 8,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
  },
  billWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  billWarningText: {
    color: '#dc3545',
    marginLeft: 8,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 8 : 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    color: '#6b7280',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  // Card Styles
  cardWhite: {
    backgroundColor: Colors.cardWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    padding: isSmallScreen ? 16 : 24,
    marginBottom: 16,
    shadowColor: Colors.cardBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: isSmallScreen ? 16 : 24,
  },
  label: {
    color: Colors.textDark,
    marginBottom: 4,
    fontWeight: '500',
    fontSize: isSmallScreen ? 14 : 16,
  },
  fieldCount: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#6b7280',
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.cardWhite,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: isSmallScreen ? 10 : 12,
    marginBottom: 12,
    color: Colors.textDark,
    fontSize: isSmallScreen ? 14 : 16,
    shadowColor: Colors.cardBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputGroupText: {
    backgroundColor: '#f1f5f9',
    padding: isSmallScreen ? 10 : 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRightWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroupInput: {
    flex: 1,
    backgroundColor: Colors.cardWhite,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: isSmallScreen ? 10 : 12,
    color: Colors.textDark,
    fontSize: isSmallScreen ? 14 : 16,
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  addButtonDisabled: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  addButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6b7280',
  },
  addButtonTextDisabled: {
    color: '#9ca3af',
  },
  maxLimitText: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  submitButtonText: {
    color: Colors.textLight,
    fontSize: isSmallScreen ? 14 : 18,
    fontWeight: 'bold',
  },
  photoUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
    padding: isSmallScreen ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.buttonMain,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  photoButtonText: {
    color: Colors.buttonMain,
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 12 : 14,
  },
  selectedPhotoPreview: {
    width: isSmallScreen ? 80 : 100,
    height: isSmallScreen ? 80 : 100,
    borderRadius: isSmallScreen ? 40 : 50,
    marginTop: 10,
    alignSelf: 'center',
    borderColor: Colors.cardBorder,
    borderWidth: 2,
  },
  noPhotoText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 10,
    fontSize: isSmallScreen ? 12 : 14,
  },
  previewCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.cardBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 16,
  },
  previewCardInner: {
    padding: isSmallScreen ? 16 : 24,
  },
  profilePic: {
    width: isSmallScreen ? 60 : 80,
    height: isSmallScreen ? 60 : 80,
    borderRadius: isSmallScreen ? 30 : 40,
    borderWidth: 4,
    borderColor: '#d1d5db',
    backgroundColor: '#4f46e5',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewHeaderContent: {
    marginLeft: 12,
  },
  previewName: {
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  previewTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#d1d5db',
  },
  previewContactList: {
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  contactText: {
    color: Colors.textLight,
    marginLeft: 8,
    fontSize: isSmallScreen ? 12 : 16,
    flexShrink: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 12 : 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  savedCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedCardContent: {
    flex: 1,
    marginRight: 8,
  },
  savedCardName: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  savedCardTitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6c757d',
    marginTop: 2,
  },
  savedCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonIcon: {
    padding: 2,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCardsText: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: isSmallScreen ? 16 : 18,
    marginTop: 12,
    fontWeight: '600',
  },
  noCardsSubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: isSmallScreen ? 12 : 14,
    marginTop: 4,
  },
  createFirstButton: {
    backgroundColor: Colors.buttonMain,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  createFirstButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 14 : 16,
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: Colors.buttonMain,
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
});

export default App;