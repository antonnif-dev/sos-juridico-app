import React from 'react';
import {Stack} from 'expo-router';
export default function ClientLayout(){return <Stack screenOptions={{headerShown:false}}><Stack.Screen name="index"/><Stack.Screen name="novo" options={{gestureEnabled:false}}/><Stack.Screen name="[id]"/></Stack>;}
