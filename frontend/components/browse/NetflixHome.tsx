import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import HeroSection from './HeroSection';         // Importa la parte superior
import ContentSection from './ContentSection';   // Importa la parte de Tendencias y Motivos

const NetflixMainScreen: React.FC<{ showHero?: boolean }> = ({ showHero = true }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0)" translucent={true} />
            
            <ScrollView style={styles.scrollView}>
                {/* SECCIÓN 1: La parte superior con la imagen de fondo y el formulario */}
                {showHero ? <HeroSection /> : null}
                
                {/* SECCIÓN 2: Tendencias y Motivos para Unirte */}
                <ContentSection />

                {/* Pie de página o espacio final si lo necesitas */}
                <View style={{ height: 50, backgroundColor: 'black' }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'black', // Asegura que el fondo del scroll sea negro
    },
});

export default NetflixMainScreen;

// NOTA: Recuerda que para ejecutar esto, debes exportar 'NetflixMainScreen' en tu App.js
// Ejemplo: export default NetflixMainScreen;