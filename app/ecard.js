import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Text, Image, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { triggerLocalNotification } from '../utils/notifications';
import { BASE_URL } from '../utils/config';
import { getItem } from '../utils/storage';
import { reverseGeocode } from "../utils/reverse";
import { useLocalSearchParams } from 'expo-router';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const VCard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState('');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Responsive card width - use 90% of screen width with max limit
  const cardWidth = Math.min(windowWidth * 0.92, 400);

  const params = useLocalSearchParams();
  const token = params.s; 
  const id = token ? atob(token) : null;

  // Filter out unwanted fields from display (but keep photoUri for profile image)
  const filterCardData = (data) => {
    if (!data) return null;
    
    const filtered = { ...data };
    const unwantedFields = [
      'id', 'created_at', 'updated_at', '_id', 'userId', 'vcardId',
      'user', 'createdAt', 'updatedAt', 'user_id'
    ];
    
    unwantedFields.forEach(field => {
      delete filtered[field];
    });
    
    // Also filter out unwanted fields from nested objects
    if (filtered.socials) {
      const filteredSocials = { ...filtered.socials };
      unwantedFields.forEach(field => {
        delete filteredSocials[field];
      });
      filtered.socials = filteredSocials;
    }
    
    return filtered;
  };

  // Track scan details
  const logScannerDetails = async (vcardId) => {
    let coords = null;

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            resolve();
          },
          (err) => {
            console.error('Geolocation denied or failed', err);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    }

    if (!coords) {
      try {
        const res = await fetch('https://ipapi.co/json');
        const data = await res.json();
        coords = { latitude: data.latitude, longitude: data.longitude };
      } catch (err) {
        console.error('IP-based location failed', err);
      }
    }

    const deviceInfo = {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
    };
    
    const { city, country } = await reverseGeocode(coords.latitude,coords.longitude);
    
    try {
      await fetch(`${BASE_URL}/charm/track/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vcardId,
          location: coords,
          device: deviceInfo,
          city,
          country,
        }),
      });
    } catch (err) {
      console.error('Error logging scan:', err);
    }
  };

  // Fetch vCard data
  const fetchVCard = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${BASE_URL}/charm/savedCards/${id}`);
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterCardData(data.vcards[0]);
        setCardData(filteredData);
        logScannerDetails(data.vcards[0]?.id);
      } else {
        triggerLocalNotification('Error', 'Failed to fetch vCard.');
      }
    } catch (err) {
      console.error('Error fetching vCard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVCard();
  }, [id]);

  const handleImagePress = () => {
    const imageUri = `${BASE_URL}${cardData?.photoUri}`;
    if (imageUri) {
      setModalImageUri(imageUri);
      setModalVisible(true);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    triggerLocalNotification('Copied', 'Text copied to clipboard!');
  };

  // Generate vCard file content
  const generateVCardContent = () => {
    if (!cardData) return '';

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:2.0.8',
      `FULLNAME:${cardData.name || ''}`,
      `TITLE:${cardData.title || ''}`,
    ];

    // Add phones
    cardData.phones?.forEach(phone => {
      vcard.push(`TEL:${phone}`);
    });

    // Add emails
    cardData.emails?.forEach(email => {
      vcard.push(`EMAIL:${email}`);
    });

    // Add socials
    if (cardData.socials) {
      Object.entries(cardData.socials).forEach(([platform, url]) => {
        if (url) {
          vcard.push(`URL;TYPE=${platform.toUpperCase()}:${url}`);
        }
      });
    }

    // Add other links
    cardData.otherLinks?.forEach(link => {
      vcard.push(`URL:${link}`);
    });

    vcard.push('END:VCARD');
    return vcard.join('\n');
  };

  // Save vCard as file
  const handleSave = () => {
    const vcardContent = generateVCardContent();
    if (!vcardContent) {
      triggerLocalNotification('Error', 'No contact data to save.');
      return;
    }

    const blob = new Blob([vcardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.name?.replace(/\s+/g, '_') || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerLocalNotification('Success', 'vCard downloaded!');
  };

  // Share vCard link
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${cardData?.name}'s contact card!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${cardData?.name}'s Contact Card`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        triggerLocalNotification('Copied', 'Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        triggerLocalNotification('Copied', 'Link copied to clipboard!');
      }
    }
  };

  // Helper function to render different types of fields
  const renderField = (icon, label, value, isArray = false, href = null) => {
    if (!value || (isArray && value.length === 0)) return null;

    if (isArray) {
      return value.map((item, index) => (
        <TouchableOpacity key={`${label}-${index}`} style={styles.cardLi} onPress={() => href && window.open(item, '_blank')}>
          <View style={styles.cardLiInfo}>
            <Icon name={icon} size={16} color="#0af" />
            <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
              {item}
            </Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopy(item)}>
            <Icon name="copy" size={12} color="#1e293b" />
          </TouchableOpacity>
        </TouchableOpacity>
      ));
    }

    return (
      <TouchableOpacity style={styles.cardLi} onPress={() => href && window.open(value, '_blank')}>
        <View style={styles.cardLiInfo}>
          <Icon name={icon} size={16} color="#0af" />
          <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
            {value}
          </Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopy(value)}>
          <Icon name="copy" size={12} color="#1e293b" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Social media icons mapping
  const socialIcons = {
    whatsapp: 'whatsapp',
    instagram: 'instagram', 
    youtube: 'youtube',
    telegram: 'telegram',
    facebook: 'facebook',
    twitter: 'twitter',
    linkedin: 'linkedin',
    tiktok: 'music', 
    snapchat: 'ghost', 
  };

  const socialColors = {
    whatsapp: '#25D366',
    instagram: '#E1306C',
    youtube: '#FF0000',
    telegram: '#0088cc',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    snapchat: '#FFFC00',
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.linearGradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading contact card...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.linearGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.card, { width: cardWidth }]}>
            
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleImagePress}>
                <Image 
                  source={{ 
                    uri: `${BASE_URL}${cardData?.photoUri}` || 'https://placehold.co/128x128/9CA3AF/FFFFFF?text=JP' 
                  }} 
                  style={styles.profilePic} 
                />
              </TouchableOpacity>
              <View style={styles.nameTitle}>
                <Text style={styles.cardName} numberOfLines={2}>{cardData?.name || 'Your Name'}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{cardData?.title || 'Your Title'}</Text>
                {cardData?.company && (
                  <Text style={styles.cardCompany} numberOfLines={1}>{cardData.company}</Text>
                )}
              </View>
            </View>

            {/* Note/Bio Section */}
            {cardData?.note && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>{cardData.note}</Text>
                </View>
              </View>
            )}

            {/* Phones Section */}
            {cardData?.phones?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Phone Numbers</Text>
                <View style={styles.listContainer}>
                  {cardData.phones.map((phone, index) => 
                    renderField('phone', 'phone', phone, false, `tel:${phone}`)
                  )}
                </View>
              </View>
            )}

            {/* Emails Section */}
            {cardData?.emails?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Email Addresses</Text>
                <View style={styles.listContainer}>
                  {cardData.emails.map((email, index) => 
                    renderField('envelope', 'email', email, false, `mailto:${email}`)
                  )}
                </View>
              </View>
            )}

            {/* Addresses Section */}
            {cardData?.addresses?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Addresses</Text>
                <View style={styles.listContainer}>
                  {cardData.addresses.map((address, index) => 
                    renderField('map-marker-alt', 'address', address)
                  )}
                </View>
              </View>
            )}

            {/* Websites Section */}
            {cardData?.websites?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Websites</Text>
                <View style={styles.listContainer}>
                  {cardData.websites.map((website, index) => 
                    renderField('globe', 'website', website, false, website.startsWith('http') ? website : `https://${website}`)
                  )}
                </View>
              </View>
            )}

            {/* Social Media Section */}
            {cardData?.socials && Object.keys(cardData.socials).some(key => cardData.socials[key]) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Social Media</Text>
                <View style={styles.listContainer}>
                  {Object.entries(cardData.socials).map(([platform, url], index) => {
                    if (!url) return null;
                    const iconName = socialIcons[platform] || 'link';
                    const iconColor = socialColors[platform] || '#0af';
                    
                    return (
                      <TouchableOpacity key={platform} style={styles.cardLi} onPress={() => window.open(url, '_blank')}>
                        <View style={styles.cardLiInfo}>
                          <Icon name={iconName} size={16} color={iconColor} />
                          <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                            {url}
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopy(url)}>
                          <Icon name="copy" size={12} color="#1e293b" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Other Links Section */}
            {cardData?.others?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other Links</Text>
                <View style={styles.listContainer}>
                  {cardData.others.map((link, index) => 
                    renderField('link', 'link', link, false, link.startsWith('http') ? link : `https://${link}`)
                  )}
                </View>
              </View>
            )}

            {/* Custom Fields - Display any other fields that might be in the data */}
            {cardData && Object.entries(cardData).map(([key, value]) => {
              const handledFields = [
                'name', 'title', 'company', 'note', 'avatar', 'profile', 
                'phones', 'emails', 'addresses', 'websites', 'socials', 'others',
                'photoUri'
              ];
              const unwantedFields = [
                'id', 'created_at', 'updated_at', '_id', 'userId', 'vcardId',
                'user', 'createdAt', 'updatedAt', 'user_id'
              ];
              
              if (handledFields.includes(key) || unwantedFields.includes(key) || !value) return null;

              return (
                <View key={key} style={styles.section}>
                  <Text style={styles.sectionTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <View style={styles.listContainer}>
                    {Array.isArray(value) ? (
                      value.map((item, index) => renderField('info-circle', key, item))
                    ) : (
                      renderField('info-circle', key, value)
                    )}
                  </View>
                </View>
              );
            })}

            {/* Actions */}
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.btn} onPress={handleSave}>
                <Icon name="id-card" size={14} color="#1e293b" />
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleShare}>
                <Icon name="share-alt" size={14} color="#1e293b" />
                <Text style={styles.btnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal for profile */}
          <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
              <Image source={{ uri: modalImageUri }} style={styles.modalImage} resizeMode="contain" />
            </TouchableOpacity>
          </Modal>
          
          <Text style={styles.footerText}>NB: Refresh the page if contacts fail to appear</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: { 
    flex: 1,
    minHeight: windowHeight
  },
  safeArea: { 
    flex: 1 
  },
  scrollContainer: { 
    alignItems: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: windowHeight
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 10,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 20, 
    gap: 12 
  },
  profilePic: { 
    borderRadius: 40, 
    width: 80, 
    height: 80, 
    resizeMode: 'cover', 
    borderWidth: 2, 
    borderColor: '#0af' 
  },
  nameTitle: { 
    flex: 1, 
    justifyContent: 'center',
    paddingTop: 5,
  },
  cardName: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#f8fafc', 
    marginBottom: 4,
    lineHeight: 24,
  },
  cardTitle: { 
    fontSize: 14, 
    color: '#a1aab5', 
    marginBottom: 3,
    lineHeight: 18,
  },
  cardCompany: { 
    fontSize: 13, 
    color: '#0af', 
    fontStyle: 'italic',
    lineHeight: 16,
  },
  section: { 
    marginBottom: 18 
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#0af', 
    marginBottom: 8,
    paddingLeft: 4,
  },
  listContainer: { 
    marginBottom: 0 
  },
  cardLi: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)',
    minHeight: 44,
  },
  cardLiInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    flex: 1,
    paddingRight: 8,
  },
  linkText: { 
    color: '#f8fafc', 
    fontSize: 14, 
    flexShrink: 1,
    flex: 1,
  },
  copyBtn: { 
    padding: 5, 
    borderRadius: 5, 
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 30,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  btnGroup: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 20 
  },
  btn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    backgroundColor: '#0af', 
    borderRadius: 8, 
    paddingVertical: 10,
    minHeight: 44,
  },
  btnText: { 
    fontSize: 14, 
    color: '#1e293b', 
    fontWeight: 'bold' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  modalImage: { 
    width: '100%', 
    height: '80%', 
    borderRadius: 10 
  },
  footerText: { 
    color: '#a1aab5', 
    fontSize: 11, 
    marginTop: 12, 
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});

export default VCard;