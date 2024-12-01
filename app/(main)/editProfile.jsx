import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import {hp,wp} from "../../constants/helpers/common"
import { theme } from '../../constants/theme'
import { ScrollView } from 'react-native'
import Header from '../../components/Header'
import { Image } from 'expo-image'
import { useAuth } from '../../contexts/AuthContext'
import  Icon  from 'react-native-vector-icons/FontAwesome'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useRouter } from 'expo-router'
import  {getUserImageSrc, uploadFile} from '../../services/imageService'
import { updateUser } from '../../services/userService'
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../../utilities/showAlert'


const editProfile = () => {

    const {user:currentUser,setUserData}=useAuth();

    const[user,setUser] =useState({
        name:'',
        phoneNumber:'',
        bio:'',
        image:null,
        address:'',
    });

    const router=useRouter();
    
    const [loading,setLoading]=useState(false);

    useEffect(()=>{
        if(currentUser){
           setUser({
               name:currentUser.name ||'',
               phoneNumber : currentUser.phoneNumber || '',
               bio:currentUser.bio || '',
               image:currentUser.image || '',
               address:currentUser.address || '',
           })
        }
   },[currentUser]);

   const onPickImage = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect:[4,5],
        quality :0.7,
    });
    if(!result.canceled){
        setUser({...user,image: result.assets[0]})
    }

   }

   const onSubmit =async()=>{
        let userData={...user};
        let {name,phoneNumber,bio,image,address} = userData; 
        if(!name || !phoneNumber || !bio || !address || (Platform.OS !== "web" && !image) )
            {
            showAlert("Profile","Please fill all fields")
            return;
            }
            setLoading(true);

            if(typeof image =='object')
            {
                // upload user
                 let imageRes = await uploadFile('profiles',image?.uri,true);
                 if(imageRes.success)
                 {
                    userData.image = imageRes.data;
                 }
                 else{
                    userData.image= null;
                 }
            }

            //update user
            const res=await updateUser(currentUser?.id,userData);

            setLoading(false);
  
            if(res.success)
                {
                setUserData({...currentUser,...userData});
                if(Platform.OS !== "web"){
                router.back();}
                else{
                    router.replace("/profile");
                }
                }

    
   }


    let imageSource =  user.image && typeof user.image == "object"? user.image.uri :getUserImageSrc(user?.image);

  return (
    <ScreenWrapper bg="white">
        <View style={styles.container}>
            
            <ScrollView style={{flex:1}}>
                <Header title="Edit Profile" mb={2}/>

                {/* USER INFO FORM*/}
                <View style={styles.form}>

                    <View style={styles.avatarContainer}>
                        <Image 
                            source={imageSource}
                            style={styles.avatar}
                        />{ Platform.OS !== "web" && (
                        <Pressable style={styles.cameraIcon}>
                            <Icon name="camera" size={20} strokewidth={2.5} onPress={onPickImage}/>
                        </Pressable>)}
                    </View>

                    <Text style={{fontSize:hp(1.5), color:theme.colors.textLight}}>
                        Please fill your profile information
                    </Text>
                    <Input 
                           icon={ <Icon name="user" size={26} strokeWidth={1.6} /> }
                             placeholder="Enter your Name"
                             value={user.name}
                           onChangeText={value=>setUser({...user,name:value})}
                    />

                     <Input 
                            icon={ <Icon name="phone" size={24} strokeWidth={1.6} /> }
                            placeholder="Enter your phone number"
                            value={user.phoneNumber}
                            onChangeText={value=>setUser({...user,phoneNumber:value})}
                      />

                     <Input 
                         icon={ <Icon name="map-marker" size={24} strokeWidth={1.6} /> }
                        placeholder="Enter your address"
                        value={user.address}
                         onChangeText={value=>setUser({...user,address:value})}
                      />
                       <Input 
                        placeholder="Enter your Bio"
                        value={user.bio}
                        multiline
                        containerStyle={styles.bio }
                        onChangeText={value=>setUser({...user,bio:value})}
                      />

                       <Button title={"Update"} loading={loading} onpress={onSubmit} />

                </View>

            </ScrollView>
        </View>
    </ScreenWrapper>
  )
}

export default editProfile

const styles = StyleSheet.create({
    bio:{
        flexDirection:'row',
        height:hp(15),
        alignItems:'flex-start',
        paddingVertical:15,

    },
    container:{
        flex:1,
        paddingHorizontal:wp(4),
        marginBottom:30,
        gap:15,
    },
    avatar:{
        width:wp(45),
        height:hp(22),
        borderRadius:theme.radius.xxl*2.5,
        borderCurve:"continuous",
        borderWidth:1,
        borderColor:theme.colors.darkLight,
        size:50,

    },
    form:{
        flex:1,
        justifyContent:'center',
        paddingVertical:hp(6),
        flexDirection:'column',
        gap:18,
    },
   input:{
    flexDirection:'row',
    borderWidth:0.4,  
    borderColor:theme.colors.textLight,
    borderRadius:theme.radius.xxl,
    padding:17,
    paddingHorizontal:20,
    gap:15,

   },
    avatarContainer:{
        height:hp(22),
        width:wp(22),
        alignSelf:'center',
        alignItems:'center',
    },
    cameraIcon:{
        position:'absolute',
        bottom:0,
        right:-(wp(10)),
        padding:7,
        borderRadius:50,
        backgroundColor:"white",
        shadowColor:theme.colors.textLight,
        shadowOffset:{width:0,height:4},
        shadowOpacity:0.5,
        shadowRadius:5,
        elevation:7,
        
    },
    info:{
        flexDirection:'row',
        alignItems:'center',
        gap:10,
    },
    userName:{
        fontSize:hp(3.5),
        fontWeight:'semiBold',
        color:theme.colors.text,
    },
})