// utils/storage.js
import { Platform } from 'react-native';

export const saveItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  }
};

export const getItem = async (key) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
};

export const removeItem = async (key) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  }
};
