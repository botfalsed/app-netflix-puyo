import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  StyleSheet, 
  useWindowDimensions, 
  Alert, 
  Modal, 
  TextInput, 
  Switch,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getProfiles, createProfile, setActiveProfile as saveActiveProfile } from '../../services/profiles';
import { getToken } from '../../services/token';
import ProfileHome from '../../components/profiles/ProfileHome';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const ProfilesScreen: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const avatarSize = Math.min(140, Math.floor(width / 6));

  const load = async () => {
    setError(null);
    try {
      const token = getToken();
      if (!token) return setError('No token');
      const res = await getProfiles(token);
      if (res.profiles) setProfiles(res.profiles);
      else setError(res.error || 'unknown');
    } catch (err: any) {
      setError(err.message || 'network_error');
    }
  };

  useEffect(() => { load(); }, []);

  const [activeProfile, setActiveProfile] = useState<any | null>(null);

  const onSelectProfile = async (profile: any) => {
    console.log('Profile selected:', profile);
    try {
      // Set the active profile and navigate to home screen
      setActiveProfile(profile);
      await saveActiveProfile(profile);
      console.log('Profile saved, navigating...');
      router.replace('/(main)/(tabs)');
    } catch (error) {
      console.error('Error selecting profile:', error);
      setError('Error al seleccionar perfil');
    }
  };

  const onAddProfile = async () => {
    // open modal instead
    if (profiles.length >= 5) return Alert.alert('Límite', 'No puedes crear más de 5 perfiles');
    setNewProfileName(`Perfil ${profiles.length + 1}`);
    setNewProfileKids(false);
    setShowAdd(true);
  };

  // modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileKids, setNewProfileKids] = useState(false);
  const [newProfileAvatar] = useState<string | null>(null);

  const saveNewProfile = async () => {
    if (!newProfileName || !newProfileName.trim()) return setError('El nombre del perfil es obligatorio');
    try {
      const token = getToken();
      if (!token) return setError('No token');
      const res = await createProfile(token, { name: newProfileName.trim(), avatar: newProfileAvatar || null, is_kids: newProfileKids });
      if (res.profile) {
        setShowAdd(false);
        load();
      } else {
        setError(res.error || 'unknown');
      }
    } catch (err: any) {
      setError(err.message || 'network_error');
    }
  };

  const numColumns = Math.max(2, Math.min(4, Math.floor(width / 220)));

  const dataWithAdd = [...profiles];
  if (profiles.length < 5) dataWithAdd.push({ __add: true, id: 'add' });

  return (
    <SafeAreaWrapper>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#141414', '#000000']}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>¿Quién está viendo ahora?</Text>
        </View>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={dataWithAdd}
          keyExtractor={(i) => String(i.id)}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.__add) {
              return (
                <TouchableOpacity style={styles.card} onPress={onAddProfile}>
                  <View style={[styles.addCircle, { width: avatarSize, height: avatarSize, borderRadius: 8 }]}>
                    <Text style={styles.plus}>+</Text>
                  </View>
                  <Text style={styles.nameSmall}>Agregar perfil</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity 
                style={styles.card} 
                onPress={() => onSelectProfile(item)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: item.avatar || 'https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAxyWzo6QW_ZnPz1IZLqlmNfK-t4L1VIeV1DY00JhLo_LMVFp936keDxj-V5UELAVJrU--iUUY2MaDxQSSO-0qw.png?r=e6e' }} 
                    style={[styles.avatar, { width: avatarSize, height: avatarSize }]} 
                  />
                  <View style={styles.avatarOverlay} />
                </View>
                <Text style={styles.name}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Modal visible={showAdd} transparent animationType="fade">
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.card}>
              <TouchableOpacity style={modalStyles.close} onPress={() => setShowAdd(false)}>
                <Text style={modalStyles.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={modalStyles.title}>Agrega un perfil</Text>
              <View style={modalStyles.row}>
                <Image source={{ uri: newProfileAvatar || 'https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdpkabKqQAxyWzo6QW_ZnPz1IZLqlmNfK-t4L1VIeV1DY00JhLo_LMVFp936keDxj-V5UELAVJrU--iUUY2MaDxQSSO-0qw.png?r=e6e' }} style={modalStyles.avatar} />
                <TextInput value={newProfileName} onChangeText={setNewProfileName} placeholder="Nombre" placeholderTextColor="#999" style={modalStyles.input} />
              </View>
              <View style={modalStyles.separator} />
              <View style={modalStyles.kidsRow}>
                <View>
                  <Text style={modalStyles.kidsTitle}>Perfil de niños</Text>
                  <Text style={modalStyles.kidsSubtitle}>Ver solo contenido infantil</Text>
                </View>
                <Switch value={newProfileKids} onValueChange={setNewProfileKids} />
              </View>

              <TouchableOpacity style={modalStyles.save} onPress={saveNewProfile}>
                <Text style={modalStyles.saveText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.cancel} onPress={() => setShowAdd(false)}>
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingVertical: 60, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center'
  },
  header: { 
    color: 'white', 
    fontSize: 48, 
    fontWeight: '400', 
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: -0.5
  },
  error: { 
    color: '#e50914', 
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center'
  },
  list: { 
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: { 
    alignItems: 'center', 
    margin: 16, 
    minWidth: 120,
    maxWidth: 160
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12
  },
  avatar: { 
    borderRadius: 8,
    backgroundColor: '#333'
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent'
  },
  name: { 
    color: '#e5e5e5', 
    fontSize: 16, 
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 120
  },
  nameSmall: { 
    color: '#999999', 
    fontSize: 14, 
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 12
  },
  addCircle: { 
    backgroundColor: '#333333', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12
  },
  plus: { 
    color: '#999999', 
    fontSize: 48, 
    fontWeight: '300'
  },
});

const modalStyles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    width: '85%', 
    maxWidth: 600, 
    backgroundColor: '#141414', 
    padding: 32, 
    borderRadius: 8, 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  close: { 
    position: 'absolute', 
    right: 16, 
    top: 16, 
    zIndex: 10,
    padding: 8
  },
  closeText: { 
    color: '#fff', 
    fontSize: 24,
    fontWeight: '300'
  },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '400', 
    textAlign: 'center', 
    marginBottom: 32,
    letterSpacing: -0.5
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    marginBottom: 24
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    backgroundColor: '#333' 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#333333', 
    color: 'white', 
    padding: 16, 
    borderRadius: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555555'
  },
  separator: { 
    height: 1, 
    backgroundColor: '#333333', 
    marginVertical: 24 
  },
  kidsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  kidsTitle: { 
    color: 'white', 
    fontWeight: '400',
    fontSize: 16
  },
  kidsSubtitle: { 
    color: '#999999', 
    fontSize: 14,
    marginTop: 4
  },
  save: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 4, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  saveText: { 
    color: 'black', 
    fontWeight: '600',
    fontSize: 16
  },
  cancel: { 
    alignItems: 'center', 
    padding: 12 
  },
  cancelText: { 
    color: '#999999',
    fontSize: 16
  },
});

export default ProfilesScreen;