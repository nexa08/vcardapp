import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// === THEME CONSTANTS ===
const THEME = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  secondary: "#10B981",
  secondaryLight: "#D1FAE5",
  accent: "#F59E0B",
  accentLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    light: "#9CA3AF",
    inverse: "#FFFFFF"
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    card: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)"
  },
  border: {
    light: "#E5E7EB",
    medium: "#D1D5DB"
  }
};

const QRModal = ({ visible, onClose,cardName, cardId }) => {
  const qrRef = useRef();
  const BASE_PUBLIC_URL = 'https://nexatheiconn.netlify.app';
  //  const BASE_PUBLIC_URL = 'http://127.0.0.1:3000';
  const s = btoa(cardId);
  const qrValue = `${BASE_PUBLIC_URL}/ecard?s=${s}`;

  const [qrColor, setQrColor] = useState('#1e3a8a');
  const [backgroundColor, setBackgroundColor] = useState(THEME.background.primary);
  const [fileType, setFileType] = useState('png');

  const animation = useRef(new Animated.Value(0)).current;

  // Color options using your recommended mixed colors
  const colorOptions = [
    { name: 'Navy Blue', value: '#1e3a8a' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Primary', value: THEME.primary },
    { name: 'Secondary', value: THEME.secondary },
    { name: 'Accent', value: THEME.accent },
    { name: 'Danger', value: THEME.danger },
    { name: 'Dark', value: THEME.text.primary },
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Pink', value: '#EC4899' },
  ];

  // QR Preview animation
  React.useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, { toValue: 1,   tension: 50,friction: 7,duration: 1500, useNativeDriver: true }),
          Animated.timing(animation, { toValue: 0, duration: 1500,  tension: 50,friction: 7, useNativeDriver: true }),
        ])
      ).start();
    } else {
      animation.setValue(0);
    }
  }, [visible]);

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
     
    qrRef.current.toDataURL((dataUrl) => {
      // const filename = `scanme_qr.${fileType}`;
       const filename = `${cardName}.${fileType}`;
      const img = new Image();
      img.src = `data:image/png;base64,${dataUrl}`;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = 400;
        const height = 480;
        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // QR
        const qrSize = 260;
        const x = (width - qrSize) / 2;
        const y = 100;
        ctx.drawImage(img, x, y, qrSize, qrSize);
      
        // Header
        ctx.fillStyle = '#222';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Scan Me', width / 2, 60);
        
        // Footer
        ctx.font = '14px monospace';
        ctx.fillStyle = '#555';
        ctx.fillText(`Get Yours Today On ${BASE_PUBLIC_URL}`, width / 2, height - 40);

        canvas.toBlob((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, `image/${fileType}`);
      };
    });
  };

  const renderColorOption = (color) => (
    <TouchableOpacity
      key={color.value}
      style={[
        styles.colorOption,
        { backgroundColor: color.value },
        qrColor === color.value && styles.colorOptionSelected,
      ]}
      onPress={() => setQrColor(color.value)}
    >
      {qrColor === color.value && (
        <Icon name="checkmark" size={16} color="#FFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scan Me</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={THEME.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Animated QR Preview */}
            <View style={styles.qrContainer}>
              <Animated.View
                style={{
                  marginBottom: 10,
                  transform: [{ scale: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
                }}
              >
                <QRCode
                  value={qrValue}
                  size={220}
                  color={qrColor}
                  backgroundColor="white"
                  getRef={qrRef}
                />
              </Animated.View>
            </View>

            {/* QR Color Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QR Color:</Text>
              <View style={styles.colorGrid}>
                {colorOptions.map(renderColorOption)}
              </View>
            </View>

            {/* Background Color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Background:</Text>
              <View style={styles.backgroundOptions}>
                <TouchableOpacity
                  style={[
                    styles.bgOption,
                    { backgroundColor: THEME.background.primary },
                    backgroundColor === THEME.background.primary && styles.bgOptionSelected,
                  ]}
                  onPress={() => setBackgroundColor(THEME.background.primary)}
                >
                  {backgroundColor === THEME.background.primary && (
                    <Icon name="checkmark" size={16} color={THEME.text.primary} />
                  )}
                  <Text style={styles.bgOptionText}>White</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.bgOption,
                    { backgroundColor: THEME.background.secondary },
                    backgroundColor === THEME.background.secondary && styles.bgOptionSelected,
                  ]}
                  onPress={() => setBackgroundColor(THEME.background.secondary)}
                >
                  {backgroundColor === THEME.background.secondary && (
                    <Icon name="checkmark" size={16} color={THEME.text.primary} />
                  )}
                  <Text style={styles.bgOptionText}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.bgOption,
                    { backgroundColor: THEME.primaryLight },
                    backgroundColor === THEME.primaryLight && styles.bgOptionSelected,
                  ]}
                  onPress={() => setBackgroundColor(THEME.primaryLight)}
                >
                  {backgroundColor === THEME.primaryLight && (
                    <Icon name="checkmark" size={16} color={THEME.primary} />
                  )}
                  <Text style={styles.bgOptionText}>Primary</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Download Type Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Download Type:</Text>
              <View style={styles.formatOptions}>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    fileType === 'png' && styles.formatOptionSelected,
                  ]}
                  onPress={() => setFileType('png')}
                >
                  <Text style={[
                    styles.formatOptionText,
                    fileType === 'png' && styles.formatOptionTextSelected,
                  ]}>
                    PNG
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    fileType === 'jpg' && styles.formatOptionSelected,
                  ]}
                  onPress={() => setFileType('jpg')}
                >
                  <Text style={[
                    styles.formatOptionText,
                    fileType === 'jpg' && styles.formatOptionTextSelected,
                  ]}>
                    JPG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownloadQR}>
              <Icon name="download-outline" size={20} color={THEME.text.inverse} />
              <Text style={styles.buttonText}>Download QR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{BASE_PUBLIC_URL}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: THEME.background.overlay 
  },
  modal: { 
    width: width * 0.85, 
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: THEME.background.primary, 
    borderRadius: 20, 
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: THEME.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.light,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: THEME.text.primary,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorOptionSelected: {
    borderColor: THEME.text.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backgroundOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  bgOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgOptionSelected: {
    borderColor: THEME.primary,
  },
  bgOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.text.primary,
    marginTop: 4,
  },
  formatOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  formatOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.border.light,
    backgroundColor: THEME.background.secondary,
    alignItems: 'center',
  },
  formatOptionSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primaryLight,
  },
  formatOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text.secondary,
  },
  formatOptionTextSelected: {
    color: THEME.primary,
    fontWeight: '600',
  },
  actions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border.light,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: THEME.primary,
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.border.light,
  },
  buttonText: {
    color: THEME.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonText: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: { 
    padding: 15, 
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: THEME.border.light,
  },
  footerText: { 
    color: THEME.text.secondary, 
    fontSize: 12 
  },
});

export default QRModal;