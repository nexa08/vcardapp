import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions,  SafeAreaView, ScrollView, TextInput} from 'react-native';
import  Icon from 'react-native-vector-icons/FontAwesome';
import QRCode from 'react-native-qrcode-svg';
import {triggerLocalNotification} from '../../utils/notifications';
import { useRouter } from 'expo-router';
import {BASE_URL} from '../../utils/config';

// --- Color Palette and Constants ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768;
const router = useRouter();

const PRIMARY_COLOR = '#4F46E5';
const PRIMARY_LIGHT = '#EEF2FF';
const BACKGROUND_COLOR = '#EEF2FF';
const DARK_TEXT = '#1F2937';
const MEDIUM_TEXT = '#777';
const GREEN_SUCCESS = '#10B981';

// Sample data for the Landing Page preview card
const SAMPLE_CARD_DATA = {
    name: 'Nexa The Icon',
    title: 'Senior Developer',
    company: 'VCard App',
    phone: '+255 (0) 622  255 496',
    email: 'nexa.theicon@gmail.com',
    url: 'nexatheiconn.netlify.app',
};

// Data for the new Testimonial Grid
const TESTIMONIAL_DATA = [
    {
        quote: "Share your card instantly with a simple QR code scan. No more fumbling for paper cards & real time monitoring anywhere with unlimited scans",
        source: "Instant Sharing",
        title: "Easy share & Easy scan",
    },
    {
        quote: "Update your information in real-time. Change your job, phone number, or social media links instantly with only one qr code,no need to generate new qr codes after every update",
        source: "Always Up-to-Date",
        title: "Dynamic QR code,",
    },
    {
        quote: "Reduce your carbon footprint by eliminating the need for traditional paper business cards & plastic ones.Stay clean and sharp with V-card App",
        source: "Eco-Friendly",
        title: "Deduct Paper Work",
    },
];

// How It Works Steps
const HOW_IT_WORKS_DATA = [
    {
        step: "01",
        title: "Sign Up & Create",
        description: "Register for free and set up your digital business card in less than 2 minutes",
        icon: "user-plus"
    },
    {
        step: "02",
        title: "Customize Your Card",
        description: "Add your photo, contact details, social links, and company information",
        icon: "pencil"
    },
    {
        step: "03",
        title: "Share Instantly",
        description: "Use your unique QR code or shareable link to connect with anyone, anywhere",
        icon: "share-alt"
    },
    {
        step: "04",
        title: "Track & Analyze",
        description: "Monitor who views your card and get insights on your connections",
        icon: "bar-chart"
    }
];

// --- Icon Mapping ---
const IconMap = {
    Mail: (props) => <Icon name="envelope" {...props} />,
    Briefcase: (props) => <Icon name="briefcase" {...props} />,
    Phone: (props) => <Icon name="phone" {...props} />,
    Link: (props) => <Icon name="link" {...props} />,
    User: (props) => <Icon name="user" {...props} />,
    Key: (props) => <Icon name="tag" {...props} />,
    ArrowLeft: (props) => <Icon name="arrow-left" {...props} />,
    Send: (props) => <Icon name="send" {...props} />,
    Home: (props) => <Icon name="home" {...props} />,
    QrCode: (props) => <Icon name="qr-code-" {...props} />,
    Sync: (props) => <Icon name="refresh" {...props} />,
    Stats: (props) => <Icon name="bar-chart" {...props} />,
};

// --- Sub-Components ---
const FeatureItem = ({ Icon, title, description, iconName }) => (
    <View style={styles.featureCard}>
        <View style={styles.iconContainer}>
            <Icon name={iconName} size={24} color={PRIMARY_COLOR} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
    </View>
);

const TestimonialCard = ({ quote, source, title }) => (
    <View style={styles.testimonialCard}>
        <Icon name="rocket" size={24} color={PRIMARY_COLOR} style={{marginBottom: 10}} />
        <Text style={styles.testimonialQuoteText}>{quote}</Text>
        <View style={styles.testimonialSourceContainer}>
            <Text style={styles.testimonialSourceText}>— {source}</Text>
            <Text style={styles.testimonialTitleText}>{title}</Text>
        </View>
    </View>
);

