import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dokploy_token';

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
};

export const getToken = async () => {
  return await SecureStore.getItem(TOKEN_KEY);
};

export const deleteToken = async () => {
  return await SecureStore.deleteItemAsync(TOKEN_KEY);
};
