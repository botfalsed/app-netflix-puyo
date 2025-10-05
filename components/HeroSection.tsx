import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    Platform,
    StatusBar,
} from 'react-native';
import LoginModal from './LoginModal';
import { useRouter } from 'expo-router';
import { setToken } from '../services/token';

const backgroundImage = require('../assets/images/fondoNet.jpg');

const makeStyles = (width: number, height: number, topPadding: number) => {
    const scaleFont = (size: number) => {
        const standardScreenWidth = 375;
        const rawScale = width / standardScreenWidth;
        const scale = Math.min(rawScale, 1.05);
        const newSize = size * scale;
        return Math.round(newSize);
    };

    return StyleSheet.create({
        backgroundImage: { minHeight: height * 0.9, width: width },
        overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', paddingTop: topPadding, paddingBottom: 20 },
        content: { flex: 1 },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: width * 0.05, marginBottom: height * 0.05 },
        logo: { color: '#E50914', fontSize: scaleFont(24), fontWeight: 'bold' },
        headerActions: { flexDirection: 'row', alignItems: 'center' },
        language: { color: 'white', fontSize: scaleFont(14), paddingHorizontal: 10 },
        loginButton: { backgroundColor: '#E50914', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 3 },
        loginButtonText: { color: 'white', fontSize: scaleFont(14), fontWeight: 'bold' },
        hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: width * 0.05 },
        heroContentContainer: { alignItems: 'center', width: '80%', maxWidth: 600 },
        title: { color: 'white', fontSize: scaleFont(32), fontWeight: '900', textAlign: 'center', marginBottom: 10, lineHeight: scaleFont(40) },
        subtitle: { color: 'white', fontSize: scaleFont(18), textAlign: 'center', marginBottom: 20 },
        promptText: { color: '#C0C0C0', fontSize: scaleFont(14), textAlign: 'center', marginBottom: 10, maxWidth: 400 },
        formWrapper: { flexDirection: 'row', width: '100%', maxWidth: 600, height: 50, marginTop: 15 },
        textInput: { flex: 1, backgroundColor: 'rgba(45,45,45,0.9)', paddingHorizontal: 15, fontSize: scaleFont(14), height: '100%', color: 'white', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
        button: { backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25, height: '100%', borderTopRightRadius: 3, borderBottomRightRadius: 3 },
        buttonText: { color: 'white', fontSize: scaleFont(18), fontWeight: 'bold' },
    });
};

const HeroSection: React.FC = () => {
    const [showLogin, setShowLogin] = useState(false);
    const { width, height } = useWindowDimensions();
    const topPadding = (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 40) + 10;
    const styles = makeStyles(width, height, topPadding);
    const router = useRouter();

    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>NETFLIX</Text>
                        <View style={styles.headerActions}>
                            <Text style={styles.language}>En Español</Text>
                            <TouchableOpacity style={styles.loginButton} onPress={() => setShowLogin(true)}>
                                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.hero}>
                        <View style={styles.heroContentContainer}>
                            <Text style={styles.title}>Películas y series ilimitadas y mucho más</Text>
                            <Text style={styles.subtitle}>A partir de S/ 28.90. Cancela cuando quieras.</Text>
                            <Text style={styles.promptText}>¿Quieres ver Netflix ya? Ingresa tu email para crear una cuenta o reiniciar la membresía de Netflix.</Text>

                            <View style={styles.formWrapper}>
                                <TextInput style={styles.textInput} placeholder="Email" placeholderTextColor="#8C8C8C" keyboardType="email-address" />
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>Comenzar →</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <LoginModal
                visible={showLogin}
                onClose={() => setShowLogin(false)}
                                        onLogin={(token) => {
                                        setToken(token);
                                        setShowLogin(false);
                                        try {
                                                router.push('/profiles');
                                        } catch {
                                                // fallback to location if router not available
                                                try {
                                                    if (typeof window !== 'undefined') {
                                                        const origin = window.location.origin || `${window.location.protocol}//${window.location.hostname}:19006`;
                                                        window.location.href = `${origin}/profiles`;
                                                    }
                                                } catch { /* no-op */ }
                                        }
                                }}
            />
        </ImageBackground>
    );
};

export default HeroSection;
