export interface IRef<T extends { [key: string]: any }> {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): IRef<T>;
}

export interface RefManager {
  init<T extends { [key: string]: any }>(obj: Partial<T>): IRef<T>;
  release(): void;
}

export function createRefManager(keys: string[]): RefManager {
  const mapTree = new Map();
  const lastIndex = keys.length - 1;

  function findRef<T extends { [key: string]: any }, K extends keyof T> (
    ref: Ref<T>, changedKey: K, changedValue: T[K],
  ): Ref<T> | undefined;
  function findRef<T extends { [key: string]: any }> (ref: Ref<T> | Partial<T>): Ref<T> | undefined;
  function findRef<T extends { [key: string]: any }, K extends keyof T> (
    ref: Ref<T> | Partial<T>, changedKey?: K, changedValue?: T[K]
  ): Ref<T> | undefined {
    let map = mapTree;
    for (let i = 0; i <= lastIndex; i++) {
      const key = keys[i];
      const value = key === changedKey ? changedValue : (ref instanceof Ref ? ref.get(key) : ref[key]);
      const next = map.get(value);
      if (next === undefined) {
        return;
      }
      map = next;
    }
    // @ts-ignore
    return map;
  }

  function createRef<T extends { [key: string]: any }, K extends keyof T> (
    ref: Ref<T>, changedKey: string, changedValue: any
  ): Ref<T>;
  function createRef<T extends { [key: string]: any }>(ref: {[key: string]: any}): Ref<T>;
  function createRef<T extends { [key: string]: any }, K extends keyof T> (
    ref: Ref<T> | Partial<T>, changedKey?: K, changedValue?: T[K]
  ): Ref<T> | undefined {
    let map = mapTree;
    const cfg = {};
    const newRef = new Ref<T>(cfg as any);
    for (let i = 0; i <= lastIndex; i++) {
      const key = keys[i];
      const value = key === changedKey ? changedValue : (ref instanceof Ref ? ref.get(key) : ref[key]);
      let next = map.get(value);
      if (next === undefined) {
        next = i === lastIndex ? newRef : new Map();
        map.set(value, next);
      }
      map = next;
      cfg[key] = value;
    }
    
    return newRef;
  }

  class Ref<T extends { [key: string]: any }> implements IRef<T> {

    constructor(private cfg: T) {}

    get<K extends keyof T>(key: K): T[K] {
      return this.cfg[key];
    }

    set<K extends keyof T>(key: K, value: T[K]): Ref<T> {
      const refObj = findRef(this, key, value);
      if (refObj) {
        return refObj;
      }
      return createRef(this, key as string, value);
    }
  }

  return {
    init<T extends { [key: string]: any }>(obj: Partial<T>) {
      const refObj = findRef(obj);
      if (refObj) {
        return refObj;
      }
      return createRef(obj);
    },
    release() {
      mapTree.clear();
    },
  }
}