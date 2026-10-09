import {Directory,File,Paths} from 'expo-file-system';
import {CryptoDigestAlgorithm,digestStringAsync,randomUUID} from 'expo-crypto';
import {getFirebaseAuth} from './firebase';
import {api,fileSession} from './api';
import {readEnvironment} from '../config/environment';
import {canonicalPlan,submitInstallment} from './installment-core';
import type {Transaction} from '../domain/financial';
export function createInstallments(body:Record<string,unknown>,signal:AbortSignal){
 const session=fileSession();const uid=getFirebaseAuth().currentUser?.uid;const apiUrl=readEnvironment().apiUrl;const dir=new Directory(Paths.document,'sos-financial-operations');const file=(id:string)=>new File(dir,id+'.txt');
 return submitInstallment<{id:string;replayed:boolean;installments:Transaction[]}>(body,{
  fingerprint:()=>digestStringAsync(CryptoDigestAlgorithm.SHA256,JSON.stringify([apiUrl,uid,canonicalPlan(body)])),current:()=>session.current()&&!signal.aborted,
  read:id=>{const f=file(id);return f.exists?f.textSync():null;},write:(id,key)=>{dir.create({idempotent:true,intermediates:true});const f=file(id);f.create();f.write(key);},remove:id=>file(id).delete(),newKey:randomUUID,
  send:key=>api('/financial/installment-plans',{method:'POST',body,idempotencyKey:key,signal}),
 });
}
