import React, { useState } from 'react';
import { Text } from 'react-native';
import { EmailAuthProvider, reauthenticateWithCredential, reload, sendEmailVerification } from 'firebase/auth';
import { useSession } from './SessionProvider';
import { Button, Field, Message, Page } from '../components/ui';
import { errorMessage } from '../services/api';
export function SecurityGate() {
  const { user, action, message, refresh, logout } = useSession();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [sentAt, setSentAt] = useState(0);
  async function run(task: () => Promise<unknown>) { setBusy(true); setNotice(''); try { await task(); } catch (e) { setNotice(errorMessage(e)); } finally { setBusy(false); setPassword(''); } }
  const reauth = action === 'AUTH_SESSION_EXPIRED' || action === 'AUTH_RECENT_LOGIN_REQUIRED';
  return <Page><Text className="text-2xl font-bold text-slate-900">Confirme seu acesso</Text>
    {action === 'APP_CHECK_REQUIRED' ? <Message text="Este servidor exige App Check. Esta etapa no Expo Go não gera a validação nativa exigida. Será necessário configurar uma compilação de desenvolvimento. Preserve a proteção atual do servidor." /> : <Message text={message} />}
    {action === 'AUTH_EMAIL_VERIFICATION_REQUIRED' && <><Message text="Confirme seu e-mail pelo link do Firebase e volte ao aplicativo." /><Button title="Enviar verificação" disabled={busy} onPress={() => void run(async () => { if (Date.now()-sentAt < 60000) { setNotice('Aguarde um minuto antes de reenviar.'); return; } await sendEmailVerification(user!); setSentAt(Date.now()); setNotice('E-mail enviado. Confira também o spam.'); })} /><Button title="Já confirmei" disabled={busy} onPress={() => void run(async () => { await reload(user!); await user!.getIdToken(true); await refresh(); })} /></>}
    {reauth && <><Message text="Digite sua senha atual. Depois, repita a operação desejada." /><Field label="Senha atual" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} /><Button title="Confirmar senha" disabled={busy || !password} onPress={() => void run(async () => { await reauthenticateWithCredential(user!, EmailAuthProvider.credential(user!.email!, password)); await user!.getIdToken(true); await refresh(); })} /></>}
    {!reauth && action !== 'AUTH_EMAIL_VERIFICATION_REQUIRED' && <Button title="Tentar novamente" disabled={busy} onPress={() => void run(refresh)} />}
    <Message text={notice} /><Button title="Sair desta conta" secondary disabled={busy} onPress={() => void run(logout)} />
  </Page>;
}
