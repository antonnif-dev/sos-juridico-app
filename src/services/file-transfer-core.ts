import {ApiError,endpoint} from './api-core';
const LIMIT=10*1024*1024;
type ResponseLike={ok:boolean;status:number;headers:{get:(name:string)=>string|null};text:()=>Promise<string>;body:ReadableStream<Uint8Array>|null};
type Fetcher=(url:string,options:RequestInit)=>Promise<ResponseLike>;
type Options={method?:'GET'|'POST';body?:FormData;revision?:number;binary?:boolean;expectedSize?:number;expectedType?:string;signal?:AbortSignal};
export function createFileTransfer({baseUrl,token,current,fetcher,onFailure}:{baseUrl:string;token:()=>Promise<string>;current:()=>boolean;fetcher:Fetcher;onFailure?:(error:ApiError)=>void}){
 return async function transfer<T>(path:string,options:Options={}):Promise<T>{
  const url=endpoint(baseUrl,path);const controller=new AbortController();const abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted)abort();const timeout=setTimeout(abort,90000);
  try{
   const bearer=await token();if(controller.signal.aborted||!current())throw new ApiError('Operação interrompida.');
   const headers:Record<string,string>={Authorization:`Bearer ${bearer}`,Accept:options.binary?'application/octet-stream':'application/json'};
   if(options.revision!==undefined){if(!Number.isSafeInteger(options.revision)||options.revision<1)throw new ApiError('Revisão inválida.');headers['If-Match']=String(options.revision);}
   const response=await fetcher(url,{method:options.method||'GET',headers,body:options.body,redirect:'error',signal:controller.signal});
   if(!response.ok){let data:Record<string,unknown>={};try{data=JSON.parse(await response.text());}catch{}const error=new ApiError(typeof data.error==='string'?data.error:typeof data.message==='string'?data.message:'Não foi possível transferir o arquivo.',response.status,typeof data.code==='string'?data.code:'',(data.fields||{}) as Record<string,string>);if(current())onFailure?.(error);throw error;}
   if(!options.binary){const data=JSON.parse(await response.text());if(!current()||controller.signal.aborted)throw new ApiError('Sessão alterada. Atualize a consulta.');return data as T;}
   const mime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();if(options.expectedType&&mime!==options.expectedType)throw new ApiError('O servidor não retornou o tipo de arquivo esperado.');
   const advertised=Number(response.headers.get('content-length')||0);if(advertised>LIMIT)throw new ApiError('Arquivo excede 10 MB.');
   const reader=response.body?.getReader();if(!reader)throw new ApiError('Não foi possível ler o arquivo.');const chunks:Uint8Array[]=[];let size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;if(!current()||controller.signal.aborted)throw new ApiError('Download interrompido.');size+=value.length;if(size>LIMIT)throw new ApiError('Arquivo excede 10 MB.');chunks.push(value);}}catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
   if(!current()||controller.signal.aborted||!size||(options.expectedSize!==undefined&&size!==options.expectedSize)||(advertised&&advertised!==size))throw new ApiError('Download incompleto ou sessão alterada.');
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes as T;
  }catch(e){if(e instanceof ApiError)throw e;throw new ApiError(controller.signal.aborted?'Transferência interrompida ou excedeu o tempo. Confira a lista antes de reenviar.':'Não foi possível transferir. Confira a conexão e atualize a lista antes de tentar novamente.');}
  finally{controller.abort();clearTimeout(timeout);options.signal?.removeEventListener('abort',abort);}
 };
}
