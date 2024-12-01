import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../constants/helpers/common'
import Avatar from '../../components/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import Input from '../../components/Input'
import Button from '../../components/Button'
import * as ImagePicker from 'expo-image-picker';
import {Image} from "expo-image";
import { getSupabaseFileUrl } from '../../services/imageService'
import {Video} from 'expo-av';
import { createOrUpdatePost, createOrUpdateProduct } from '../../services/postService'
import { showAlert } from '../../utilities/showAlert';

const newProduct = () => {
  
  const product = useLocalSearchParams();
  console.log("edit : ",product)
  const {user} = useAuth();
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  const [file,setFile]= useState(null);
  const detailsRef=useRef("");
  const nameRef=useRef("");
  const priceRef=useRef("");
  const categoryRef=useRef("");
  const addressRef=useRef("");
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
    categoryRef.current = value;
  };


useEffect(()=>{
  console.log("edit",product.id)
  
  if(product && product.id){
    nameRef.current=product.name;
    categoryRef.current=product.category;
    priceRef.current=product.price;
    detailsRef.current = product.details;
    addressRef.current=product.address;
    setFile(product.file || null);
  }
},[])

  const onPick=async(isImage)=>{

    let mediaConfig={
      mediaTypes:ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect:[4,5],
      quality :1,
    }

    if(!isImage){
      mediaConfig = {
      mediaTypes:ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality :1,
    }
  }

  let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);


    if(!result.canceled)
    {
      setFile(result.assets[0]);
    }
  
  }

  const isLocalFile =file=>{
    if(!file) return null;
    if(typeof file =="object") return true;

    return false;

  }

  const getFileType= file =>{
    if(!file) return null;
    if(isLocalFile(file)){
      return file.type;
    }

    if(file.includes('productImages')){
      return 'image';
    }
    return 'video';
  }

  const getFileUri= file =>{
    if(!file) return null;
    if(isLocalFile(file)) {
      return file.uri;
    }

    return getSupabaseFileUrl(file)?.uri;
  }
  
  
  const onSubmit = async()=>{

    if (
      !detailsRef.current?.trim() || 
      !file || 
      !categoryRef.current?.trim() || 
      !priceRef.current?.trim() || 
      !nameRef.current?.trim() || !addressRef.current?.trim()
    ) {
      showAlert("Product", "Please fill in all required fields");
      return; // Exit early if validation fails
    }
    
    let data={
      file,
      details: detailsRef?.current.trim(),
      price:priceRef?.current.trim(),
      category:categoryRef?.current.trim(),
      name:nameRef?.current.trim(),
      userId:user?.id,
      address:addressRef?.current.trim()
    }
    if(product && product.id) data.id= product.id;
    //post
    setLoading(true);

    let res = await createOrUpdateProduct(data);

    setLoading(false);

    console.log("body post : ",data);
    console.log("res : ",res);

    if(res.success){
      setFile(null);
      detailsRef.current="";
      nameRef.current="";
      priceRef.current="";
      categoryRef.current="";
      addressRef.current="";
      router.back();
    }
    else{
      showAlert("Product,",res.msg);
    }
    console.log("res ",res);
     

  }
  
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
      
      <ScrollView contentContainerStyle={{gap:30}}>
      
      <Header title={product && product.id? "Edit product":"New product"}/>
        {/*avatar*/}
              <View style={styles.header}>
                  <Avatar
                      uri={user?.image}
                      size={hp(6.5)}
                      rounded={theme.radius.xl}
                  />
                  <View style={{gap:2}}>
                    <Text style={styles.userName}>{user && user?.name}</Text>
                    <Text style={styles.postTime}>{user && user?.address}</Text>
                  </View>
              </View>
              <View style={{gap:25}}>
              <Input 
              placeholder="Product Name"
              onChangeText={value=>nameRef.current=value}
              />
              <Input 
                  placeholder={detailsRef.current || "Product Deatails"}
                  multiline
                  containerStyle={styles.bio }
                  onChangeText={value=>detailsRef.current=value}
              />
              
                <View style={styles.optionContainer}>
                <Text style={styles.title}>Choose an option:</Text>
                
                <View style={styles.radioContainer}>
                    <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => handleOptionSelect('Sharing')}
                    >
                    <View
                        style={[
                        styles.outerCircle,
                        selectedOption === 'Sharing' && styles.selectedOuterCircle,
                        ]}
                    >
                        {selectedOption === 'Sharing' && <View style={styles.innerCircle} />}
                    </View>
                    <Text style={styles.label}>Sharing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => handleOptionSelect('Product')}
                    >
                    <View
                        style={[
                        styles.outerCircle,
                        selectedOption === 'Product' && styles.selectedOuterCircle,
                        ]}
                    >
                        {selectedOption === 'Product' && <View style={styles.innerCircle} />}
                    </View>
                    <Text style={styles.label}>Product</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.selectedText}>Selected: {selectedOption || 'None'}</Text>
                </View>
                <Input 
                placeholder="Price ₹XXXXXX"
                onChangeText={value=>priceRef.current=value}
                />
                <Input 
              placeholder='Address'
              onChangeText={value=>addressRef.current=value}
              />
              </View>
                  {
                    file && (
                      <View style={styles.file}>
                          {
                            getFileType(file) == "video" ?(
                              <Video
                              style={{flex:1}}
                              source={{uri: getFileUri(file)}}
                              useNativeControls
                              resizeMode='cover'
                              isLooping
                              />
                            ):(
                              <Image source={{uri: getFileUri(file)}} 
                              contentFit='cover'
                              style={{flex:1}}/>
                            )
                          }
                          <Pressable style={styles.closeIcon} onPress={()=>setFile(null)}>
                            <Icon name="times-circle" color="white" size={22}/>
                          </Pressable>
                      </View>
                    )
                  }
              
              
                <View style={styles.media}>
                  <View> 
                    <Text style={styles.addImageText}>Add Image or Video</Text>
                   </View>
                  <View style={styles.mediaIcons}>
                    
                    <TouchableOpacity onPress={()=>onPick(true)}>
                    <Icon name="image" size={hp(3.8)} strokeWidth={1} color={theme.colors.textDark}/>
                    </TouchableOpacity>
                    
                    
                    <TouchableOpacity onPress={()=>onPick(false)}>
                    <Icon name="video-camera" size={hp(3.8)} strokeWidth={1} color={theme.colors.textDark}/>
                    </TouchableOpacity>
                    
                  </View>
                </View>
                <Button title={product && product.id? "Update":"Sell"} loading={loading} onpress={onSubmit}
                    hasShadow={false}
                    buttonStyle={{height:hp(6.2)}}
                />  
             
      </ScrollView>
    
      </View>
      
    </ScreenWrapper>
    
  )
}

