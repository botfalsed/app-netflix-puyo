import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, useWindowDimensions, Alert, Modal, TextInput, Switch } from 'react-native';
import { getProfiles, createProfile } from '../services/profiles';
import { getToken } from '../services/token';
import ProfileHome from '../components/ProfileHome';

const ProfilesScreen: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();

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

  const onSelectProfile = (profile: any) => {
    // Show an in-screen section for the selected profile instead of navigating away
    setActiveProfile(profile);
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
  // If a profile is active, show the profile-specific section (new apartado)
  if (activeProfile) {
    return (
      <View style={[styles.container, { paddingTop: 24, alignItems: 'flex-start' }]}>
        <ProfileHome profile={activeProfile} onBack={() => setActiveProfile(null)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>¿Quién está viendo ahora?</Text>
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
                <View style={[styles.addCircle, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
                  <Text style={styles.plus}>+</Text>
                </View>
                <Text style={styles.nameSmall}>Agregar perfil</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity style={styles.card} onPress={() => onSelectProfile(item)}>
              <Image source={{ uri: item.avatar || 'https://via.placeholder.com/300x300?text=Perfil' }} style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: 8 }]} />
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
              <Image source={{ uri: newProfileAvatar || 'https://via.placeholder.com/80' }} style={modalStyles.avatar} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', paddingVertical: 40, alignItems: 'center' },
  header: { color: 'white', fontSize: 48, fontWeight: '900', alignSelf: 'flex-start', marginLeft: 40, marginBottom: 24 },
  error: { color: 'salmon', marginBottom: 10 },
  list: { paddingHorizontal: 40 },
  card: { flex: 1, alignItems: 'center', margin: 12, minWidth: 120 },
  avatar: { marginBottom: 10, backgroundColor: '#222' },
  name: { color: 'white', fontSize: 16, marginTop: 6 },
  nameSmall: { color: '#CFCFCF', fontSize: 14, marginTop: 6 },
  addCircle: { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
  plus: { color: 'white', fontSize: 48, lineHeight: 52 },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '70%', maxWidth: 700, backgroundColor: '#161616', padding: 24, borderRadius: 8, position: 'relative' },
  close: { position: 'absolute', right: 12, top: 12, zIndex: 10 },
  closeText: { color: '#fff', fontSize: 22 },
  title: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 6, marginRight: 12, backgroundColor: '#333' },
  input: { flex: 1, backgroundColor: '#222', color: 'white', padding: 12, borderRadius: 6 },
  separator: { height: 1, backgroundColor: '#222', marginVertical: 18 },
  kidsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  kidsTitle: { color: 'white', fontWeight: '700' },
  kidsSubtitle: { color: '#CFCFCF', fontSize: 12 },
  save: { backgroundColor: 'white', padding: 14, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  saveText: { color: 'black', fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 8 },
  cancelText: { color: '#CFCFCF' },
});

export default ProfilesScreen;
