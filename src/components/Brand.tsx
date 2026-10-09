import React,{useId} from 'react';
import { View,Text } from 'react-native';
import Svg,{Defs,ClipPath,Circle,Rect,Polygon,Image} from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { readableColor,size } from '../domain/theme';
export function Brand(){
 const {theme,bold}=useTheme();const id=useId().replace(/[^a-zA-Z0-9]/g,'');
 const image=theme.headerType==='image'&&theme.logoUrl; const shape=theme.headerLogoShape;
 const side=size(theme.headerLogoSize,24,40);
 return <View className="min-h-16 flex-row items-center gap-3 px-5 py-3" style={{backgroundColor:theme.corNavbarFundo,borderBottomWidth:1,borderBottomColor:theme.corBorda}}>
 {image?<Svg width={side} height={side} viewBox="0 0 100 100" accessibilityLabel={theme.headerTitle}>
  <Defs><ClipPath id={id}>{shape==='circle'?<Circle cx="50" cy="50" r="50"/>:shape==='triangle'?<Polygon points="50,0 100,100 0,100"/>:shape==='diamond'?<Polygon points="50,0 100,50 50,100 0,50"/>:<Rect width="100" height="100" rx={shape==='rounded'?18:0}/>}</ClipPath></Defs>
  <Image href={{uri:theme.logoUrl}} width="100" height="100" preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id})`}/>
 </Svg>:null}
 <Text className="flex-1" accessibilityRole="header" style={{fontFamily:bold,fontWeight:'700',fontSize:18,color:readableColor(theme.corNavbarTexto,theme.corNavbarFundo)}}>{theme.headerTitle}</Text>
 </View>;
}
