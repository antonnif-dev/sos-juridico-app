import {validateImage} from '../domain/administration';
import * as Picker from 'expo-document-picker';
import {Directory,File,Paths} from 'expo-file-system';
import {fetch as expoFetch} from 'expo/fetch';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import {readEnvironment} from '../config/environment';
import {mimeByExtension,originalHtml,safeFilename,validateSelectedFile,type Contract} from '../domain/files';
import {fileSession} from './api';
import {createFileTransfer} from './file-transfer-core';
export type LocalDocument={uri:string;name:string;mime:string;size:number};
const directory=()=>new Directory(Paths.cache,'sos-juridico-transfers');
export function clearFileCache(){try{const dir=directory();if(dir.exists)dir.delete();}catch{/* OS also manages this temporary cache. */}}
export function discardFile(item:LocalDocument|null){if(!item)return;try{if(item.uri.startsWith(directory().uri.replace(/\/+$/,'')+'/')){const file=new File(item.uri);if(file.exists)file.delete();}}catch{}}
function target(name:string){const dir=new Directory(directory(),`${Date.now()}-${Math.random().toString(36).slice(2)}`);dir.create({intermediates:true,idempotent:true});return new File(dir,safeFilename(name));}
function adopt(uri:string,name:string,pdfOnly:boolean){const source=new File(uri);try{const meta=validateSelectedFile(name,source.size,pdfOnly);const dest=target(meta.name);source.copy(dest);return {...meta,uri:dest.uri};}finally{if(uri.startsWith(Paths.cache.uri.replace(/\/+$/,'')+'/')){try{source.delete();}catch{}}}}
function check(current:()=>boolean,signal?:AbortSignal){if(!current()||signal?.aborted)throw new Error('Operação interrompida ou sessão alterada.');}
export async function pickDocument(pdfOnly=false,signal?:AbortSignal){const session=fileSession();check(session.current,signal);const result=await Picker.getDocumentAsync({type:pdfOnly?'application/pdf':Object.values(mimeByExtension),copyToCacheDirectory:true,multiple:false});if(result.canceled)return null;const asset=result.assets[0];const item=adopt(asset.uri,asset.name,pdfOnly);try{check(session.current,signal);return item;}catch(e){discardFile(item);throw e;}}
export async function generateOriginal(contract:Contract,signal?:AbortSignal){const session=fileSession();check(session.current,signal);const result=await Print.printToFileAsync({html:originalHtml(contract),width:595,height:842});const item=adopt(result.uri,`${safeFilename(contract.title)}.pdf`,true);try{check(session.current,signal);return item;}catch(e){discardFile(item);throw e;}}
export async function shareFile(item:LocalDocument,signal?:AbortSignal){const session=fileSession();check(session.current,signal);if(!await Sharing.isAvailableAsync())throw new Error('Compartilhamento indisponível neste dispositivo.');check(session.current,signal);await Sharing.shareAsync(item.uri,{mimeType:item.mime,dialogTitle:item.name});}
export async function uploadFile<T>(path:string,item:LocalDocument,signal:AbortSignal,options:{revision?:number;visibleToClient?:boolean}={}){
 const session=fileSession();check(session.current,signal);const file=new File(item.uri);validateSelectedFile(item.name,file.size,options.revision!==undefined);const form=new FormData();form.append('documento',file,item.name);if(options.visibleToClient!==undefined)form.append('visibleToClient',String(options.visibleToClient));
 return createFileTransfer({baseUrl:readEnvironment().apiUrl,...session,fetcher:expoFetch})<T>(path,{method:'POST',body:form,revision:options.revision,signal});
}
export async function downloadAndShare(path:string,name:string,size:number,mime:string,signal:AbortSignal){
 const session=fileSession();check(session.current,signal);const bytes=await createFileTransfer({baseUrl:readEnvironment().apiUrl,...session,fetcher:expoFetch})<Uint8Array>(path,{binary:true,expectedSize:size,expectedType:mime,signal});check(session.current,signal);const file=target(name);file.write(bytes);const item={uri:file.uri,name:file.name,size:bytes.length,mime};try{check(session.current,signal);await shareFile(item,signal);}catch(e){discardFile(item);throw e;}
}

export async function exportText(name:string,contents:string,mime:string,signal:AbortSignal){const session=fileSession();check(session.current,signal);const file=target(name);file.write(contents);const item={uri:file.uri,name:file.name,size:file.size,mime};try{await shareFile(item,signal);}catch(e){discardFile(item);throw e;}}
export async function exportPDF(name:string,html:string,signal:AbortSignal){const session=fileSession();check(session.current,signal);const result=await Print.printToFileAsync({html,width:595,height:842});const item=adopt(result.uri,name,true);try{check(session.current,signal);await shareFile(item,signal);}catch(e){discardFile(item);throw e;}}

export async function pickAndUploadImage<T>(path:string,field:'logo'|'image',limit:2|4,signal:AbortSignal){
 const session=fileSession();check(session.current,signal);const result=await Picker.getDocumentAsync({type:['image/png','image/jpeg','image/webp'],copyToCacheDirectory:true,multiple:false});if(result.canceled)return null;
 const item=adopt(result.assets[0].uri,result.assets[0].name,false);try{check(session.current,signal);validateImage(item.name,item.size,limit);const file=new File(item.uri);const form=new FormData();form.append(field,file,item.name);return await createFileTransfer({baseUrl:readEnvironment().apiUrl,...session,fetcher:expoFetch})<T>(path,{method:'POST',body:form,signal});}finally{discardFile(item);}
}
