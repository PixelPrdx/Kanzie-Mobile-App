import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import { BlurView } from 'expo-blur';


const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'coffee', name: 'Kahve & Cafe', icon: 'cafe-outline' },
    { id: 'bar', name: 'Bar & Pub', icon: 'wine-outline' },
    { id: 'restaurant', name: 'Restoran', icon: 'restaurant-outline' },
    { id: 'cinema', name: 'Sinema', icon: 'film-outline' },
    { id: 'theater', name: 'Tiyatro', icon: ' megaphone-outline' },
    { id: 'museum', name: 'Müze & Sergi', icon: 'color-palette-outline' },
    { id: 'nature', name: 'Doğa & Park', icon: 'leaf-outline' },
    { id: 'sport', name: 'Spor', icon: 'fitness-outline' },
    { id: 'nightlife', name: 'Gece Hayatı', icon: 'moon-outline' },
    { id: 'shopping', name: 'Alışveriş', icon: 'cart-outline' },
];

export default function OnboardingScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [step, setStep] = useState(1);
    const totalSteps = 5; // Reduced from 6 since we removed distance

    // State for all onboarding data
    const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState('');
    const [city, setCity] = useState('');

    const [budget, setBudget] = useState<string[]>([]);
    const [social, setSocial] = useState<string[]>([]);
    const [frequency, setFrequency] = useState<string[]>([]);

    const [time, setTime] = useState<string[]>([]);
    const [atmosphere, setAtmosphere] = useState<string[]>([]);

    const [specialPrefs, setSpecialPrefs] = useState({
        petFriendly: false,
        outdoor: false,
        nonSmoking: false,
        accessibility: false
    });

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else handleFinish();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            const userId = authService.getUserId();
            if (!userId) return;

            const payload = {
                birthDate: birthDate.toISOString(),
                gender,
                city,
                interests: selectedInterests,
                budgetPreference: budget.join(','),
                socialPreference: social.join(','),
                timePreference: time.join(','),
                atmospherePreference: atmosphere.join(','),
                petFriendly: specialPrefs.petFriendly,
                outdoorPreference: specialPrefs.outdoor,
                nonSmoking: specialPrefs.nonSmoking,
                accessibilityNeeded: specialPrefs.accessibility
            };

            await apiService.post(`/Onboarding/${userId}/complete`, payload);

            // Onboarding tamamlandı markasını yerel olarak da güncelleyebiliriz veya 
            // direkt ana sayfaya yönlendirebiliriz.
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Onboarding failed:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string, state: string[], setState: (val: string[]) => void) => {
        if (state.includes(id)) {
            setState(state.filter(i => i !== id));
        } else {
            setState([...state, id]);
        }
    };

    const toggleInterest = (id: string) => toggleSelection(id, selectedInterests, setSelectedInterests);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Temel Bilgiler</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.tabIconDefault }]}>Seni biraz tanıyalım</Text>

                        <Text style={[styles.label, { color: theme.text }]}>Doğum Tarihin</Text>

                        {Platform.OS === 'web' ? (
                            <input
                                style={{
                                    height: 56,
                                    borderRadius: 16,
                                    padding: '0 20px',
                                    marginBottom: 10,
                                    backgroundColor: theme.card,
                                    color: theme.text,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 16,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit'
                                } as any}
                                type="date"
                                value={birthDate.toISOString().split('T')[0]}
                                onChange={(e: any) => setBirthDate(new Date(e.target.value))}
                            />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.inputField, { backgroundColor: theme.card }]}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={{ color: theme.text }}>{birthDate.toLocaleDateString('tr-TR')}</Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={birthDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event: any, date?: Date) => {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            if (date) setBirthDate(date);
                                        }}
                                    />
                                )}
                            </>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Cinsiyet</Text>
                        <View style={styles.optionsRow}>
                            {['Erkek', 'Kadın', 'Belirtmek İstemiyorum'].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: gender === item ? 'transparent' : theme.card,
                                            borderColor: gender === item ? theme.tint : theme.border,
                                            borderWidth: 1
                                        }
                                    ]}
                                    onPress={() => setGender(item)}
                                >
                                    <LinearGradient
                                        colors={theme.primaryGradient as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFill}
                                    />

                                    <Text style={{ color: gender === item ? 'white' : theme.text, fontWeight: '600' }}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Nerede Yaşıyorsun?</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.tabIconDefault }]}>Sana yakın mekanları önerebilmek için</Text>

                        <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
                            <Ionicons name="location-outline" size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Şehir (Örn: İstanbul)"
                                placeholderTextColor={theme.tabIconDefault}
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Hayat Tarzın</Text>

                        <Text style={[styles.label, { color: theme.text }]}>Bütçe Tercihin</Text>
                        <View style={styles.optionsRow}>
                            {[
                                { id: 'Economy', label: 'Ekonomik 💰' },
                                { id: 'Medium', label: 'Orta 💰💰' },
                                { id: 'Premium', label: 'Premium 💰💰💰' }
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor: budget.includes(item.id) ? theme.tint : theme.card }
                                    ]}
                                    onPress={() => toggleSelection(item.id, budget, setBudget)}
                                >
                                    <Text style={{ color: budget.includes(item.id) ? 'white' : theme.text }}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Nasıl Takılmayı Seversin?</Text>
                        <View style={styles.optionsRow}>
                            {[
                                { id: 'Solo', label: 'Tek Başıma' },
                                { id: 'Couple', label: 'Partnerimle' },
                                { id: 'SmallGroup', label: 'Arkadaş Grubu' },
                                { id: 'LargeGroup', label: 'Kalabalık' }
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor: social.includes(item.id) ? theme.tint : theme.card }
                                    ]}
                                    onPress={() => toggleSelection(item.id, social, setSocial)}
                                >
                                    <Text style={{ color: social.includes(item.id) ? 'white' : theme.text }}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Zaman Tercihi</Text>
                        <View style={styles.optionsRow}>
                            {[
                                { id: 'Day', label: 'Gündüz ☀️' },
                                { id: 'Night', label: 'Gece 🌙' },
                                { id: 'Both', label: 'Her Zaman 🌗' }
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor: time.includes(item.id) ? theme.tint : theme.card }
                                    ]}
                                    onPress={() => toggleSelection(item.id, time, setTime)}
                                >
                                    <Text style={{ color: time.includes(item.id) ? 'white' : theme.text }}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Hassasiyetlerin</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.tabIconDefault }]}>Senin için ne önemli?</Text>

                        <View style={styles.checkGrid}>
                            {[
                                { id: 'petFriendly', label: 'Evcil Hayvan Dostu 🐕', icon: 'paw' },
                                { id: 'outdoor', label: 'Açık Hava Tercihi 🌿', icon: 'leaf' },
                                { id: 'nonSmoking', label: 'Sigarasız Alan 🚭', icon: 'no-smoking' },
                                { id: 'accessibility', label: 'Engelli Erişimi ♿', icon: 'body' }
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.checkButton,
                                        {
                                            backgroundColor: specialPrefs[item.id as keyof typeof specialPrefs] ? theme.tint : theme.card,
                                            borderColor: theme.tint,
                                            borderWidth: specialPrefs[item.id as keyof typeof specialPrefs] ? 0 : 1
                                        }
                                    ]}
                                    onPress={() => setSpecialPrefs({ ...specialPrefs, [item.id]: !specialPrefs[item.id as keyof typeof specialPrefs] })}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color={specialPrefs[item.id as keyof typeof specialPrefs] ? 'white' : theme.tint}
                                    />
                                    <Text style={[
                                        styles.checkText,
                                        { color: specialPrefs[item.id as keyof typeof specialPrefs] ? 'white' : theme.text }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 5:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>İlgi Alanların</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.tabIconDefault }]}>Seni heyecanlandıran şeyleri seç</Text>

                        <View style={styles.interestsGrid}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.interestItem,
                                        {
                                            backgroundColor: selectedInterests.includes(cat.id) ? theme.tint : theme.card,
                                        }
                                    ]}
                                    onPress={() => toggleInterest(cat.id)}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={20}
                                        color={selectedInterests.includes(cat.id) ? 'white' : theme.text}
                                    />
                                    <Text style={[
                                        styles.interestText,
                                        { color: selectedInterests.includes(cat.id) ? 'white' : theme.text }
                                    ]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <LinearGradient
                        colors={theme.primaryGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]}
                    />

                </View>
                <Text style={[styles.progressText, { color: theme.tabIconDefault }]}>ADIM {step} / {totalSteps}</Text>
            </View>


            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderStepContent()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 ? (
                    <TouchableOpacity
                        style={[styles.backButton, { borderColor: theme.border }]}
                        onPress={prevStep}
                        disabled={loading}
                    >
                        <Text style={[styles.backButtonText, { color: theme.tabIconDefault }]}>Geri</Text>
                    </TouchableOpacity>
                ) : <View style={{ flex: 1 }} />}

                <GradientButton
                    title={step === totalSteps ? 'Tamamla' : 'İleri'}
                    onPress={nextStep}
                    loading={loading}
                    style={styles.nextButton}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    progressContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBar: {
        height: '100%',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 24,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputField: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 20,
    },
    inputIcon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    checkGrid: {
        gap: 15,
    },
    checkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 15,
    },
    checkText: {
        fontSize: 16,
        fontWeight: '600',
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    interestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        gap: 8,
    },
    interestText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        gap: 15,
    },
    backButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    nextButton: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