export default newProduct

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:wp(4),
},
file : {
  height:hp(30),
  width:"100%",
  borderRadius : theme.radius.xl,
  overflow : "hidden",
  borderCurve: "continuous",

},
header:{
    flexDirection:"row",
    alignItems:"center",
    gap:12,
},
bio:{
  flexDirection:'row',
  height:hp(18),
  alignItems:'flex-start',
  paddingVertical:15,
},
mediaIcons:{
  marginLeft:wp(23),
  flexDirection:"row",
  gap:20,
  //alignItems:"center",
},
addImageText:{
  fontSize:hp(1.9),
  fontWeight:theme.fonts.semiBold,
  color:theme.colors.text,
},
closeIcon:{
  position:"absolute",
  top:10,
  right:10,
  padding:7,
  backgroundColor:"rgba(240,0,0,0.3)",
  borderRadius:50,

},
media:{
  flexDirection:"row",
  justifycontent:"space-between",
  //alignItems:"center",
  borderWidth:1.5,
  padding :12,
  paddingHorizontal:18,
  borderRadius:theme.radius.xl,
  borderCurve:"continuous",
  borderColor:theme.colors.gray,
},
optionContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedOuterCircle: {
    borderColor: '#007BFF',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
  },
  label: {
    fontSize: 16,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
  },

})