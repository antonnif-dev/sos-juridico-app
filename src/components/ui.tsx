import React,{createContext,useContext} from 'react';
import { ActivityIndicator,KeyboardAvoidingView,Platform,Pressable,ScrollView,Text,TextInput,View,type TextInputProps,type TextProps,RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router,usePathname } from 'expo-router';
import { useOptionalSession } from '../auth/SessionProvider';
import { useTheme } from '../theme/ThemeProvider';
import { readableColor,size } from '../domain/theme';
import { Brand } from './Brand';
const SurfaceBackground=createContext<string|undefined>(undefined);
export function Label({variant='body',style,...props}:TextProps&{variant?:'body'|'muted'|'title'|'subtitle'|'heading3'|'small'}){
 const {theme,font,bold}=useTheme();const background=useContext(SurfaceBackground)||theme.corFundo;const heading=variant==='title'||variant==='subtitle'||variant==='heading3';
 const fontSize=variant==='title'?size(theme.fontSizeH1,24,36):variant==='subtitle'?size(theme.fontSizeH2,19,30):variant==='heading3'?size(theme.fontSizeH3,17,26):variant==='small'?Math.max(12,size(theme.fontSizeBase,14,18)-2):size(theme.fontSizeBase,14,18);
 return <Text {...props} style={[{fontFamily:heading?bold:font,fontWeight:heading?'700':'400',fontSize,lineHeight:fontSize*1.5,color:readableColor(variant==='muted'||variant==='small'?theme.corTextoSecundario:theme.corTextoPrimario,background)},style]}/>;
}
export function Page({children,onNavigate,disabled=false,refreshing=false,onRefresh}:React.PropsWithChildren<{onNavigate?:(go:()=>void)=>void;disabled?:boolean;refreshing?:boolean;onRefresh?:()=>void}>){
 const session=useOptionalSession();const {theme,font,bold}=useTheme();const path=usePathname();const authenticated=!!session?.profile;
 const go=(href:'/'|'/menu'|'/perfil')=>{const action=()=>router.replace(href);if(onNavigate)onNavigate(action);else action();};
 return <SafeAreaView style={{flex:1,backgroundColor:theme.corFundo}}>
 {authenticated&&<Brand/>}
 <KeyboardAvoidingView className="flex-1" behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView refreshControl={onRefresh?<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.corPrimaria}/>:undefined} contentContainerStyle={{padding:20,flexGrow:1}} keyboardShouldPersistTaps="handled"><SurfaceBackground.Provider value={theme.corFundo}><View className="w-full max-w-2xl self-center gap-5">{children}</View></SurfaceBackground.Provider></ScrollView></KeyboardAvoidingView>
 {authenticated&&<View className="flex-row border-t" style={{backgroundColor:theme.corFooterFundo,borderColor:theme.corBorda}}>{([{href:'/',label:'Início'},{href:'/menu',label:'Menu'},{href:'/perfil',label:'Perfil'}] as const).map(item=>{
 const active=path===item.href||(item.href==='/menu'&&(path.startsWith('/equipe')||path==='/tema'||path.startsWith('/site')||path.startsWith('/ia')||path.startsWith('/datajud')||path.startsWith('/portal')||path.startsWith('/mensagens')||path==='/notificacoes'||path.startsWith('/financeiro')||path.startsWith('/relatorios')||path.startsWith('/documentos')||path.startsWith('/contratos')||path.startsWith('/modulo/')||path.startsWith('/clientes')||path.startsWith('/processos')||path.startsWith('/agenda')||path.startsWith('/triagem')||path==='/atendimento'||path==='/pos-atendimento'||path==='/painel'));
 return <Pressable key={item.href} disabled={disabled} accessibilityRole="tab" accessibilityState={{selected:active,disabled}} onPress={()=>{if(path!==item.href)go(item.href);}} className="min-h-16 flex-1 items-center justify-center px-2 py-3" style={{opacity:disabled?.5:1,borderTopWidth:3,borderTopColor:active?theme.corFooterAtivo:'transparent'}}><Text style={{fontFamily:active?bold:font,fontWeight:active?'700':'400',fontSize:14,color:readableColor(active?theme.corFooterAtivo:theme.corFooterTexto,theme.corFooterFundo)}}>{item.label}</Text></Pressable>;
 })}</View>}
 </SafeAreaView>;
}
export function Button({title,onPress,disabled,secondary,color}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean;color?:string}){
 const {theme,bold}=useTheme();const bg=secondary?theme.corFundoCard:color||theme.corPrimaria;
 return <Pressable accessibilityRole="button" accessibilityState={{disabled:!!disabled}} disabled={disabled} onPress={onPress} className="min-h-12 items-center justify-center rounded-xl border px-4 py-3" style={{backgroundColor:bg,borderColor:secondary?theme.corBorda:bg,opacity:disabled?.5:1}}><Text style={{fontFamily:bold,fontWeight:'700',fontSize:size(theme.fontSizeBase,14,18),color:readableColor(secondary?theme.corTextoPrimario:'#ffffff',bg)}}>{title}</Text></Pressable>;
}
export function Field({label,error,...props}:TextInputProps&{label:string;error?:string}){
 const {theme,font}=useTheme();return <View className="gap-2"><Label>{label}</Label><TextInput accessibilityLabel={label} placeholderTextColor={readableColor(theme.corTextoSecundario,theme.corFundoCard)} className="min-h-12 rounded-xl border px-4 py-3" style={{backgroundColor:theme.corFundoCard,borderColor:error?'#b91c1c':theme.corBorda,color:readableColor(theme.corTextoPrimario,theme.corFundoCard),fontFamily:font,fontSize:size(theme.fontSizeBase,16,18),opacity:props.editable===false?.7:1}} {...props}/>{error&&<Label accessibilityLiveRegion="polite" style={{color:'#b91c1c'}}>{error}</Label>}</View>;
}
export function Choice({label,value,options,onChange,disabled}:{label:string;value:string;options:string[];onChange:(value:string)=>void;disabled?:boolean}){
 return <View className="gap-2"><Label>{label}</Label><View className="flex-row flex-wrap gap-2">{options.map(option=><Button key={option} title={option||'Não informado'} secondary={value!==option} disabled={disabled} onPress={()=>onChange(option)}/>)}</View></View>;
}
export function Card({children}:React.PropsWithChildren){const {theme}=useTheme();return <View className="gap-4 rounded-2xl border p-5" style={{backgroundColor:theme.corFundoCard,borderColor:theme.corBorda}}><SurfaceBackground.Provider value={theme.corFundoCard}>{children}</SurfaceBackground.Provider></View>;}
export function Message({text}:{text?:string}){return text?<Label variant="muted" accessibilityLiveRegion="polite">{text}</Label>:null;}
export function Loading(){const {theme}=useTheme();return <Page><ActivityIndicator size="large" color={theme.corPrimaria}/><Label style={{textAlign:'center'}}>Verificando sua sessão…</Label></Page>;}
export function EmptyState({title,description}:{title:string;description:string}){return <Card><Label variant="subtitle">{title}</Label><Message text={description}/></Card>;}
export function ErrorState({message,onRetry}:{message:string;onRetry:()=>void}){return <Card><Label variant="subtitle">Não foi possível carregar</Label><Message text={message}/><Button title="Tentar novamente" onPress={onRetry}/></Card>;}
