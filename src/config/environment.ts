// Expo substitutes only literal process.env.EXPO_PUBLIC_* accesses.
const values = {
  apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const missingConfiguration = Object.entries(values).filter(([, v]) => !v?.trim()).map(([k]) => k);
export function readEnvironment() {
  if (missingConfiguration.length) throw new Error('Preencha o arquivo .env antes de iniciar.');
  const apiUrl = values.apiUrl!.trim().replace(/\/+$/, '');
  const url = new URL(apiUrl);
  if (url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/api')) {
    throw new Error('A URL do backend deve terminar em /api, sem senha, parâmetros ou fragmentos.');
  }
  if (url.protocol !== 'https:' && !(__DEV__ && url.protocol === 'http:')) throw new Error('Use HTTPS para a API.');
  const { apiUrl: _, ...firebase } = values;
  return { apiUrl, firebase: Object.fromEntries(Object.entries(firebase).map(([k,v]) => [k,v!.trim()])) };
}
