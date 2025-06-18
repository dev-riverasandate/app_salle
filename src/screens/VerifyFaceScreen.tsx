import React, { useRef, useState, useEffect } from 'react';
import { View, Image, Alert, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { ActivityIndicator, ProgressBar, useTheme, Appbar } from 'react-native-paper'; // FAB import removed
import { identifyFace } from '../services/api';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
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
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [faceDetectedUi, setFaceDetectedUi] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const isProcessingPhotoRef = useRef(false);
  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find((d: CameraDevice) => d.position === 'front');
  const theme = useTheme();

  // Initialize face detector
  const { detectFaces } = useFaceDetector({});

  // Dynamic style for oval border based on face detection
  const dynamicOvalStyle = {
    ...styles.oval,
    borderColor: faceDetectedUi ? '#4CAF50' : '#007bff', // Green when face detected, blue otherwise
  };

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission() as string;
      setHasPermission(status === 'authorized' || status === 'granted');
    })();
  }, []);

  const _goBack = () => navigation.goBack();
  const _handleSearch = () => {};
  const _handleMore = () => {};

  const triggerAutomaticPhotoCapture = async () => {
    if (isProcessingPhotoRef.current || !cameraRef.current) return;

    isProcessingPhotoRef.current = true;
    setIsProcessingPhoto(true);
    setLoading(true);
    setProgress(0);
    // setFaceDetectedUi(true); // Removed: This will be handled by the frame processor

    try {
      console.log('Taking photo automatically...');
      const photo = await cameraRef.current.takePhoto({});
      setImageUri('file://' + photo.path);
      setProgress(0.3);

      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 0.9 ? prev + 0.1 : prev));
      }, 200);

      console.log('Sending photo to API...');
      const res = await identifyFace({ uri: 'file://' + photo.path, type: 'image/jpeg', name: 'face.jpg' });
      clearInterval(progressInterval);
      setProgress(1);
      console.log('API success, navigating to UserData');
      navigation.replace('UserData', { user: res.data.user });
    } catch (err) {
      console.error('Automatic photo capture or API error:', err);
      const errorMessage =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
          ? (err.response.data.message as string)
          : 'Error en la verificación facial automática';
      Alert.alert('Error', errorMessage);
      setProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsProcessingPhoto(false);
        isProcessingPhotoRef.current = false;
        setImageUri(null);
        // setFaceDetectedUi(false); // Removed: Frame processor will handle this
        console.log('Ready for new face detection.');
      }, 5000);
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (isProcessingPhotoRef.current) {
      if (faceDetectedUi) {
        Worklets.runOnJS(setFaceDetectedUi)(false);
      }
      return;
    }

    const detectedFaces = detectFaces(frame);
    if (detectedFaces && detectedFaces.length > 0) {
      if (!faceDetectedUi) {
        Worklets.runOnJS(setFaceDetectedUi)(true);
      }
      isProcessingPhotoRef.current = true;
      Worklets.runOnJS(triggerAutomaticPhotoCapture)();
    } else {
      if (faceDetectedUi) {
        Worklets.runOnJS(setFaceDetectedUi)(false);
      }
    }
  }, [detectFaces, faceDetectedUi]);

  // const handleVerify = async () => { ... } // Function removed

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
          <View style={dynamicOvalStyle}>
            {!imageUri ? (
              <Camera
                ref={cameraRef}
                style={styles.image}
                device={device}
                isActive={true}
                photo={true}
                frameProcessor={frameProcessor}
                frameProcessorFps={3}
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
        {/* <FAB ... /> component removed */}
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
  // fab: { ... } style definition removed
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