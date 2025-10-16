import React, { useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { getMovieVideos } from '../../services/tmdb';

const MovieModal: React.FC<{ visible: boolean; onClose: () => void; movie: any | null }> = ({ visible, onClose, movie }) => {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

  const openTrailer = async () => {
    try {
      if (!movie) return;
      if (videos.length === 0) {
        setLoading(true);
        const vs = await getMovieVideos(movie.id);
        setVideos(vs);
        setLoading(false);
      }

      // prefer YouTube trailer
      const yt = videos.find(v => v.site === 'YouTube' && /trailer/i.test(v.type));
      const anyVideo = videos.find(v => v.site === 'YouTube') || videos[0];
      const chosen = yt || anyVideo;
      if (!chosen) return alert('No trailer available');
      const url = chosen.site === 'YouTube' ? `https://www.youtube.com/watch?v=${chosen.key}` : chosen.key;
      Linking.openURL(url);
    } catch {
      setLoading(false);
      alert('Error al obtener el trailer');
    }
  };

  if (!movie) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.close} onPress={onClose}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
          <View style={styles.top}>
            <Image source={movie.backdrop_path ? { uri: movie.backdrop_path } : require('../../assets/images/merlina.jpg')} style={styles.backdropImage} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.meta}>{movie.release_date ? movie.release_date.split('-')[0] : ''} • {movie.vote_average || ''}</Text>
            <Text style={styles.overview}>{movie.overview}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.trailerBtn} onPress={openTrailer}>
                <Text style={styles.trailerText}>Ver trailer</Text>
              </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator color="white" /> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', maxWidth: 900, backgroundColor: '#111', borderRadius: 8, overflow: 'hidden' },
  close: { position: 'absolute', right: 12, top: 12, zIndex: 10 },
  closeText: { color: 'white', fontSize: 20 },
  top: { height: 220, backgroundColor: '#000' },
  backdropImage: { width: '100%', height: '100%' },
  body: { padding: 18 },
  title: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  meta: { color: '#CFCFCF', marginBottom: 12 },
  overview: { color: '#DDD', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  trailerBtn: { backgroundColor: '#E50914', padding: 12, borderRadius: 6 },
  trailerText: { color: 'white', fontWeight: '700' },
});

export default MovieModal;
