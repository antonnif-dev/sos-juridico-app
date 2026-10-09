import { readEnvironment } from '../config/environment';
import { getFirebaseAuth } from './firebase';
import { ApiError, createApi } from './api-core';
const listeners = new Set<(error: ApiError) => void>();
export function onApiFailure(listener: (error: ApiError) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function api<T>(path: string, options?: Parameters<ReturnType<typeof createApi>>[1]) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  return createApi({ baseUrl: readEnvironment().apiUrl, token: async () => {
    if (!user || auth.currentUser !== user) throw new ApiError('Entre novamente.', 401);
    return user.getIdToken();
  }, onFailure: error => { if (auth.currentUser === user) listeners.forEach(listener => listener(error)); } })(path, options) as Promise<T>;
}
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return [error.message, ...Object.values(error.fields)].join('\n');
  const code = (error as { code?: string })?.code;
  if (code === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde antes de tentar novamente.';
  if (code === 'auth/network-request-failed') return 'Confira sua conexão com a internet.';
  if (code?.startsWith('auth/')) return 'Não foi possível autenticar. Confira seu e-mail e senha.';
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
}

// Binary transfers share the session failure handler used by JSON requests.
export function fileSession(){
 const auth=getFirebaseAuth();const user=auth.currentUser;
 return {current:()=>!!user&&auth.currentUser===user,token:async()=>{if(!user||auth.currentUser!==user)throw new ApiError('Entre novamente.',401);const token=await user.getIdToken();if(auth.currentUser!==user)throw new ApiError('Sessão alterada.',401);return token;},onFailure:(error:ApiError)=>{if(auth.currentUser===user)listeners.forEach(listener=>listener(error));}};
}
