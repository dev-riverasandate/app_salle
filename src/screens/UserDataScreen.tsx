import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Vibration } from 'react-native';
import { Card, Text, Snackbar, Button, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const COLOR_AZUL = '#003366';
const COLOR_ROJO = '#B00020';

type Props = NativeStackScreenProps<RootStackParamList, 'UserData'>;

export default function UserDataScreen({ route, navigation }: Props) {
  const { user } = route.params;
  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade-in y escala animada al entrar
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    // Vibración ligera al mostrar la pantalla
    Vibration.vibrate(60);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.root}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Card style={styles.card} elevation={5}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Icon
              size={72}
              icon="check-circle"
              color="#fff"
              style={styles.avatar}
              accessibilityLabel="Usuario reconocido exitosamente"
            />
            <Text style={styles.welcome}>¡Bienvenido, usuario reconocido!</Text>
            <Text style={styles.title} accessibilityLabel="Título de usuario reconocido">
              Usuario Reconocido
            </Text>
            <View style={styles.infoRow}>
              <Avatar.Icon size={32} icon="account" color="#fff" style={styles.infoIcon} />
              <Text style={styles.infoText}>Matrícula: <Text style={{ color: COLOR_AZUL }}>{user.matricula}</Text></Text>
            </View>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('VerifyFace')}
          icon="arrow-left"
          accessibilityLabel="Regresar"
          labelStyle={{ fontSize: 18, color: '#fff' }}
        >
          Regresar
        </Button>
      </Animated.View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: COLOR_AZUL }}
      >
        Usuario reconocido correctamente
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: '#f8fafd',
    shadowColor: COLOR_AZUL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    width: 340,
    maxWidth: '100%',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: COLOR_AZUL,
    marginBottom: 12,
    elevation: 6,
  },
  welcome: {
    fontSize: 18,
    color: COLOR_ROJO,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLOR_AZUL,
    marginBottom: 18,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  infoIcon: {
    backgroundColor: COLOR_AZUL,
    marginRight: 10,
    elevation: 4,
  },
  infoText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
    borderRadius: 30,
    backgroundColor: COLOR_ROJO,
    elevation: 6,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
});