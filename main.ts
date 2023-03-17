type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type Query = "flashed" | "persistent";

type Nullable<T> = T | null;

type Option<T> = { type: "some"; val: T } | { type: "none" };

export type Data = { [key: string]: Json };

export type Serialized<T extends Data> = {
  data: Partial<T>;
  __flash: Partial<T>;
};

export interface Session<T extends Data> {
  get: (key: keyof T) => Nullable<T[keyof T]>;
  getOption: (key: keyof T) => Option<T[keyof T]>;
  set: (key: keyof T, value: T[keyof T]) => void;
  has: (key: keyof T) => boolean;
  clear: () => void;
  flash: (key: keyof T, value: T[keyof T]) => void;
  entries: (query?: Query) => Partial<T>;
  serlialize: () => { data: Partial<T>; __flash: Partial<T> };
}

export function createSession<T extends Data>(data: Partial<T>, flash: Partial<T>): Session<T> {
  const dataMap = new Map<keyof T, T[keyof T]>(Object.entries(data));
  const oldFlashMap = new Map<keyof T, T[keyof T]>(Object.entries(flash));
  const flashMap = new Map<keyof T, T[keyof T]>();

  const get = (key: keyof T) => dataMap.get(key) ?? oldFlashMap.get(key) ?? null;
  const getOption = (key: keyof T): Option<T[keyof T]> => {
    const val = get(key);
    if (val === null) {
      return { type: "none" };
    }
    return { type: "some", val };
  };

  return {
    get,
    getOption,
    set(key, value) {
      dataMap.set(key, value)
    },
    has(key) {
      return dataMap.has(key);
    },
    clear() {
      dataMap.clear();
    },
    flash(key, value) {
      flashMap.set(key, value);
    },
    entries(query) {
      switch (query) {
        case "flashed": {
          return Object.fromEntries(oldFlashMap) as Partial<T>;
        }
        case "persistent": {
          return Object.fromEntries(dataMap) as Partial<T>;
        }
        default: {
          return Object.fromEntries(
            new Map([...oldFlashMap, ...dataMap])
          ) as Partial<T>;
        }
      }
    },
    serlialize() {
      return {
        data: Object.fromEntries(dataMap) as Partial<T>,
        __flash: Object.fromEntries(flashMap) as Partial<T>,
      };
    },
  };
}
