import {useLocalSearchParams} from 'expo-router';
import {DocumentScreen} from '../../components/files/DocumentScreen';
import {documentBase} from '../../domain/files';
import {Page,Label} from '../../components/ui';
export default function DocumentRoute(){const {id,scope}=useLocalSearchParams<{id:string;scope:string}>();let base='';try{base=documentBase(scope,id);}catch{}return base?<DocumentScreen key={base} base={base} scope={scope}/>:<Page><Label>Recurso inválido.</Label></Page>;}
