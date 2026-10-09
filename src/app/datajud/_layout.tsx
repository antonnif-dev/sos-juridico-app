import {Stack,Redirect} from 'expo-router';
import {useSession} from '../../auth/SessionProvider';
import {canDatajud} from '../../domain/datajud';
export default function Layout(){const {profile}=useSession();return canDatajud(profile?.role||null)?<Stack screenOptions={{headerShown:false,gestureEnabled:false}}/>:<Redirect href="/"/>;}
