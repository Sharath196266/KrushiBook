 import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {theme} from '../constants/theme'
import {hp,wp} from '../constants/helpers/common'
import Loading from './Loading'
const Button = ({
    title='',
    buttonStyle,
    textStyle,
    onpress=()=>{},
    loading=false,
    hasShadow=true,
}) => {
    const shadowStyle={
        shadowColor:theme.colors.dark,
        shadowOffset:{
            width:0,
            height:10
        }, 
        shadowRadius:8,
        shadowOpacity:0.2,
        elevation:4
    }
    if(loading){
        return(
        <View style={[styles.button,buttonStyle,{backgroundColor:'white'}]}>
            <Loading />
        </View>
   ) }
  return (
    <Pressable onPress={onpress} style={[styles.button, hasShadow && buttonStyle]}>
    <Text style={[styles.text,textStyle]}>{title}</Text>
    </Pressable>
  )
}

export default Button

const styles = StyleSheet.create({
    button:{
        backgroundColor:theme.colors.primary,
        height:hp(6.6),
        justifyContent:'center',
        alignItems:'center',
        borderCurve:'continueous',
        borderRadius:theme.radius.xl,
    },
    text:{
        fontSize:hp(2.5),
        color:'white', 
        fontWeight:theme.fonts.bold,
    }
})