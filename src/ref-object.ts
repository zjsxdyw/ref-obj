export interface IRef {
  get(key: string): any;
  set(key: string, value: any): any;
}

export interface RefManager {
  init(obj: any): IRef;
  release(): void;
}

export function createRefManager(keys: string[]): RefManager {
  const mapTree = new Map();
  const lastIndex = keys.length - 1;

  function findRef(ref: Ref, changedKey: string, changedValue: any): Ref | undefined;
  function findRef(ref: {[key: string]: any}): Ref | undefined;
  function findRef(ref: Ref | {[key: string]: any}, changedKey?: string, changedValue?: any): Ref | undefined {
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

  function createRef(ref: Ref, changedKey: string, changedValue: any): Ref;
  function createRef(ref: {[key: string]: any}): Ref;
  function createRef(ref: Ref | {[key: string]: any}, changedKey?: string, changedValue?: any): Ref {
    let map = mapTree;
    const cfg = {};
    const newRef = new Ref(cfg);
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

  class Ref implements IRef{

    constructor(private cfg) {}

    get(key: string) {
      return this.cfg[key];
    }

    set(key: string, value): Ref {
      const refObj = findRef(this, key, value);
      if (refObj) {
        return refObj;
      }
      return createRef(this, key, value);
    }
  }

  return {
    init(obj: any) {
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