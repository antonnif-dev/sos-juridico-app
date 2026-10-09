import {accountScope} from '../domain/administration';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../services/firebase';
import { api, errorMessage, onApiFailure } from '../services/api';
import { normalizeRole, type Profile, type SessionResponse, type Theme } from '../domain/types';

type State = { user: User | null; profile: Profile | null; platform: {role:'superadmin';email:string}|null; theme: Theme; loading: boolean; action: string | null; message: string };
const initial: State = { user: null, profile: null, platform: null, theme: {}, loading: true, action: null, message: '' };
const Context = createContext<(State & { refresh: () => Promise<void>; logout: () => Promise<void>; acceptProfile: (profile: Profile) => void }) | null>(null);
export function SessionProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<State>(initial);
  const generation = useRef(0);
  const validate = useCallback(async (user: User | null) => {
    const attempt = ++generation.current;
    setState(current => user && current.user?.uid === user.uid && (current.profile||current.platform) ? { ...current, loading: true } : { ...initial, user, loading: !!user });
    if (!user) return;
    try {
      const result = await user.getIdTokenResult();
      if(accountScope(result.claims)==='platform-candidate'){
        const platform=await api<{role:'superadmin';email:string}>('/superadmin/me');
        if(platform.role!=='superadmin')throw new Error('Acesso à plataforma não autorizado.');
        if(attempt===generation.current)setState({...initial,user,platform,loading:false});
        return;
      }
      if (!normalizeRole(result.claims.role) || typeof result.claims.tenantId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(result.claims.tenantId)) {
        throw new Error('Esta conta não possui vínculo válido com um escritório.');
      }
      const session = await api<SessionResponse>('/security/session');
      if (attempt !== generation.current) return;
      if (session.requiredAction) { setState({ ...initial, user, loading: false, action: session.requiredAction }); return; }
      const profile = await api<Profile>('/users/me');
      const role = normalizeRole(profile.role);
      if (!role || profile.uid !== user.uid || profile.status !== 'ativo') throw new Error('Vínculo de usuário inválido ou suspenso.');
      const theme = await api<Theme>('/theme');
      if (attempt === generation.current) setState({ user, profile: { ...profile, role }, platform:null, theme, loading: false, action: null, message: '' });
    } catch (error) {
      if (attempt !== generation.current) return;
      const code = (error as { code?: string }).code;
      setState({ ...initial, user, loading: false, action: code || 'CONNECTION_ERROR', message: errorMessage(error) });
    }
  }, []);
  const refresh = useCallback(() => validate(getFirebaseAuth().currentUser), [validate]);
  const logout = useCallback(async () => {
    ++generation.current;
    await signOut(getFirebaseAuth());
    setState({ ...initial, loading: false });
  }, []);
  const acceptProfile = useCallback((profile: Profile) => {
    setState(current => current.profile?.uid === profile.uid && current.profile.role === profile.role ? { ...current, profile } : current);
  }, []);
  const invalidate = useCallback(() => { generation.current += 1; }, []);
  useEffect(() => {
    const auth = getFirebaseAuth();
    const stop = onAuthStateChanged(auth, user => { void validate(user); });
    const unlisten = onApiFailure(error => {
      const blocking = error.status === 401 || ['AUTH_EMAIL_VERIFICATION_REQUIRED','AUTH_RECENT_LOGIN_REQUIRED','AUTH_SESSION_EXPIRED','APP_CHECK_REQUIRED','PLATFORM_ACCESS_BLOCKED'].includes(error.code);
      if (!blocking) return;
      ++generation.current;
      setState(current => ({ ...current, profile: null, platform: null, theme: {}, loading: false, action: error.code || 'ACCESS_DENIED', message: error.message }));
    });
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') void refresh();
      else if (auth.currentUser) { ++generation.current; setState(current => ({ ...current, loading: true })); }
    });
    return () => { invalidate(); stop(); unlisten(); subscription.remove(); };
  }, [refresh, validate, invalidate]);
  return <Context.Provider value={{ ...state, refresh, logout, acceptProfile }}>{children}</Context.Provider>;
}
export function useSession() { const value = useContext(Context); if (!value) throw new Error('SessionProvider ausente.'); return value; }

export const useOptionalSession = () => useContext(Context);
