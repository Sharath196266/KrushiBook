import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { hp } from '../constants/helpers/common';

const  SettingButton = ({size=25}) => {
const router=useRouter();
  return (
    <Pressable onPress={()=>router.push('/settings')} style={styles.button}>
        <Icon name='gear' strokeWidth={4} size={size} color='theme.colors.textLight'/>
    </Pressable>
  )
}

export default SettingButton

const styles = StyleSheet.create({
    button:{
        position:'absolute',
        right:0,
        padding:5,
        borderCurve:'continuous',
        borderRadius:theme.radius.sm,
        backgroundColor:'rgba(0,0,0,0.07)',

    },
})