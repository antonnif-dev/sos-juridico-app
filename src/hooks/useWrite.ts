import {useEffect,useRef,useState} from 'react';
import {api,errorMessage} from '../services/api';
import {ApiError} from '../services/api-core';
export function useWrite(onBusy?:(busy:boolean)=>void){
 const lock=useRef(false);const alive=useRef(true);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{alive.current=true;return ()=>{alive.current=false;};},[]);
 async function run<T>(path:string,method:'POST'|'PUT'|'DELETE',body:unknown,onSuccess:(result:T)=>void){
  if(lock.current)return;lock.current=true;setBusy(true);onBusy?.(true);setMessage('');
  try{const result=await api<T>(path,{method,...(body===undefined?{}:{body})});if(alive.current)onSuccess(result);}
  catch(e){if(alive.current)setMessage(errorMessage(e)+(e instanceof ApiError&&(e.status===0||e.status>=500)?' Atualize a consulta antes de repetir: a operação pode ter sido concluída.':''));}
  finally{lock.current=false;onBusy?.(false);if(alive.current)setBusy(false);}
 }
 return {busy,message,setMessage,run};
}
