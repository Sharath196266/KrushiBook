import AsyncStorage from '@react-native-async-storage/async-storage';

const isBrowser = typeof window !== 'undefined';

const Storage = {
  getItem: async (key) => {
    if (isBrowser) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (isBrowser) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (isBrowser) {
      window.localStorage.removeItem(key);
    }
  },
};

export default Storage;
