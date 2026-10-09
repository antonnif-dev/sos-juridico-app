import {useCallback} from 'react';
import {Alert,BackHandler} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
export function useDraftExit(dirty:boolean,busy:boolean,onBack?:()=>void){

 const leave=useCallback((go:()=>void)=>{if(busy)return;if(!dirty){go();return;}Alert.alert('Descartar alterações?','As alterações ainda não foram salvas.',[{text:'Continuar editando',style:'cancel'},{text:'Descartar',style:'destructive',onPress:go}]);},[dirty,busy]);
 useFocusEffect(useCallback(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{leave(onBack||(()=>router.back()));return true;});return ()=>sub.remove();},[leave,onBack]));return leave;
}
