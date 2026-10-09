import {useCallback,useMemo,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useSession} from '../auth/SessionProvider';
import {api,errorMessage} from '../services/api';
import {createPolling} from '../services/polling-core';
export function usePolling<T>(path:string|null,interval=15000,paused=false){
 const {profile,loading:checking}=useSession();const uid=profile?.uid;const identity=useMemo(()=>({path,uid}),[path,uid]);const reload=useRef<()=>void>(()=>{});const [state,setState]=useState<{identity:typeof identity;data:T|null;error:string;loading:boolean;at:string|null}>({identity,data:null,error:'',loading:false,at:null});
 useFocusEffect(useCallback(()=>{if(!identity.path||!identity.uid||checking||paused)return;let alive=true;const poll=createPolling<T>({interval,request:signal=>api<T>(identity.path!,{signal}),onData:data=>{if(alive)setState({identity,data,error:'',loading:false,at:new Date().toLocaleTimeString('pt-BR')});},onError:e=>{if(alive)setState(old=>({identity,data:old.identity===identity?old.data:null,error:errorMessage(e),loading:false,at:old.identity===identity?old.at:null}));},onLoading:loading=>{if(alive)setState(old=>old.identity===identity?{...old,loading}:{identity,data:null,error:'',loading,at:null});}});reload.current=poll.refresh;const sub=AppState.addEventListener('change',status=>poll.setActive(status==='active'));poll.setActive(AppState.currentState==='active');return()=>{alive=false;reload.current=()=>{};sub.remove();poll.stop();};},[identity,interval,checking,paused]));
 const matching=state.identity===identity;return {data:matching?state.data:null,error:matching?state.error:'',loading:matching?state.loading:true,at:matching?state.at:null,reload:useCallback(()=>reload.current(),[])};
}
