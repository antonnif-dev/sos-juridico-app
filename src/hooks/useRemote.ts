import {useCallback,useMemo,useState} from 'react';
import {useFocusEffect} from 'expo-router';
import {useSession} from '../auth/SessionProvider';
import {api,errorMessage} from '../services/api';
export function useRemote<T>(path:string|null,keepData=false){
 const {profile,loading:checking}=useSession();const uid=profile?.uid;
 const [data,setData]=useState<T|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [version,setVersion]=useState(0);
 const target=useMemo(()=>({path,version}),[path,version]);
 useFocusEffect(useCallback(()=>{
  const controller=new AbortController();
  if(!target.path||!uid||checking){setLoading(false);return ()=>controller.abort();}
  setLoading(true);setError('');if(!keepData)setData(null);
  api<T>(target.path,{signal:controller.signal}).then(result=>{if(!controller.signal.aborted)setData(result);}).catch(e=>{if(!controller.signal.aborted)setError(errorMessage(e));}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[target,uid,checking,keepData]));
 return {data,loading,error,reloadFresh:useCallback(()=>{setData(null);setVersion(v=>v+1);},[]),reload:useCallback(()=>setVersion(v=>v+1),[])};
}
