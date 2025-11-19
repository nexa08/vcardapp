import React, { useState } from "react";
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Linking 
} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

// Section Component with expand/collapse
const Section = ({ title, content, isLast = false }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.section, isLast && styles.lastSection]}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIcon}>
            <Icon name="list-alt" size={18} color="#4F46E5" />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Icon 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#64748B" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const TermsConditions = () => {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using our vCard platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services."
    },
    {
      title: "User Accounts & Registration",
      content: "To access certain features, you may need to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration."
    },
    {
      title: "Privacy & Data Protection",
      content: "We are committed to protecting your privacy. Your personal data is stored securely and used in accordance with our Privacy Policy. We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction."
    },
    {
      title: "Intellectual Property Rights",
      content: "All content, features, and functionality available on this platform, including but not limited to text, graphics, logos, and software, are the exclusive property of vCard Pro and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission."
    },
    {
      title: "User-Generated Content",
      content: "You retain all rights to the vCards and content you create. By using our platform, you grant us a limited license to store, process, and display your content solely for the purpose of providing our services to you. You are solely responsible for the content you create and share."
    },
    {
      title: "Prohibited Activities",
      content: "You agree not to: Use the platform for any illegal purpose; Upload malicious code or viruses; Attempt to gain unauthorized access to other users' data; Use automated systems to access our services; Impersonate others or provide false information."
    },
    {
      title: "Service Availability & Modifications",
      content: "We strive to maintain 24/7 service availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the service at any time. We reserve the right to update these terms, and continued use constitutes acceptance of changes."
    },
    {
      title: "Limitation of Liability",
      content: "To the fullest extent permitted by law, vCard Pro shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the platform. Our total liability shall not exceed the amount paid by you for our services."
    },
    {
      title: "Termination",
      content: "We reserve the right to suspend or terminate your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties."
    },
    {
      title: "Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of Tanzania, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Dar es Salaam."
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#4F46E5" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>Last updated: December 2024</Text>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeIcon}>
              <Icon name="shield" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.welcomeTitle}>Your Privacy & Rights Matter</Text>
          </View>
          <Text style={styles.welcomeText}>
            We believe in transparency and protecting your digital rights. Please take a moment to review our terms carefully.
          </Text>
        </View>

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Quick Summary</Text>
          <View style={styles.summaryPoints}>
            <View style={styles.summaryPoint}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.summaryText}>You own your vCard data</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.summaryText}>We protect your privacy</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.summaryText}>No hidden fees or charges</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.summaryText}>Transparent data practices</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <Icon name="list-alt" size={24} color="#4F46E5" />
            <Text style={styles.contentTitle}>Detailed Terms & Conditions</Text>
          </View>
          
          <Text style={styles.introText}>
            Please expand each section to read the complete terms. By using our platform, you agree to these conditions.
          </Text>

          {sections.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              content={section.content}
              isLast={index === sections.length - 1}
            />
          ))}
        </View>

        {/* Contact & Links */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Questions or Concerns?</Text>
          <Text style={styles.contactText}>
            We're here to help clarify any part of our terms.
          </Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Linking.openURL("mailto:jongaboe@gmail.com")}
            >
              <Icon name="envelope" size={16} color="#4F46E5" />
              <Text style={styles.contactButtonText}>Email Legal Team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => router.push('/help')}
            >
              <Icon name="lock" size={16} color="#4F46E5" />
              <Text style={styles.contactButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acceptance Footer */}
        <View style={styles.acceptanceCard}>
          <TouchableOpacity 
            style={[styles.acceptButton, accepted && styles.acceptButtonActive]}
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
              {accepted && <Icon name="check" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.acceptText}>
              I have read and agree to the Terms & Conditions
            </Text>
          </TouchableOpacity>
          
          {accepted && (
            <View style={styles.successMessage}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.successText}>Thank you for accepting our terms!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  container: { 
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  // Header
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 24,
    marginTop: 10,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1E293B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },

  // Welcome Card
  welcomeCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  welcomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  summaryPoints: {
    gap: 8,
  },
  summaryPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },

  // Content Card
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  introText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Sections
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 16,
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  sectionContent: {
    marginTop: 12,
    paddingLeft: 44,
  },
  sectionText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },

  // Contact Card
  contactCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: "#0369A1",
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0C4A6E",
  },

  // Acceptance
  acceptanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  acceptButtonActive: {
    // Add any active styles if needed
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#065F46",
  },
});

export default TermsConditions;