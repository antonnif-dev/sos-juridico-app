import {router} from 'expo-router';
import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../services/firebase';
import { errorMessage } from '../services/api';
import { Button, Field, Message, Page } from '../components/ui';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  const attempts = useRef<number[]>([]); const resetAt = useRef(0);
  async function login() {
    setBusy(true); setNotice('');
    try {
      attempts.current = attempts.current.filter(t => Date.now()-t < 60000);
      if (attempts.current.length >= 5) { setNotice('Aguarde um minuto antes de tentar novamente.'); return; }
      attempts.current.push(Date.now());
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch(e) { setNotice(errorMessage(e)); } finally { setBusy(false); setPassword(''); }
  }
  async function reset() {
    setBusy(true); setNotice('');
    try {
      if (Date.now()-resetAt.current < 60000) { setNotice('Aguarde um minuto antes de reenviar.'); return; }
      resetAt.current = Date.now();
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setNotice('Se houver uma conta elegível, você receberá as instruções por e-mail.');
    } catch { setNotice('Se houver uma conta elegível, você receberá as instruções por e-mail. Se não chegar, confira o endereço e sua conexão.'); }
    finally { setBusy(false); }
  }
  return <Page><View className="mt-12 gap-3"><Text className="text-sm font-semibold uppercase tracking-widest text-brand">SOS Jurídico</Text><Text className="text-4xl font-bold text-slate-900">{'Seu escritório,\ncom você.'}</Text><Text className="text-base leading-6 text-slate-600">Entre com o mesmo e-mail e senha que você usa no site.</Text></View><View className="mt-6 gap-5 rounded-2xl border border-slate-200 bg-white p-5"><Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" editable={!busy} /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password" editable={!busy} onSubmitEditing={() => { if (!busy && email.trim() && password) void login(); }} /><Button title={busy ? 'Aguarde…' : 'Entrar'} disabled={busy || !email.trim() || !password} onPress={() => void login()} /><Button title="Esqueci minha senha" secondary disabled={busy || !email.trim()} onPress={() => void reset()} /><Message text={notice} /></View><Button title="Consultar site de um escritório" secondary disabled={busy} onPress={()=>router.push('/publico')}/></Page>;
}
