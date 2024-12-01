import { StyleSheet, Image, View, Text, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { hp, wp } from '../constants/helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { StatusBar } from 'react-native-web'
import { useRouter } from 'expo-router'


const welcome = () => {
  const router= useRouter();  
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark"/>
      <View style={styles.container}> 
        
        {/*welcome image*/}
        <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/welcom02.png')} />

        {/*welcome text*/}
        <View style={{gap:10}}>
            <Text style={styles.title}>KrishiBook</Text>
            <Text style={styles.punchline}>Where every crop has its story—let’s grow together!</Text>

        </View>
      </View>
      {/*footer*/}
      <View style={styles.footer}>
        <Button 
        title="Getting Started"
        buttonStyle={{marginHorizontal:wp(3)}}  
        onpress={()=>{router.push('/signup')}}
        />
        <View style={styles.bottomTextContainer}>
          <Text style={styles.loginText}>Already have an account!</Text>
          <Pressable onPress={()=>{router.push('/login')}}>
            <Text style={{color:theme.colors.primaryDark, fontWeight:theme.fonts.bold,fontSize:hp(1.8)}}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    flex: 0.97,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor:'white',
    paddingHorizontal: wp(4),
  },
  welcomeImage: {
    width: wp(85),
    height: hp(45),
    alignSelf: 'center',
    opacity:0.75,
  },
  title:{
    color:theme.colors.text,
    fontSize: hp(6),
    textAlign: 'center',
    fontWeight:theme.fonts.extraBold,
  },
  punchline:{
    color: theme.colors.text,
    fontSize: hp(1.9),
    textAlign: 'center',
    paddingHorizontal: wp(10),

  },
  footer:{
    gap:30,
    width: '100%',
  },
  bottomTextContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    gap:5,
  },
  loginText:{
    color:theme.colors.text,
    fontSize:hp(1.8),
  },
}) 