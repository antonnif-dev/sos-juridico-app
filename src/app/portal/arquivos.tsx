import {useLocalSearchParams} from 'expo-router';
import {DocumentScreen} from '../../components/files/DocumentScreen';
import {portalDocumentBase} from '../../domain/portal';
import {Page,Label} from '../../components/ui';
export default function Route(){const {scope,id}=useLocalSearchParams<{scope:string;id:string}>();let base='';try{base=portalDocumentBase(scope,id);}catch{}return base?<DocumentScreen key={base} base={base} scope={scope} portal/>:<Page><Label>Recurso inválido.</Label></Page>;}
