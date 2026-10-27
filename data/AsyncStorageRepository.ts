import AsyncStorage from '@react-native-async-storage/async-storage';

/** Repositório genérico inspirado no projeto de referência enviado. */
export class AsyncStorageRepository<T extends { id: string }> {
  constructor(private readonly key: string) {}

  async getAll(): Promise<T[]> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const value: unknown = JSON.parse(raw);
      return Array.isArray(value) ? value as T[] : [];
    } catch {
      return [];
    }
  }

  async add(item: T): Promise<T> {
    const items = await this.getAll();
    await AsyncStorage.setItem(this.key, JSON.stringify([item, ...items]));
    return item;
  }

  async remove(id: string): Promise<void> {
    const items = await this.getAll();
    await AsyncStorage.setItem(this.key, JSON.stringify(items.filter(item => item.id !== id)));
  }
}
