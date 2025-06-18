import React, { useRef, useState, useEffect } from 'react';
import { View, Image, Alert, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import { ActivityIndicator, FAB, ProgressBar, useTheme, Appbar } from 'react-native-paper';
import { identifyFace } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');
const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyFace'>;

export default function VerifyFaceScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find((d: CameraDevice) => d.position === 'front');
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission() as string;
      setHasPermission(status === 'authorized' || status === 'granted');
    })();
  }, []);

  const _goBack = () => navigation.goBack();
  const _handleSearch = () => {};
  const _handleMore = () => {};

  const handleVerify = async () => {
    setProgress(0);
    setLoading(true);
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({});
        setImageUri('file://' + photo.path);
        setProgress(0.3);

        // Simula progreso mientras espera la respuesta real
        const progressInterval = setInterval(() => {
          setProgress(prev => (prev < 0.9 ? prev + 0.1 : prev));
        }, 200);

        const res = await identifyFace({ uri: 'file://' + photo.path, type: 'image/jpeg', name: 'face.jpg' });
        clearInterval(progressInterval);
        setProgress(1);
        setLoading(false);
        navigation.replace('UserData', { user: res.data.user });
      } catch (err) {
        setLoading(false);
        setProgress(0);
        const errorMessage =
          err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
            ? (err.response.data.message as string)
            : 'Error en la verificación facial';
        Alert.alert('Error', errorMessage);
      }
    } else {
      setLoading(false);
      Alert.alert('Error', 'No se pudo acceder a la cámara');
    }
  };

  if (!device || !hasPermission) {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Verificación de Rostro" />
          <Appbar.Action icon="magnify" onPress={() => {}} />
          <Appbar.Action icon={MORE_ICON} onPress={() => {}} />
        </Appbar.Header>
        <View style={styles.container}>
          <Text style={styles.permissionText}>Permiso de cámara requerido</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={_goBack} />
        <Appbar.Content title="Verificación de Rostro" />
        <Appbar.Action icon="magnify" onPress={_handleSearch} />
        <Appbar.Action icon={MORE_ICON} onPress={_handleMore} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text style={styles.title}>Verificación de Rostro</Text>
        <View style={styles.ovalContainer}>
          <View style={styles.oval}>
            {!imageUri ? (
              <Camera
                ref={cameraRef}
                style={styles.image}
                device={device}
                isActive={true}
                photo={true}
              />
            ) : (
              <Image source={{ uri: imageUri }} style={styles.image} />
            )}
          </View>
        </View>
        <View style={styles.progressContainer}>
          {loading && <Text style={styles.processingText}>Procesando</Text>}
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
        {loading && (
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 16 }}
          />
        )}
        <FAB
          style={styles.fab}
          icon="camera"
          onPress={handleVerify}
          color="#fff"
          disabled={loading}
          accessibilityLabel="Verificar Rostro"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  ovalContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: width * 0.65,
    height: width * 0.9,
    borderRadius: width * 0.325,
    borderWidth: 3,
    borderColor: '#007bff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  progressContainer: {
    width: width * 0.65,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ddd',
    width: '100%',
  },
  progressText: {
    marginTop: 4,
    fontSize: 16,
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 32,
    bottom: 120,
    backgroundColor: '#007bff',
    elevation: 4,
  },
  permissionText: {
    fontSize: 18,
    color: '#B00020',
    textAlign: 'center',
    marginTop: 32,
  },
  processingText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
});