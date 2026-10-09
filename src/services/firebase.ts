import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, type Auth } from 'firebase/auth';
import { readEnvironment } from '../config/environment';
let instance: Auth | undefined;
export function getFirebaseAuth() {
  if (instance) return instance;
  const app = getApps().length ? getApp() : initializeApp(readEnvironment().firebase);
  try { instance = initializeAuth(app, { persistence: inMemoryPersistence }); }
  catch (error) {
    if ((error as { code?: string }).code !== 'auth/already-initialized') throw error;
    instance = getAuth(app);
  }
  return instance;
}
