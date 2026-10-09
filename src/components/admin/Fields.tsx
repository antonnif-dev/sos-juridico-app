import React from 'react';
import {Field} from '../ui';
import type {Spec} from '../../domain/administration';
export function Fields({specs,value,onChange,disabled=false}:{specs:readonly Spec[];value:Record<string,unknown>;onChange:(key:string,value:string)=>void;disabled?:boolean}){return <>{specs.map(([key,label,max])=><Field key={key} label={label} value={typeof value[key]==='string'?value[key] as string:''} onChangeText={v=>onChange(key,v)} maxLength={max} multiline={max>=320} autoCapitalize={/email|Url|slug/.test(key)?'none':'sentences'} autoCorrect={!/email|Url|slug/.test(key)} editable={!disabled}/>)}</>;}
