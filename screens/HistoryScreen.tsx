
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PunchRecord, RootStackParamList } from '../types';
import { punchRepository } from '../data/PunchRepository';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Historico'>;

export default function HistoryScreen(_props: Props) {
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega os registros salvos
  const loadRecords = useCallback(async () => {
    setLoading(true);

    try {
      const data = await punchRepository.getAll();
      setRecords(data);
    } catch {
      Alert.alert(
        'Erro ao carregar',
        'Não foi possível ler o histórico salvo neste aparelho.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualiza o histórico quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, [loadRecords])
  );

  // Confirma e exclui um registro
  function confirmDelete(record: PunchRecord) {
    Alert.alert(
      'Excluir registro?',
      `A marcação de ${record.employee} será removida deste aparelho.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await punchRepository.remove(record.id);

              // Remove a foto do aparelho, quando possível
              if (record.photoUri && Platform.OS !== 'web') {
                try {
                  const { File } = await import('expo-file-system');
                  const photo = new File(record.photoUri);

                  if (photo.exists) {
                    photo.delete();
                  }
                } catch {
                  // A exclusão do registro não depende da foto.
                }
              }

              await loadRecords();
            } catch {
              Alert.alert(
                'Erro ao excluir',
                'Não foi possível remover o registro.'
              );
            }
          },
        },
      ]
    );
  }

  // Indicador de carregamento
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Resumo do histórico */}
      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{records.length}</Text>

        <View>
          <Text style={styles.summaryTitle}>marcações salvas</Text>
          <Text style={styles.summaryHint}>
            Armazenadas neste aparelho
          </Text>
        </View>
      </View>

      {/* Mensagem quando não existem registros */}
      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◷</Text>

          <Text style={styles.emptyTitle}>
            Nenhum registro ainda
          </Text>

          <Text style={styles.emptyText}>
            As marcações feitas aparecerão aqui e continuarão
            salvas ao fechar o app.
          </Text>
        </View>
      ) : (
        records.map((record) => {
          const date = new Date(record.createdAt);

          return (
            <View key={record.id} style={styles.record}>
              {/* Foto do registro */}
              {record.photoUri ? (
                <Image
                  source={{ uri: record.photoUri }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoGlyph}>✓</Text>
                </View>
              )}

              <View style={styles.recordBody}>
                {/* Tipo da marcação e horário */}
                <View style={styles.recordTop}>
                  <Text style={styles.kind}>{record.kind}</Text>

                  <Text style={styles.time}>
                    {date.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Funcionário */}
                <Text style={styles.name}>{record.employee}</Text>

                {/* Data */}
                <Text style={styles.meta}>
                  {date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>

                {/* Localização GPS */}
                {record.latitude !== null &&
                record.longitude !== null ? (
                  <Text style={styles.gps}>
                    ⌖ {record.latitude.toFixed(5)},{' '}
                    {record.longitude.toFixed(5)}
                  </Text>
                ) : (
                  <Text style={styles.noGps}>
                    Sem localização GPS
                  </Text>
                )}

                {/* Botão de exclusão */}
                <Pressable
                  onPress={() => confirmDelete(record)}
                  style={styles.delete}
                >
                  <Text style={styles.deleteText}>
                    Excluir registro
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  page: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summary: {
    backgroundColor: colors.navy,
    borderRadius: 15,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  summaryNumber: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '700',
  },

  summaryTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  summaryHint: {
    color: '#C3CFE0',
    fontSize: 12,
    marginTop: 3,
  },

  empty: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 27,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyIcon: {
    color: colors.blue,
    fontSize: 38,
  },

  emptyTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 17,
    marginTop: 8,
  },

  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  record: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    gap: 12,
  },

  photo: {
    width: 78,
    height: 92,
    borderRadius: 11,
    backgroundColor: '#E9EDF3',
  },

  photoPlaceholder: {
    width: 78,
    height: 92,
    borderRadius: 11,
    backgroundColor: '#E6F4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoGlyph: {
    color: colors.green,
    fontSize: 28,
    fontWeight: '700',
  },

  recordBody: {
    flex: 1,
  },

  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  kind: {
    color: colors.blue,
    fontWeight: '700',
    fontSize: 14,
  },

  time: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },

  name: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 5,
  },

  meta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  gps: {
    color: colors.green,
    fontSize: 11,
    marginTop: 5,
  },

  noGps: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },

  delete: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingVertical: 2,
  },

  deleteText: {
    color: colors.red,
    fontWeight: '600',
    fontSize: 12,
  },
});
