import type { Address } from '../domain/types';
export async function lookupCep(input:string,signal:AbortSignal):Promise<Partial<Address>>{
 const cep=input.replace(/\D/g,'');if(!/^\d{8}$/.test(cep))throw new Error('Informe um CEP com 8 dígitos.');
 // Public address lookup only: Firebase tokens never go to this service.
 const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal,headers:{Accept:'application/json'}});
 if(!response.ok)throw new Error('Não foi possível consultar o CEP. Você pode preencher o endereço manualmente.');
 const data=await response.json();if(data.erro)throw new Error('CEP não encontrado.');
 const text=(value:unknown)=>typeof value==='string'?value:'';
 return {cep,rua:text(data.logradouro),bairro:text(data.bairro),cidade:text(data.localidade),estado:text(data.uf)};
}
