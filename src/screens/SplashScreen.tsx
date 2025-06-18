import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('VerifyFace');
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // Coloca tu logo en src/assets/logo.png
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <Text style={styles.text}>Bienvenido a la empresa</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  text: { fontSize: 20, fontWeight: 'bold', color: '#333' },
});