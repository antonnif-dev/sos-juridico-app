import {canAi} from '../domain/ai';
import {canDatajud} from '../domain/datajud';
import '../../global.css';
import {canMessages,canNotifications} from '../domain/communication';
import {canFinance,canReports} from '../domain/financial';
import React,{useEffect} from 'react';
import {clearFileCache} from '../services/files';
import {canUseContracts} from '../domain/files';
import { View,ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { readEnvironment } from '../config/environment';
import { SessionProvider,useSession } from '../auth/SessionProvider';
import { SecurityGate } from '../auth/SecurityGate';
import { Loading,Page,Label } from '../components/ui';
import { ThemeProvider,useTheme } from '../theme/ThemeProvider';
import { canReadClients,canReadDashboard } from '../domain/clients';
import { canManageIntake } from '../domain/intake';
import { canUseAgenda } from '../domain/agenda';
import { canReadCases } from '../domain/cases';
import { luminance } from '../domain/theme';
function Routes(){
 const {user,loading,action,profile,platform}=useSession();const {theme}=useTheme();
 useEffect(()=>{clearFileCache();},[user?.uid]);
 if(loading&&!profile&&!platform)return <Loading/>;
 if(user&&action)return <SecurityGate/>;
 return <View style={{flex:1}}><StatusBar style={luminance(theme.corFundo)<.3?'light':'dark'}/><Stack key={profile?`${profile.uid}:${profile.role}`:platform?`platform:${user?.uid}`:'public'} screenOptions={{headerShown:false}}>
 <Stack.Protected guard={!!platform}><Stack.Screen name="superadmin"/></Stack.Protected><Stack.Protected guard={!user}><Stack.Screen name="login"/></Stack.Protected>
 <Stack.Protected guard={!!user&&!!profile}><Stack.Screen name="index"/><Stack.Screen name="perfil" options={{gestureEnabled:false}}/><Stack.Screen name="menu"/><Stack.Screen name="modulo/[id]"/></Stack.Protected>
 <Stack.Protected guard={!!profile&&['administrador','advogado','secretaria','estagiario'].includes(profile.role)}><Stack.Screen name="documentos"/></Stack.Protected><Stack.Protected guard={!!profile&&canUseContracts(profile.role)}><Stack.Screen name="contratos"/></Stack.Protected><Stack.Protected guard={canAi(profile?.role||null)}><Stack.Screen name="ia"/></Stack.Protected><Stack.Protected guard={canDatajud(profile?.role||null)}><Stack.Screen name="datajud"/></Stack.Protected><Stack.Protected guard={profile?.role==='cliente'}><Stack.Screen name="portal"/></Stack.Protected><Stack.Protected guard={!!profile&&canMessages(profile.role)}><Stack.Screen name="mensagens"/></Stack.Protected><Stack.Protected guard={!!profile&&canNotifications(profile.role)}><Stack.Screen name="notificacoes" options={{gestureEnabled:false}}/></Stack.Protected><Stack.Protected guard={!!profile&&canFinance(profile.role)}><Stack.Screen name="financeiro"/></Stack.Protected><Stack.Protected guard={!!profile&&canReports(profile.role)}><Stack.Screen name="relatorios"/></Stack.Protected><Stack.Protected guard={!!profile&&canReadClients(profile.role)}><Stack.Screen name="clientes"/></Stack.Protected><Stack.Protected guard={!!profile&&canReadDashboard(profile.role)}><Stack.Screen name="painel"/></Stack.Protected><Stack.Protected guard={!!profile&&canReadCases(profile.role)}><Stack.Screen name="processos"/></Stack.Protected><Stack.Protected guard={!!profile&&canUseAgenda(profile.role)}><Stack.Screen name="agenda"/></Stack.Protected><Stack.Protected guard={!!profile&&canManageIntake(profile.role)}><Stack.Screen name="triagem"/><Stack.Screen name="atendimento" options={{gestureEnabled:false}}/><Stack.Screen name="pos-atendimento" options={{gestureEnabled:false}}/></Stack.Protected><Stack.Protected guard={profile?.role==='administrador'}><Stack.Screen name="equipe"/><Stack.Screen name="tema" options={{gestureEnabled:false}}/><Stack.Screen name="site"/></Stack.Protected><Stack.Screen name="publico" options={{gestureEnabled:false}}/></Stack>{loading&&<View accessibilityViewIsModal className="absolute inset-0 items-center justify-center" style={{backgroundColor:theme.corFundo}}><ActivityIndicator size="large" color={theme.corPrimaria}/><Label>Verificando sua sessão…</Label></View>}</View>;
}
function ThemedRoutes({fontsReady}:{fontsReady:boolean}){const {theme}=useSession();return <ThemeProvider theme={theme} fontsReady={fontsReady}><Routes/></ThemeProvider>;}
export default function RootLayout(){
 const [fontsReady]=useFonts({Inter_400Regular,Inter_700Bold,Roboto_400Regular,Roboto_700Bold});
 let problem='';try{readEnvironment();}catch(e){problem=(e as Error).message;}
 return <SafeAreaProvider>{problem?<Page><Label variant="title">Configuração inicial</Label><MessageConfig message={problem}/></Page>:<SessionProvider><ThemedRoutes fontsReady={fontsReady}/></SessionProvider>}</SafeAreaProvider>;
}
function MessageConfig({message}:{message:string}){return <><Label>{message}</Label><Label>Confira .env e reinicie com npx expo start --clear.</Label></>;}
