import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    useWindowDimensions,
    FlatList,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import MovieModal from './MovieModal';

// Helper factories that create styles based on current width
const makeTendenciasStyles = (width: number, posterWidth: number, gap: number) => {
    const scaleFont = (size: number) => {
        const standardScreenWidth = 375;
        const rawScale = width / standardScreenWidth;
        const scale = Math.min(rawScale, 1.0);
        const newSize = size * scale;
        return Math.round(newSize);
    };

    const titleFont = scaleFont(18);
    const numberFont = Math.round(posterWidth * 0.9);
    const negativeMargin = -Math.round(posterWidth * 0.35);

    return StyleSheet.create({
        sectionContainer: {
            backgroundColor: 'black',
            paddingVertical: 20,
        },
        title: {
            color: 'white',
            fontSize: titleFont,
            fontWeight: 'bold',
            marginLeft: Math.max(width * 0.04, 12),
            marginBottom: 12,
        },
        listContainer: {
            // center first/last item
            paddingHorizontal: Math.max(12, Math.floor((width - posterWidth) / 2)),
            alignItems: 'center',
        },
        itemWrapper: {
            width: posterWidth,
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginRight: gap,
            position: 'relative',
        },
        rankingNumber: {
            // overlapping style: big number that partially sits behind the poster
            fontSize: numberFont,
            fontWeight: '900',
            color: '#000',
            textShadowColor: 'rgba(255, 255, 255, 0.9)',
            textShadowOffset: { width: -2, height: 0 },
            textShadowRadius: 0,
            lineHeight: numberFont,
            marginRight: negativeMargin,
            zIndex: 3,
        },
        poster: {
            zIndex: 2,
            overflow: 'hidden',
            borderRadius: 6,
        },
    });
};

const makeMotivosStyles = (width: number) => {
    const scaleFont = (size: number) => {
        const standardScreenWidth = 375;
        const rawScale = width / standardScreenWidth;
        const scale = Math.min(rawScale, 1.0);
        const newSize = size * scale;
        return Math.round(newSize);
    };

    return StyleSheet.create({
        sectionContainer: {
            backgroundColor: 'black',
            paddingVertical: 20,
            paddingHorizontal: width * 0.04,
        },
        title: {
            color: 'white',
            fontSize: scaleFont(18),
            fontWeight: 'bold',
            marginBottom: 12,
        },
        cardGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        card: {
            width: '48%',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            minHeight: 140,
            justifyContent: 'space-between',
        },
        cardContent: {
            flex: 1,
        },
        cardTitle: {
            color: 'white',
            fontSize: scaleFont(15),
            fontWeight: '700',
            marginBottom: 6,
        },
        cardDescription: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: scaleFont(12),
            lineHeight: scaleFont(16),
        },
        iconContainer: {
            alignSelf: 'flex-end',
            marginTop: 10,
        },
        iconBox: {
            width: 50,
            height: 50,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        iconCircle: {
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
        },
        tvScreen: {
            width: 28,
            height: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            marginBottom: 2,
        },
        tvStand: {
            width: 16,
            height: 6,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 1,
        },
        downloadArrow: {
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: 15,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: 'white',
            marginTop: -2,
        },
        popcornIcon: {
            fontSize: 26,
        },
        kidsIcon: {
            fontSize: 26,
        },
    });
};

