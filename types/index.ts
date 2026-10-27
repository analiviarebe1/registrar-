export type PunchKind = 'Entrada' | 'Início do intervalo' | 'Fim do intervalo' | 'Saída';

export type PunchRecord = {
  id: string;
  employee: string;
  kind: PunchKind;
  photoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
};

export type NewPunch = Omit<PunchRecord, 'id' | 'createdAt'>;

export type RootStackParamList = {
  Registrar: undefined;
  Historico: undefined;
};