const HowItWorksStep = ({ step, title, description, icon, isLast }) => (
    <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
            <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{step}</Text>
                <View style={styles.stepIcon}>
                    <Icon name={icon} size={20} color="white" />
                </View>
            </View>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepDescription}>{description}</Text>
        </View>
        {!isLast && <View style={styles.stepConnector} />}
    </View>
);

const VCardDisplay = ({ data, navigate }) => {
    const [isSaved, setIsSaved] = useState(false);
    const displayData = data || SAMPLE_CARD_DATA;
    
    useEffect(() => {
        console.log("SUCCESS: VCard data 'saved' in application state/cache:", displayData);
        setIsSaved(true);
    }, [displayData]);

    // Generate vCard string for QR code
    const generateVCard = () => {
        const vCard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${displayData.name}`,
            `TITLE:${displayData.title}`,
            `ORG:${displayData.company}`,
            `TEL:${displayData.phone}`,
            `EMAIL:${displayData.email}`,
            `URL:${displayData.url}`,
            'END:VCARD'
        ].join('\n');
        return vCard;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.displayScrollViewContent}>
                <View style={styles.cardWrapper}>
                    <View style={styles.cardHeader}>
                        <TouchableOpacity 
                            onPress={() => navigate('landing')}
                            style={styles.backButton}
                        >
                            <IconMap.Home size={16} color={PRIMARY_COLOR} />
                            <Text style={styles.backButtonText}>back to home</Text>
                        </TouchableOpacity>
                    </View>

                    {isSaved && (
                        <View style={styles.cacheConfirmation}>
                            <Icon name="check-circle" size={24} color={GREEN_SUCCESS} />
                            <Text style={styles.cacheConfirmationText}>Card created & ready to share!</Text>
                        </View>
                    )}

                    <View style={styles.saveCtaSection}>
                        <Text style={styles.qrCodeTitle}>Your Digital Business Card QR Code</Text>
                        <Text style={styles.qrCodeSubtitle}>Scan this QR code to save contact information</Text>
                        
                        <View style={styles.qrCodeContainer}>
                            <QRCode 
                                value={generateVCard()} 
                                size={200}
                            />
                        </View>
                        
                        <View style={styles.shareOptions}>
                            <TouchableOpacity style={styles.shareButton}>
                                <Icon name="download" size={20} color={PRIMARY_COLOR} />
                                <Text style={styles.shareButtonText}>Save QR Code</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareButton}>
                                <Icon name="share" size={20} color={PRIMARY_COLOR} />
                                <Text style={styles.shareButtonText}>Share Card</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InputField = ({ Icon, name, placeholder, type = 'default', value, onChangeText }) => (
    <View style={styles.inputFieldContainer}>
        <View style={styles.inputIconWrapper}>
            <Icon size={20} color="#9CA3AF" />
        </View>
        <TextInput
            style={styles.input}
            onChangeText={(text) => onChangeText(name, text)}
            value={value}
            placeholder={placeholder}
            keyboardType={type === 'email-address' ? 'email-address' : type === 'tel' ? 'phone-pad' : 'default'}
            placeholderTextColor="#9CA3AF"
        />
    </View>
);

const LandingPage = ({ navigate }) => {
    // Contact form state
    const [contactData, setContactData] = useState({
        username: '',
        email: '',
        message: ''
    });

    const handleContactChange = (name, value) => {
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactSubmit = async () => {
        if (!contactData.username || !contactData.email || !contactData.message) {
            triggerLocalNotification('Missing Information', 'Please fill in all fields to send your message.');
            return;
        }
            const response = await fetch(`${BASE_URL}/charm/feedbackk`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData),
            });

            const result = await response.json();

            if (response.ok) {
                triggerLocalNotification('Success', 'Your message has been sent successfully!');
                setContactData({ username: '', email: '', message: '' });
            } else {
                triggerLocalNotification('Error', result.message || 'Failed to send message. Please try again.');
            }
       
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.landingScrollViewContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>V-Card<Text style={styles.logoSub}> App</Text></Text>
                    <TouchableOpacity 
                        onPress={() => router.push('/card')}
                        style={styles.headerButton}
                    >
                        <Text style={styles.headerButtonText}>Get Started Free</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    {/* URGENCY BANNER */}
                    <View style={styles.urgencyBanner}>
                        <Text style={styles.urgencyText}>
                        🚀 Limited Offer: Free setup for first 50 signups this week
                        </Text>
                    </View>

                    {/* SOCIAL PROOF */}
                    <View style={styles.socialProof}>
                        <Text style={styles.socialProofText}>
                        Trusted by 10,000+ professionals from
                        </Text>
                        <View style={styles.companyLogos}>
                        <Text style={styles.companyLogo}><Icon name='building' color='#4F46E5'> </Icon>TechCorp</Text>
                        <Text style={styles.companyLogo} ><Icon name='briefcase' color='#4F46E5'></Icon> GrowthInc</Text>
                        <Text style={styles.companyLogo}><Icon name='rocket' color='#4F46E5'></Icon>StartUpLab</Text>
                        </View>
                    </View>

                    {/* MAIN HEADLINE */}
                    <Text style={styles.heroTitle}>
                        Stop Losing Contacts.
                        <Text style={styles.heroTitlePrimary}> Go Digital in 60 Seconds</Text>
                    </Text>

                    {/* SUBHEADLINE WITH BENEFITS */}
                    <Text style={styles.heroSubtitle}>
                        Paper cards get lost. Digital connections last forever. 
                        <Text style={styles.highlight}> Get 3x more follow-ups</Text> and never miss a business opportunity again.
                    </Text>

                    {/* QUICK BENEFITS GRID */}
                    <View style={styles.benefitsGrid}>
                        <View style={styles.benefitItem}>
                        <Icon name="ticket" size={20} color={GREEN_SUCCESS} />
                        <Text style={styles.benefitText}>Save 2+ hours weekly</Text>
                        </View>
                        <View style={styles.benefitItem}>
                        <Icon name="level-up" size={20} color={GREEN_SUCCESS} />
                        <Text style={styles.benefitText}>3x more connections</Text>
                        </View>
                        <View style={styles.benefitItem}>
                        <Icon name="external-link-square" size={20} color={GREEN_SUCCESS} />
                        <Text style={styles.benefitText}>Track who views your profile</Text>
                        </View>
                    </View>

                    {/* IMPROVED CTA BUTTONS */}
                    <View style={styles.heroCtaGroup}>
                        <TouchableOpacity 
                        onPress={() => router.push('/register')} 
                        style={styles.primaryCtaButton}
                        >
                        <Text style={styles.primaryCtaText}>SignUp →</Text>
                       
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                        onPress={() => router.push('/login')} 
                        style={styles.secondaryCtaButton}
                        >
                        <Text style={styles.secondaryCtaText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* TRUST BADGES */}
                    <View style={styles.trustBadges}>
                        <View style={styles.trustItem}>
                        <Icon name="shield" size={16} color={GREEN_SUCCESS} />
                        <Text style={styles.trustText}>Secure & Encrypted</Text>
                        </View>
                        <View style={styles.trustItem}>
                        <Icon name="star" size={16} color={GREEN_SUCCESS} />
                        <Text style={styles.trustText}>4.9/5 Rating</Text>
                        </View>
                        <View style={styles.trustItem}>
                        <Icon name="users" size={16} color={GREEN_SUCCESS} />
                        <Text style={styles.trustText}>10K+ Users</Text>
                        </View>
                    </View>
                </View>

                {/* How It Works Section */}
                <View style={styles.howItWorksSection}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <Text style={styles.sectionSubtitle}>
                        Get your digital business card up and running in just 4 simple steps
                    </Text>
                    
                    <View style={styles.stepsContainer}>
                        {HOW_IT_WORKS_DATA.map((step, index) => (
                            <HowItWorksStep
                                key={step.step}
                                step={step.step}
                                title={step.title}
                                description={step.description}
                                icon={step.icon}
                                isLast={index === HOW_IT_WORKS_DATA.length - 1}
                            />
                        ))}
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.getStartedButton}
                        onPress={() => router.push('/register')}
                    >
                        <Text style={styles.getStartedButtonText}>Get Started Now</Text>
                        <Icon name="arrow-right" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>OUR SERVICES</Text>
                    <Text style={styles.sectionSubtitle}>
                        Arusha Prime Design pleasurely give you the service you need & reliable
                    </Text>
                    <View style={styles.featuresGrid}>
                        <FeatureItem
                            Icon={Icon}
                            iconName="qrcode"
                            title="Digital Business Cards"
                            description="Our core service is creating dynamic, interactive digital business cards that you can share instantly with anyone, anywhere. via QR code & link. Share your card instantly without needing an app."
                        />
                        <FeatureItem
                            Icon={Icon}
                            iconName="tag"
                            title="Logo Designs"
                            description="We provide custom logo design services to help you build a professional brand identity. Our design experts will work with you to create a unique and memorable logo that perfectly represents your business or personal brand."
                        />
                        <FeatureItem
                            Icon={Icon}
                            iconName="briefcase"
                            title="IT Consultants"
                            description="Our team of IT consultants offers professional advice and solutions to help you optimize your digital presence. Whether you need help with website setup, data management, or security, we've got you covered."
                        />
                    </View>
                </View>

                {/* Testimonial Section */}
                <View style={styles.testimonialSection}>
                    <Text style={styles.sectionTitleWhite}>
                      Why Go Digital with eBusiness Card?
                    </Text>
                    <Text style={styles.sectionSubtitleWhite}>
                     V-Card APP gives you the tools you need to make a lasting impression in any interaction.
                    </Text>
                    <View style={styles.testimonialsGrid}>
                        {TESTIMONIAL_DATA.map((t, index) => (
                            <TestimonialCard key={index} {...t} />
                        ))}
                    </View>
                </View>

                {/* Contact Section - UPDATED WITH BACKEND INTEGRATION */}
                <View style={styles.contactContainer}>
                    <Text style={styles.contactHeader}>Get in Touch</Text>
                    <Text style={styles.contactSubtitle}>Have questions? We'd love to hear from you!</Text>
                    
                    <View style={styles.contactWrapper}>
                        <InputField 
                            Icon={IconMap.User} 
                            name="username" 
                            placeholder="Your Name" 
                            value={contactData.username} 
                            onChangeText={handleContactChange} 
                        />
                        <InputField 
                            Icon={IconMap.Mail} 
                            name="email" 
                            placeholder="Your Email" 
                            type="email-address"
                            value={contactData.email} 
                            onChangeText={handleContactChange} 
                        />
                        
                        <View style={styles.messageInputContainer}>
                            <TextInput 
                                placeholder="Your Message" 
                                multiline 
                                numberOfLines={4} 
                                style={styles.messageInput}
                                value={contactData.message}
                                onChangeText={(text) => handleContactChange('message', text)}
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.messageButton}
                            onPress={handleContactSubmit}
                        >
                            <Text style={styles.ContactButtonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Call to Action Section */}
                <View style={styles.finalCtaSection}>
                    <Text style={styles.finalCtaTitle}>
                        Ready to Upgrade Your Networking?
                    </Text>
                    <Text style={styles.finalCtaSubtitle}>
                        Start creating memorable digital connections today. It only takes 60 seconds.
                    </Text>
                    <TouchableOpacity 
                        onPress={() => router.push('/card')} 
                        style={styles.ctaButtonLarge}
                    >
                        <Text style={styles.ctaButtonTextLarge}>Start Now With VCard</Text>
                    </TouchableOpacity>
                    <Text style={styles.finalCtaFooter}>
                        No credit card required. One call and all DONE!
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}> &copy; 2025. Arusha Prime Design. All rights reserved.</Text>
                    <View style={styles.footerLinks}>
                        <Text style={styles.footerLink}>Terms</Text>
                        <Text style={styles.footerLinkSeparator}>|</Text>
                        <Text style={styles.footerLink}>Privacy</Text>
                        <Text style={styles.footerLinkSeparator}>|</Text>
                        <Text style={styles.footerLink}>Contact</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('landing');
    const [vCardData, setVCardData] = useState(null);

    const navigate = (screenName, data = null) => {
        if (data) setVCardData(data);
        setCurrentScreen(screenName);
    };

    let CurrentComponent;
    switch (currentScreen) {
        case 'display':
            CurrentComponent = VCardDisplay;
            break;
        case 'landing':
        default:
            CurrentComponent = LandingPage;
            break;
    }

    return (
        <CurrentComponent 
            navigate={navigate}
            data={vCardData} 
        />
    );
};

// --- Updated StyleSheet with How It Works Section ---
const styles = StyleSheet.create({
    // How It Works Styles
    howItWorksSection: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    stepsContainer: {
        width: '100%',
        maxWidth: 800,
        marginTop: 40,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    stepContent: {
        flex: 1,
        padding: 20,
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 12,
        marginRight: 20,
    },
    stepNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        marginRight: 12,
        fontFamily: 'BHH San Bartle',
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: DARK_TEXT,
        marginBottom: 8,
        fontFamily: 'BHH San Bartle',
    },
    stepDescription: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        lineHeight: 20,
        fontFamily: 'BHH San Bartle',
    },
    stepConnector: {
        width: 2,
        height: 60,
        backgroundColor: PRIMARY_COLOR,
        position: 'absolute',
        right: 30,
        top: 80,
        opacity: 0.3,
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 40,
        gap: 12,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    getStartedButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'BHH San Bartle',
    },

    // Existing styles remain the same...
    previewQRCode: {
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    qrCodeHint: {
        fontSize: 10,
        color: MEDIUM_TEXT,
        marginTop: 8,
        fontFamily: 'BHH San Bartle',
    },
    qrCodeContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    qrCodeSubtitle: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'BHH San Bartle',
    },
    shareOptions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 8,
        gap: 8,
    },
    shareButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: PRIMARY_COLOR,
        fontFamily: 'BHH San Bartle',
    },
    previewNote: {
        fontSize: 12,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        marginTop: 12,
        fontFamily: 'BHH San Bartle',
        fontStyle: 'italic',
    },
    messageInputContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        backgroundColor: 'white',
    },
    messageInput: {
        padding: 14,
        fontSize: 16,
        color: DARK_TEXT,
        textAlignVertical: 'top',
        minHeight: 100,
        fontFamily: 'System',
    },
    contactSubtitle: {
        fontSize: 16,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'BHH San Bartle',
    },
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: PRIMARY_COLOR,
        marginLeft: 4,
        fontFamily: 'BHH San Bartle',
    },
    contactWrapper: { 
        backgroundColor: '#FFF', 
        borderRadius: 10, 
        padding: 20 
    },
    contactContainer: { 
        paddingHorizontal: 20, 
        marginBottom: 60, 
        margin: 20,
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
    },
    ContactButtonText: { 
        fontWeight: 'bold', 
        textAlign: 'center', 
        color: '#FFF',
        fontFamily: 'BHH San Bartle',
    },
    contactHeader: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: PRIMARY_COLOR, 
        textAlign: 'center', 
        marginBottom: 20,
        fontFamily: 'BHH San Bartle',
    },
    messageButton: { 
        backgroundColor: PRIMARY_COLOR, 
        paddingVertical: 14, 
        borderRadius: 10, 
        marginTop: 10 
    },
    textInput: { 
        backgroundColor: '#FFF', 
        color: DARK_TEXT, 
        padding: 14, 
        borderRadius: 10, 
        marginBottom: 12, 
        borderWidth: 1,
        borderColor: '#D1D5DB',
        fontFamily: 'System',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    logo: {
        fontSize: 32,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        fontFamily: 'BHH San Bartle',
    },
    logoSub: {
        color: DARK_TEXT,
        fontWeight: '600',
        fontFamily: 'BHH San Bartle',
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'BHH San Bartle',
    },
    heroSection: {
        backgroundColor: PRIMARY_LIGHT,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    tagline: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4338CA',
        backgroundColor: '#E0E7FF',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 16,
        fontFamily: 'BHH San Bartle',
    },
    heroTitle: {
        fontSize: SCREEN_WIDTH > 400 ? 36 : 26,
        fontWeight: '800',
        color: DARK_TEXT,
        textAlign: 'center',
        lineHeight: SCREEN_WIDTH > 400 ? 52 : 44,
        marginBottom: 16,
        maxWidth: 700,
        fontFamily: 'BHH San Bartle',
    },
    heroTitlePrimary: {
        color: PRIMARY_COLOR,
    },
    heroSubtitle: {
        fontSize: 18,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        maxWidth: 600,
        marginBottom: 32,
        fontFamily: 'BHH San Bartle',
    },
    heroCtaGroup: {
        flexDirection: SCREEN_WIDTH > 600 ? 'row' : 'column',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 40,
        width: '100%',
        maxWidth: 400,
    },
    urgencyBanner: {
        backgroundColor: '#FFFBEB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F59E0B',
        marginBottom: 20,
    },
    urgencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D97706',
        textAlign: 'center',
        fontFamily: 'BHH San Bartle',
    },
    socialProof: {
        alignItems: 'center',
        marginBottom: 24,
    },
    socialProofText: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        marginBottom: 8,
        fontFamily: 'BHH San Bartle',
    },
    companyLogos: {
        flexDirection: 'row',
        gap: 16,
    },
    companyLogo: {
        fontSize: 12,
        fontWeight: '600',
        color: DARK_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    highlight: {
        color: PRIMARY_COLOR,
        fontWeight: '700',
    },
    benefitsGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    benefitText: {
        fontSize: 12,
        fontWeight: '500',
        color: DARK_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    primaryCtaButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        minWidth: 200,
    },
    primaryCtaText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'BHH San Bartle',
    },
    ctaSubtext: {
        color: '#E0E7FF',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'BHH San Bartle',
    },
    secondaryCtaButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: PRIMARY_COLOR,
        alignItems: 'center',
        minWidth: 200,
    },
    secondaryCtaText: {
        color: PRIMARY_COLOR,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'BHH San Bartle',
    },
    trustBadges: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 24,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 12,
        color: MEDIUM_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    ctaButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 32,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
    },
    ctaButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'BHH San Bartle',
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 32,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: PRIMARY_COLOR,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'BHH San Bartle',
    },
    setupContainer: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        gap: 30,
        width: '100%',
        maxWidth: 1000,
        alignItems: 'flex-start',
        paddingTop: 20,
        paddingBottom: 40,
    },
    formColumn: {
        flex: IS_LARGE_SCREEN ? 1 : undefined,
        width: IS_LARGE_SCREEN ? undefined : '100%',
        maxWidth: IS_LARGE_SCREEN ? 500 : undefined,
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    previewColumn: {
        flex: IS_LARGE_SCREEN ? 1 : undefined,
        width: IS_LARGE_SCREEN ? undefined : '100%',
        maxWidth: 400,
        alignSelf: IS_LARGE_SCREEN ? 'auto' : 'center',
        marginTop: IS_LARGE_SCREEN ? 0 : 40,
        alignItems: 'center',
    },
    livePreviewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DARK_TEXT,
        marginBottom: 10,
        fontFamily: 'BHH San Bartle',
    },
    livePreviewPhoneContainer: {
        width: '90%', 
        maxWidth: 300,
        aspectRatio: 0.6,
        backgroundColor: DARK_TEXT,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    livePreviewCard: {
        shadowOpacity: 0,
        elevation: 0,
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: DARK_TEXT,
        marginBottom: 8,
        fontFamily: 'BHH San Bartle',
    },
    formSubtitle: {
        fontSize: 16,
        color: MEDIUM_TEXT,
        marginBottom: 20,
        fontFamily: 'BHH San Bartle',
    },
    inputFieldContainer: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        backgroundColor: 'white',
        paddingHorizontal: 14,
    },
    inputIconWrapper: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: DARK_TEXT,
        fontFamily: 'System',
    },
    submitButton: {
        width: '100%',
        marginTop: 24,
        paddingVertical: 14,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        fontFamily: 'BHH San Bartle',
    },
    featuresSection: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: DARK_TEXT,
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'BHH San Bartle',
    },
    sectionSubtitle: {
        fontSize: 16,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        fontFamily: 'BHH San Bartle',
    },
    sectionTitleWhite: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'BHH San Bartle',
    },
    sectionSubtitleWhite: {
        fontSize: 16,
        color: PRIMARY_LIGHT,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        fontFamily: 'BHH San Bartle',
    },
    featuresGrid: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        justifyContent: 'center',
        gap: 24, 
    },
    featureCard: {
        flex: IS_LARGE_SCREEN ? 1 : undefined,
        width: IS_LARGE_SCREEN ? undefined : '100%',
        maxWidth: 380, 
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignSelf: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: DARK_TEXT,
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'BHH San Bartle',
    },
    featureDescription: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        fontFamily: 'BHH San Bartle',
    },
    testimonialSection: {
        paddingVertical: 50,
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    testimonialsGrid: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        justifyContent: 'center',
        gap: 24, 
    },
    testimonialCard: {
        flex: IS_LARGE_SCREEN ? 1 : undefined,
        width: IS_LARGE_SCREEN ? undefined : '100%',
        maxWidth: 380, 
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        alignSelf: 'stretch',
    },
    testimonialQuoteText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: DARK_TEXT,
        marginBottom: 16,
        lineHeight: 24,
        fontFamily: 'BHH San Bartle',
    },
    testimonialSourceContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 10,
    },
    testimonialSourceText: {
        fontSize: 15,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        fontFamily: 'BHH San Bartle',
    },
    testimonialTitleText: {
        fontSize: 13,
        fontWeight: '500',
        color: MEDIUM_TEXT,
        marginTop: 2,
        fontFamily: 'BHH San Bartle',
    },
    finalCtaSection: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    finalCtaTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: DARK_TEXT,
        textAlign: 'center',
        marginBottom: 8,
        maxWidth: 600,
        fontFamily: 'BHH San Bartle',
    },
    finalCtaSubtitle: {
        fontSize: 18,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 600,
        fontFamily: 'BHH San Bartle',
    },
    ctaButtonLarge: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
        alignItems: 'center',
        marginBottom: 8,
    },
    ctaButtonTextLarge: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        fontFamily: 'BHH San Bartle',
    },
    finalCtaFooter: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        textAlign: 'center',
        fontFamily: 'BHH San Bartle',
    },
    footer: {
        paddingVertical: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
    },
    footerLogo: {
        fontSize: 24,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginBottom: 10,
        fontFamily: 'BHH San Bartle',
    },
    footerText: {
        fontSize: 12,
        color: MEDIUM_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: 8,
    },
    footerLink: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        paddingHorizontal: 8,
        fontFamily: 'BHH San Bartle',
    },
    footerLinkSeparator: {
        color: '#D1D5DB',
    },
    displayScrollViewContent: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
    },
    cardWrapper: {
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    cardContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    previewCardContainer: {
        padding: 16,
        borderRadius: 16,
        shadowOpacity: 0,
        elevation: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    profileSection: {
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: PRIMARY_LIGHT,
        marginBottom: 8,
    },
    profileImageText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'BHH San Bartle',
    },
    nameText: {
        fontSize: 26,
        fontWeight: '800',
        color: DARK_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: PRIMARY_COLOR,
        marginTop: 2,
        fontFamily: 'BHH San Bartle',
    },
    companyText: {
        fontSize: 14,
        color: MEDIUM_TEXT,
        marginTop: 2,
        fontFamily: 'BHH San Bartle',
    },
    contactLinksSection: {
        marginTop: 16,
        gap: 8,
    },
    contactLinksTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: DARK_TEXT,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        fontFamily: 'BHH San Bartle',
    },
    vCardLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 10,
    },
    vCardLinkPreview: {
        backgroundColor: '#F3F4F6', 
    },
    vCardLinkIconBg: {
        padding: 6,
        borderRadius: 16,
        backgroundColor: PRIMARY_COLOR,
        marginRight: 10,
    },
    vCardLinkContent: {
        flex: 1,
    },
    vCardLinkLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: PRIMARY_COLOR,
        fontFamily: 'BHH San Bartle',
    },
    vCardLinkValue: {
        fontSize: 14,
        fontWeight: '600',
        color: DARK_TEXT,
        fontFamily: 'BHH San Bartle',
    },
    saveCtaSection: {
        marginTop: 30,
        alignItems: 'center',
    },
    qrCodeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: DARK_TEXT,
        marginBottom: 15,
        fontFamily: 'BHH San Bartle',
    },
    cacheConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        borderLeftWidth: 5,
        borderLeftColor: GREEN_SUCCESS,
    },
    cacheConfirmationText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: GREEN_SUCCESS,
        flex: 1,
        fontFamily: 'BHH San Bartle',
    },
    landingScrollViewContent: {
        flexGrow: 1,
    }
});

export default App;