import {Stack,Redirect} from 'expo-router';
import {useSession} from '../../auth/SessionProvider';
import {canAi} from '../../domain/ai';
export default function Layout(){const {profile}=useSession();return canAi(profile?.role||null)?<Stack screenOptions={{headerShown:false,gestureEnabled:false}}/>:<Redirect href="/"/>;}
