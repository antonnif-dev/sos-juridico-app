import {Stack,Redirect} from 'expo-router';
import {useSession} from '../../auth/SessionProvider';
export default function PortalLayout(){const {profile}=useSession();if(profile?.role!=='cliente')return <Redirect href="/"/>;return <Stack screenOptions={{headerShown:false,gestureEnabled:false}}/>;}
