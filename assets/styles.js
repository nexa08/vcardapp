// styles.js
import { StyleSheet } from 'react-native';

const Colors = {
  darkBg: '#1f2937',
  cardBg: '#111827',
  cardBorder: '#374151',
  textLight: '#e5e7eb',
  textDark: '#f9fafb',
  buttonMain: '#2563eb',
  gradientStart: '#1e3a8a',
  gradientEnd: '#7c3aed',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4f46e5',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.darkBg,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    color: Colors.darkBg,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    color: '#1f2937',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroupText: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  inputGroupInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    color: '#1f2937',
    borderLeftWidth: 0,
  },
  buttonContainer: {
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
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Preview Section
  previewCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  previewName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
  },
  // Saved Vcards Table
  tableContainer: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableText: {
    color: Colors.darkBg,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadBtn: { backgroundColor: '#6c757d', padding: 8, borderRadius: 8 },
  qrBtn: { backgroundColor: '#ffc107', padding: 8, borderRadius: 8 },
  editBtn: { backgroundColor: '#ff9800', padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 8 },
});

export default styles;