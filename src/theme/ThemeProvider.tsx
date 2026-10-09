import React,{ createContext,useContext,useMemo } from 'react';
import { Platform } from 'react-native';
import { normalizeTheme } from '../domain/theme';
import type { Theme } from '../domain/types';
const Context=createContext({ theme:normalizeTheme(),font:undefined as string|undefined,bold:undefined as string|undefined });
export function ThemeProvider({theme,fontsReady,children}:React.PropsWithChildren<{theme:Theme;fontsReady:boolean}>) {
 const value=useMemo(()=>{
  const normalized=normalizeTheme(theme); const serif=normalized.fontFamilia.includes('Times');const roboto=normalized.fontFamilia.includes('Roboto');
  return {theme:normalized,font:serif?(Platform.OS==='ios'?'Times New Roman':'serif'):fontsReady?(roboto?'Roboto_400Regular':'Inter_400Regular'):undefined,bold:serif?(Platform.OS==='ios'?'Times New Roman':'serif'):fontsReady?(roboto?'Roboto_700Bold':'Inter_700Bold'):undefined};
 },[theme,fontsReady]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useTheme=()=>useContext(Context);
