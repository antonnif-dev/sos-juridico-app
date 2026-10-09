import {router} from 'expo-router';
import {Button,Label,Page} from '../../components/ui';
export default function Ai(){return <Page><Label variant="title">SOS IA</Label><Label>Assistente e análises dos registros autorizados do escritório.</Label><Button title="Assistente jurídico" onPress={()=>router.push('/ia/chat')}/><Button title="Análises de casos e histórico" onPress={()=>router.push('/ia/casos')}/><Button title="Uso e tickets" onPress={()=>router.push('/ia/uso')}/></Page>;}
