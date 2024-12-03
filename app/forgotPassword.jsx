import { StyleSheet, Text, View,Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Icon from 'react-native-vector-icons/FontAwesome';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { StatusBar, TextInput } from 'react-native-web';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/helpers/common'
import Input from '../components/Input';
import Button from '../components/Button';

const login = () => {
  const router =useRouter()
  const emailRef= useRef("")
  const passwordRef= useRef("")
  const [loading, setLoading]=useState(false);
  const onSubmit =async()=>{
    if(!emailRef.current|| !passwordRef.current){
      Alert.alert("Login","Please fill the fields!")
      return
    }
  }
  
  return (
    <ScreenWrapper bg="white">
        <StatusBar style="dark"/>
        <View style={styles.container}>
          <BackButton router={router}/>

          {/*Welcom Text*/}
          <View>
            <Text style={styles.welcomeText}>forgot,</Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>
          </View>

          {/*form input*/}
            <View style={styles.form}>
              <Text style={{fontSize:hp(2), color:theme.colors.text }}>
                Please login to continue
              </Text>
              <Input 
              icon={ <Icon name="envelope" size={20} strokeWidth={1.6} /> }
              placeholder="Enter your email"
              onChangeText={value=>emailRef.current=value}
              />
              <Input 
              icon={ <Icon name="lock" size={26} strokeWidth={1.6} /> }
              placeholder="Enter your password"
              secureTextEntry
              onChangeText={value=>passwordRef.current=value}
              />
             <Text style={styles.forgotPassword }>Forgot Password?</Text>
             {/*Buton*/}
             <Button title={'login'} loading={loading} onPress={onSubmit}/>
            </View>
            {/*footer*/}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?
              </Text>
              <Pressable onPress={()=>{router.push('/signup')}}>
                <Text style={[styles.footerText,{color:theme.colors.primaryDark,fontWeight:theme.fonts.semiBold}]}>Sign up</Text>
              </Pressable>
            </View>
        </View>  
    </ScreenWrapper>
  )
} 

export default login

const styles = StyleSheet.create({
  container:{
      flex:1,
      gap:45,
      paddingHorizontal:wp(5),
  },
  welcomeText:{
    fontSize:hp(4),
    fontWeight:theme.fonts.bold,
    color:theme.colors.text,
  },
  form:{
    gap:25,
  },
forgotPassword:{
  textAlign:'right',
  fontWeight:theme.fonts.semiBold,
  color:theme.colors.text,
},
footer:{
  flexDirection:'row',
  gap:5,
  alignItems:'center',
  justifyContent:'center'
},
footerText:{
  textAlign:'center',
  color:theme.colors.text,
  fontSize:hp(1.8),
},

})