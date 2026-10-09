import {useCallback,useEffect,useRef,useState} from 'react';
import {errorMessage} from '../services/api';
import {ApiError} from '../services/api-core';
export function useFileTask(){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [blocked,setBlocked]=useState(false);const lock=useRef(false);const alive=useRef(true);const abort=useRef<AbortController|null>(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;abort.current?.abort();};},[]);
 const run=useCallback(async<T,>(work:(signal:AbortSignal)=>Promise<T>,done?:(result:T)=>void,mutation=false)=>{if(lock.current)return;lock.current=true;const controller=new AbortController();abort.current=controller;setBusy(true);setMessage('');try{const result=await work(controller.signal);if(alive.current&&!controller.signal.aborted)done?.(result);}catch(e){if(alive.current){setMessage(errorMessage(e)+(mutation?' Atualize a consulta antes de tentar novamente.':''));if(mutation&&(e instanceof ApiError&&[0,409,500,502,503,504].includes(e.status)))setBlocked(true);}}finally{lock.current=false;if(alive.current)setBusy(false);}},[]);
 return {busy,message,setMessage,blocked,reset:()=>{setBlocked(false);setMessage('');},run};
}
