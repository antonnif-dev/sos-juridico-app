import React,{useState} from 'react';
import {View} from 'react-native';
import {Button,Field,Label} from '../ui';
import {normalized} from '../../domain/cases';
export function SearchSelect({label,items,selected,onSelect,disabled=false}:{label:string;items:{id:string;label:string}[];selected:string[];onSelect:(id:string)=>void;disabled?:boolean}){
 const [query,setQuery]=useState('');const [limit,setLimit]=useState(10);const filtered=items.filter(i=>normalized(i.label).includes(normalized(query)));
 return <View className="gap-3"><Label variant="heading3">{label}</Label><Field label="Buscar por nome ou e-mail" value={query} editable={!disabled} onChangeText={v=>{setQuery(v);setLimit(10);}}/>{filtered.slice(0,limit).map(i=><Button key={i.id} title={(selected.includes(i.id)?'✓ ':'')+i.label} secondary={!selected.includes(i.id)} disabled={disabled} onPress={()=>onSelect(i.id)}/>)}{!filtered.length&&<Label>Nenhum resultado.</Label>}{filtered.length>limit&&<Button title="Mostrar mais" secondary disabled={disabled} onPress={()=>setLimit(l=>l+10)}/>}</View>;
}