// --- Componente para la sección de Tendencias ---
const TendenciasSection = () => {
    const { width } = useWindowDimensions();
    const POSTER_WIDTH = Math.min(220, Math.max(120, Math.floor(width * 0.16)));
    const GAP = Math.max(12, Math.floor(width * 0.03));
    const overlap = Math.round(POSTER_WIDTH * 0.35);
    const sidePadding = Math.max(12, Math.floor((width - POSTER_WIDTH) / 2 - Math.round(overlap * 0.75)));
    const tendenciasStyles = makeTendenciasStyles(width, POSTER_WIDTH, GAP);

    // Use bundled/local assets only (no external API calls)
    const staticItems = [
        { id: 1, title: 'Merlina', image: require('../assets/images/merlina.jpg') },
        { id: 2, title: 'El Deseo del Amor', image: require('../assets/images/deceos.jpg') },
        { id: 3, title: 'Juegos', image: require('../assets/images/juegoCalamar.jpg') },
        { id: 4, title: 'One Piece', image: require('../assets/images/one piece.jpg') },
        { id: 5, title: 'Kimetsu', image: require('../assets/images/kimetsu.jpg') },
    ];

    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={tendenciasStyles.sectionContainer}>
            <Text style={tendenciasStyles.title}>Tendencias</Text>

            <FlatList
                horizontal
                data={staticItems}
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[tendenciasStyles.listContainer, { paddingHorizontal: sidePadding }]}
                decelerationRate="fast"
                snapToInterval={POSTER_WIDTH + GAP}
                snapToAlignment="center"
                renderItem={({ item }) => (
                    <TouchableOpacity style={tendenciasStyles.itemWrapper} onPress={() => { setSelectedMovie(item); setModalVisible(true); }}>
                        <Text style={[tendenciasStyles.rankingNumber]}>{item.id}</Text>
                        <ImageBackground
                            source={item.image}
                            style={[tendenciasStyles.poster, { width: POSTER_WIDTH, height: POSTER_WIDTH * 1.5 }]}
                            imageStyle={{ borderRadius: 6 }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />

            <MovieModal movie={selectedMovie} visible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
    );
};



// --- Componente para la sección de Motivos ---
const MotivosSection = () => {
    const motivos = [
        { 
            title: "Disfruta en tu TV", 
            description: "Ve en smart TV, PlayStation, Xbox, Chromecast, Apple TV, reproductores de Blu-ray y más.", 
            icon: 'tv',
            gradient: ['#2D1B69', '#1F1145']
        },
        { 
            title: "Descarga tus series para verlas offline", 
            description: "Guarda tu contenido favorito y siempre tendrás algo para ver.", 
            icon: 'download',
            gradient: ['#5C1A3D', '#3D1129']
        },
        { 
            title: "Disfruta donde quieras", 
            description: "Películas y series ilimitadas en tu teléfono, tablet, laptop y TV.", 
            icon: 'devices',
            gradient: ['#8B1538', '#5C0E25']
        },
        { 
            title: "Crea perfiles para niños", 
            description: "Los niños vivirán aventuras con sus personajes favoritos en un espacio diseñado exclusivamente para ellos, gratis con tu membresía.", 
            icon: 'kids',
            gradient: ['#6B2D5C', '#471D3D']
        },
    ];

    const IconComponent: React.FC<{ type: string }> = ({ type }) => {
        switch(type) {
            case 'tv':
                return (
                    <View style={motivosStyles.iconContainer}>
                        <View style={[motivosStyles.iconBox, { backgroundColor: '#6B46C1' }]}>
                            <View style={motivosStyles.tvScreen} />
                            <View style={motivosStyles.tvStand} />
                        </View>
                    </View>
                );
            case 'download':
                return (
                    <View style={motivosStyles.iconContainer}>
                        <View style={[motivosStyles.iconCircle, { backgroundColor: '#E91E63' }]}>
                            <View style={motivosStyles.downloadArrow} />
                        </View>
                    </View>
                );
            case 'devices':
                return (
                    <View style={motivosStyles.iconContainer}>
                        <View style={[motivosStyles.iconBox, { backgroundColor: '#E91E63' }]}>
                            <Text style={motivosStyles.popcornIcon}>🍿</Text>
                        </View>
                    </View>
                );
            case 'kids':
                return (
                    <View style={motivosStyles.iconContainer}>
                        <View style={[motivosStyles.iconBox, { backgroundColor: '#EC407A' }]}>
                            <Text style={motivosStyles.kidsIcon}>🎲</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    const { width } = useWindowDimensions();
    const motivosStyles = makeMotivosStyles(width);

    return (
        <View style={motivosStyles.sectionContainer}>
            <Text style={motivosStyles.title}>Más motivos para unirte</Text>

            <View style={motivosStyles.cardGrid}>
                {motivos.map((motivo, index) => (
                    <View 
                        key={index} 
                        style={[
                            motivosStyles.card,
                            { 
                                backgroundColor: motivo.gradient[0],
                            }
                        ]}
                    >
                        <View style={motivosStyles.cardContent}>
                            <Text style={motivosStyles.cardTitle}>{motivo.title}</Text>
                            <Text style={motivosStyles.cardDescription}>{motivo.description}</Text>
                        </View>
                        <IconComponent type={motivo.icon} />
                    </View>
                ))}
            </View>
        </View>
    );
};



const ContentSection = () => (
    <View>
        <TendenciasSection />
        <MotivosSection />
    </View>
);

export default ContentSection;