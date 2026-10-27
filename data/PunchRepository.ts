import { AsyncStorageRepository } from './AsyncStorageRepository';
import { NewPunch, PunchRecord } from '../types';

class PunchRepository extends AsyncStorageRepository<PunchRecord> {
  constructor() { super('@ponto-certo:registros:v1'); }

  async create(data: NewPunch): Promise<PunchRecord> {
    const record: PunchRecord = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    return this.add(record);
  }
}

export const punchRepository = new PunchRepository();
