import {Store} from './types';

class MemoryStore implements Store {
    map: Map<string, any>;

    constructor() {
      this.map = new Map();
    }

    async get(key: string) {
      return this.map.get(key);
    }
    async set(key: string, value: string, expire?: number) {
      return this.map.set(key, value);
    }
}

export default MemoryStore;
