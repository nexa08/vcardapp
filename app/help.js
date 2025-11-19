import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Icon from  "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

// --- FAQ Item Component ---
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqRow, open && styles.faqRowOpen]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqIcon}>
          <Text style={styles.faqIconText}>Q</Text>
        </View>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Icon 
          name={open ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#4F46E5" 
        />
      </View>
      {open && (
        <View style={styles.faqAnswerContainer}>
          <View style={[styles.faqIcon, styles.answerIcon]}>
            <Text style={styles.faqIconText}>A</Text>
          </View>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- Plan Card Component ---
const PlanCard = ({ name, details, isPopular }) => {
  return (
    <View style={[styles.planCard, isPopular && styles.popularPlanCard]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Icon name={isPopular ? "diamond" : "star"} size={20} color={isPopular ? "#FFFFFF" : "#4F46E5"} />
        </View>
        <Text style={styles.planName}>{name}</Text>
      </View>
      <Text style={styles.planDetails}>{details}</Text>
      <TouchableOpacity style={[styles.planButton, isPopular && styles.popularPlanButton]}>
        <Text style={[styles.planButtonText, isPopular && styles.popularPlanButtonText]}>
          Choose Plan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Feature Item Component ---
const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Icon name={icon} size={18} color="#4F46E5" />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const Help = () => {
  const router = useRouter();

  const faqData = [
    { question: "How do I create a vCard?", answer: "Go to 'Create Card' and fill in your details. You can add photos, contact information, and social links." },
    { question: "Can I download vCards?", answer: "Yes, from the 'My Cards' section you can download your saved vCards in multiple formats." },
    { question: "How secure is my data?", answer: "All your data is encrypted and securely transmitted. We use industry-standard security practices." },
  ];

  const plans = [
    { name: "Free Plan", details: "Create up to 3 vCards, basic QR codes, standard support", isPopular: false },
    { name: "Premium Plan", details: "Unlimited vCards, custom QR codes, analytics, priority support", isPopular: true },
  ];

  const features = [
    { icon: "qrcode", text: "QR Code Generation" },
    { icon: "bar-chart", text: "Scan Analytics" },
    { icon: "cloud-download", text: "Cloud Backup" },
    { icon: "shield", text: "Secure Encryption" },
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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>Get help and learn about features</Text>
          </View>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="info-circle" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>About vCard Pro</Text>
          </View>
          <Text style={styles.cardText}>
            Create, share, and manage digital business cards with advanced analytics, 
            secure cloud storage, and beautiful QR codes.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="headphones" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Get in Touch</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL("mailto:jongaboe@gmail.com")}
          >
            <View style={styles.contactIcon}>
              <Icon name="envelope" size={20} color="#4F46E5" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>jongaboe@gmail.com</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL("tel:+255 684 357 336")}
          >
            <View style={styles.contactIcon}>
              <Icon name="phone" size={20} color="#4F46E5" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+255 684 357 336</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => router.push('/contactus')}
          >
            <View style={styles.contactIcon}>
              <Icon name="comments-o" size={20} color="#4F46E5" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Feedback & Support</Text>
              <Text style={styles.contactValue}>Share your thoughts with us</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Features Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="magic" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Key Features</Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureItem key={index} icon={feature.icon} text={feature.text} />
            ))}
          </View>
        </View>

        {/* FAQ Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="info-circle" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          </View>
          {faqData.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </View>

        {/* Plans Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="id-card" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Choose Your Plan</Text>
          </View>
          <View style={styles.planRow}>
            {plans.map((plan, index) => (
              <PlanCard 
                key={index} 
                name={plan.name} 
                details={plan.details} 
                isPopular={plan.isPopular}
              />
            ))}
          </View>
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

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1E293B",
  },
  cardText: { 
    fontSize: 15, 
    color: "#64748B", 
    lineHeight: 22,
  },

  // Contact Items
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: "#64748B",
  },

  // Features
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    minWidth: "48%",
    gap: 8,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },

  // FAQ
  faqRow: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqRowOpen: {
    backgroundColor: "#F0F9FF",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  faqIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  answerIcon: {
    backgroundColor: "#10B981",
  },
  faqQuestion: {
    fontWeight: "600",
    color: "#1E293B",
    fontSize: 14,
    flex: 1,
  },
  faqAnswerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 12,
  },
  faqAnswer: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Plans
  planRow: {
    gap: 12,
  },
  planCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  popularPlanCard: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  planName: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1E293B",
  },
  planDetails: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  planButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  popularPlanButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  planButtonText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  popularPlanButtonText: {
    color: "#4F46E5",
  },
});

export default Help;