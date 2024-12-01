import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../constants/theme';

const  BackButton = ({size=20,router}) => {
  return (
    <Pressable onPress={()=> router.back()} style={styles.button}>
        <Icon name='chevron-left' strokeWidth={3} width={23} size={size} color='theme.colors.text'/>
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button:{
        alignSelf:'flex-start',
        padding:5,
        borderRadius:theme.radius.sm,
        backgroundColor:'rgba(0,0,0,0.07)',

    },
})