
import { useState, useEffect } from 'react';

const useLocalStorage = (key: any, initialValue: any) => {
  const [state, setState] = useState(async () => {
    try {
      const storedValue = await chrome.storage.local.get('dialpadCallDictionary'); //localStorage.getItem(key);
      return storedValue ? storedValue : initialValue;
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      chrome.storage.local.set({ 'dialpadCallDictionary': state }, () => {
        console.log('Stored in local storage:', state);
      });
    } catch (error) {
      console.error('Error storing data in localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
};

export default useLocalStorage;