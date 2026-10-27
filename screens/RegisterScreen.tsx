
import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { NewPunch, PunchKind, RootStackParamList } from '../types';
import { punchRepository } from '../data/PunchRepository';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Registrar'>;

const kinds: PunchKind[] = [
  'Entrada',
  'Início do intervalo',
  'Fim do intervalo',
  'Saída',
];

export default function RegisterScreen({ navigation }: Props) {
  // Estados do formulário
  const [employee, setEmployee] = useState('');
  const [kind, setKind] = useState<PunchKind>('Entrada');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [photoLocation, setPhotoLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

 
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();
  const [busy, setBusy] = useState(false);

  const camera = useRef<CameraView>(null);

  // Abre a câmera
  async function openCamera() {
    try {
      const permission = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o uso da câmera nas configurações do aparelho para tirar uma foto.'
        );
        return;
      }

      setCameraOpen(true);
    } catch {
      Alert.alert(
        'Câmera indisponível',
        'Não foi possível solicitar acesso à câmera. Tente novamente pelo navegador ou pelo aparelho.'
      );
    }
  }

 
  async function takePhoto() {
    try {
      const photo = await camera.current?.takePictureAsync({
        quality: 0.65,
      });

      if (!photo?.uri) {
        Alert.alert(
          'Foto não capturada',
          'A câmera não retornou uma imagem. Tente novamente.'
        );
        return;
      }

      let capturedLocation: {
        latitude: number | null;
        longitude: number | null;
      } = {
        latitude: null,
        longitude: null,
      };

      // Obtém a localização GPS
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.granted) {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          capturedLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch {

      }

      setPhotoLocation(capturedLocation);

      // Salva a foto conforme a plataforma
      if (Platform.OS === 'web') {
        setPhotoUri(photo.uri);
      } else {
        const { File, Paths } = await import('expo-file-system');

        const savedPhoto = new File(
          Paths.document,
          `punch-${Date.now()}.jpg`
        );

        await new File(photo.uri).copy(savedPhoto);

        setPhotoUri(savedPhoto.uri);
      }

      setCameraOpen(false);
    } catch {
      setCameraOpen(false);

      Alert.alert(
        'Falha na câmera',
        'Não foi possível tirar a foto. Tente novamente.'
      );
    }
  }

  async function save() {
    const cleanName = employee.trim();

    if (!cleanName) {
      Alert.alert(
        'Informe o funcionário',
        'Digite o nome ou identificador do funcionário.'
      );
      return;
    }

    setBusy(true);

    try {
      const data: NewPunch = {
        employee: cleanName,
        kind,
        photoUri,
        ...photoLocation,
      };

      await punchRepository.create(data);

  
      setEmployee('');
      setKind('Entrada');
      setPhotoUri(null);

      setPhotoLocation({
        latitude: null,
        longitude: null,
      });

      Alert.alert(
        'Ponto registrado',
        'O registro foi salvo neste aparelho.',
        [
          {
            text: 'Ver histórico',
            onPress: () => navigation.navigate('Historico'),
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch {
      Alert.alert(
        'Erro ao salvar',
        'Não foi possível gravar o ponto no aparelho. Tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  // Tela da câmera
  if (cameraOpen) {
    return (
      <View style={styles.cameraPage}>
        <CameraView
          ref={camera}
          style={styles.camera}
          facing="front"
        />

        <Text style={styles.cameraHint}>
          Enquadre o funcionário e tire a foto.
        </Text>

        <View style={styles.cameraActions}>
          <Pressable
            style={styles.cameraCancel}
            onPress={() => setCameraOpen(false)}
          >
            <Text style={styles.cameraCancelText}>
              Cancelar
            </Text>
          </Pressable>

          <Pressable
            style={styles.primaryButton}
            onPress={takePhoto}
          >
            <Text style={styles.primaryText}>
              Tirar foto
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Tela principal de registro
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      {/* Dados do funcionário */}
      <View style={styles.card}>
        <Text style={styles.label}>Funcionário</Text>

        <TextInput
          value={employee}
          onChangeText={setEmployee}
          placeholder="Nome ou matrícula"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text style={[styles.label, styles.labelGap]}>
          Tipo de marcação
        </Text>

        <View style={styles.kindGrid}>
          {kinds.map((item) => (
            <Pressable
              key={item}
              onPress={() => setKind(item)}
              style={[
                styles.kindOption,
                kind === item && styles.kindSelected,
              ]}
            >
              <Text
                style={[
                  styles.kindText,
                  kind === item && styles.kindTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Foto do funcionário */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Foto</Text>

        <Text style={styles.sectionHint}>
          {Platform.OS === 'web'
            ? 'A câmera do computador será aberta.'
            : ''}
        </Text>

        {photoUri ? (
          <>
            <Image
              source={{ uri: photoUri }}
              style={styles.previewPhoto}
            />

            <View style={styles.photoGps}>
              <Text style={styles.gpsFixed}>
                {photoLocation.latitude !== null &&
                photoLocation.longitude !== null
                  ? `⌖ ${photoLocation.latitude.toFixed(4)}, ${photoLocation.longitude.toFixed(4)}`
                  : 'Localização indisponível'}
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.photoActions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={openCamera}
          >
            <Text style={styles.secondaryText}>
              {photoUri ? 'Tirar outra foto' : 'Abrir câmera'}
            </Text>
          </Pressable>

          {photoUri ? (
            <Pressable
              style={styles.removePhoto}
              onPress={() => {
                setPhotoUri(null);
                setPhotoLocation({
                  latitude: null,
                  longitude: null,
                });
              }}
            >
              <Text style={styles.removePhotoText}>
                Remover
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Botão para registrar o ponto */}
      <Pressable
        style={styles.primaryButton}
        onPress={save}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryText}>
            Registrar ponto
          </Text>
        )}
      </Pressable>

      {/* Acesso ao histórico */}
      <Pressable
        style={styles.historyLink}
        onPress={() => navigation.navigate('Historico')}
      >
        <Text style={styles.historyText}>
          Ver histórico de marcações →
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  page: {
    padding: 18,
    paddingBottom: 34,
    gap: 14,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },

  labelGap: {
    marginTop: 17,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FBFCFE',
  },

  kindGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  kindOption: {
    width: '48%',
    minHeight: 43,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
  },

  kindSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blueLight,
  },

  kindText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  kindTextSelected: {
    color: colors.blue,
  },

  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },

  sectionHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },

  previewPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginTop: 12,
  },

  photoGps: {
    marginTop: 12,
  },

  gpsFixed: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    fontVariant: ['tabular-nums'],
  },

  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
  },

  secondaryButton: {
    minHeight: 44,
    borderColor: colors.blue,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  secondaryText: {
    color: colors.blue,
    fontWeight: '700',
  },

  removePhoto: {
    padding: 10,
  },

  removePhotoText: {
    color: colors.red,
    fontWeight: '600',
  },

  primaryButton: {
    minHeight: 52,
    backgroundColor: colors.blue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  primaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },

  historyLink: {
    alignItems: 'center',
    paddingVertical: 7,
  },

  historyText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '600',
  },

  cameraPage: {
    flex: 1,
    backgroundColor: '#0B1019',
    padding: 14,
    justifyContent: 'center',
  },

  camera: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },

  cameraHint: {
    color: colors.white,
    textAlign: 'center',
    padding: 13,
  },

  cameraActions: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 12,
  },

  cameraCancel: {
    flex: 1,
    minHeight: 50,
    borderColor: '#8B98AD',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraCancelText: {
    color: colors.white,
    fontWeight: '600',
  },
});
