import { StyleSheet, Text, View ,Pressable, Alert, KeyboardAvoidingView, ScrollView} from 'react-native'
import React, {useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Icon from 'react-native-vector-icons/FontAwesome';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { StatusBar, TextInput } from 'react-native-web';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/helpers/common'
import Input from '../components/Input';
import Button from '../components/Button';
import { useRef } from 'react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utilities/showAlert'

const signup = () => {

  const router =useRouter();
  const emailRef= useRef("")
  const passwordRef= useRef("")
  const nameRef= useRef("")
  const [loading, setLoading] = useState(false);
  

  const onSubmit = async ()=> {

    if(!emailRef.current || !passwordRef.current) {
      showAlert("Sign up","Please fill the fields!");
      return;
    }
    
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    
    setLoading(true);

    const {
      data:{session}, error}= await supabase.auth.signUp({
        email,
        password,
        options:{data:{name,email}}
  });

  setLoading(false);

    console.log('session',session)
    console.log('error',error)
    
  if(error){
    showAlert("Sign up",error.message)

  }}

  return (
    <ScreenWrapper bg="white">
      
        <ScrollView>
        <StatusBar style="dark"/>
        <View style={styles.container}>
          <BackButton router={router}/>

          {/*Welcom Text*/}
          <View>
            <Text style={styles.welcomeText}>Let's,</Text>
            <Text style={styles.welcomeText}>Get Started</Text>
          </View>

          {/*form input*/}
            <View style={styles.form}>
              <Text style={{fontSize:hp(2), color:theme.colors.text }}>
                Please fill the details to create an account
              </Text>
              <Input 
              icon={ <Icon name="user" size={24} strokeWidth={1.6} /> }
              placeholder="Enter your Name"
              onChangeText={value=>nameRef.current=value}
              />
              
              <Input 
              icon={ <Icon name="leaf" size={26} strokeWidth={1.6} /> }
              placeholder="Enter Farmer id"
              secureTextEntry
              />

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

             {/*Buton*/}
              
                <Button title={'Sign up'} loading={loading} onpress={onSubmit}/>
             

            </View>
            {/*footer*/}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?
              </Text>
              <Pressable onPress={()=>{router.push('/login')}}>
                <Text style={[styles.footerText,{color:theme.colors.primaryDark,fontWeight:theme.fonts.semiBold}]}>Login</Text>
              </Pressable>
            </View>
        </View>  
        
        </ScrollView>
      
    </ScreenWrapper>
  )
} 

export default signup

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
