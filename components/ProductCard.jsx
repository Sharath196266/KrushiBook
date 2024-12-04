import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/helpers/common';
import Avatar from './Avatar';
import moment from 'moment';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { downloadFile, getSupabaseFileUrl } from '../services/imageService';
import { Video } from 'expo-av';
import { createPostLike, removePostLike } from '../services/postService';
import Loading from './Loading';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { usePathname } from 'expo-router';
import { showAlert } from '../utilities/showAlert';
import { Linking } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import { Dimensions } from 'react-native';



const ProductCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  onDelete=()=>{},
  onEdit=()=>{},
  showDelete=false,
  showHeader = false,
  showContact=false,
  showView=false,
}) => {
  
  const [loading,setLoading] = useState(false);
  const [loadingW,setLoadingW] = useState(false);
  const {user,setAuth}=useAuth();
  const screenWidth = Dimensions.get('window').width;
  const isBigDisplay = screenWidth >= 600;  
  console.log("is big pro",isBigDisplay)     
  const isActive = (route) => {
    const pathname = usePathname();
    return pathname === route;
  };

  useEffect(() => {
    
  },[]);

  const openProductDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: 'productDetails', params: { productId: item?.id } });
  };

  const openProfile = () => {
    if(item?.user?.id === user?.id){
      router.push("/profile")
    }else{
    router.push({ pathname: 'profileOthers', params: { profileId: item?.user?.id } });
    }
  };

  const requestPhonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: 'Phone Call Permission',
          message: 'This app needs access to make phone calls',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Phone call permission granted');
      } else {
        console.log('Phone call permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const handleWhatsAppPress = () => {
    setLoadingW(true); 
    setTimeout(() => {
      onWhatsApp(); 
      setLoadingW(false); 
    }, 2000);
  };
  
  const onWhatsApp = async () => {
    setLoadingW(true);
    try {
      const phoneNumber = item?.user?.phoneNumber;
      const message = 'Hello '+`${item?.user?.name}`+',I am interested in buying this product '+`${item?.name}`+" of price "+`${item?.price}`+' '+`${item?.details}`;
      const url =  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;


      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      } else {
        console.log('WhatsApp is not installed or unable to open WhatsApp');
      }
    } catch (error) {
      console.error('Error during WhatsApp redirection:', error);
    }
    setLoadingW(false);
  };

  const onCall = async () => {
    setLoadingW(true);
    requestPhonePermission();
    try {
      const phoneNumber = item?.user?.phoneNumber;
      const url = `tel:${phoneNumber}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      } else {
        console.log('Cannot open the phone dialer');
      }
    } catch (error) {
      console.error('Error during call redirection:', error);
    }
    setLoadingW(false);
  };

  const onShare = async () => {
    try {
      setLoading(true);
      const msg = "Look out this product from KrushiBook\n"+`${item?.name}`+" of price "+`${item?.price}`+" \nSelling "+`${item?.user?.name}`+" "+`${item?.user?.phoneNumber}`+","+`${item?.user?.address}`;
      const content = { message: msg };
      if (item?.file) {
        const fileUrl = getSupabaseFileUrl(item?.file).uri;
  
        if (Platform.OS === 'ios') {
          content.url = await downloadFile(fileUrl);
        } else {
          const directoryUri = FileSystem.documentDirectory + 'postVideos/';
          const directoryExists = await FileSystem.readDirectoryAsync(directoryUri).catch(() => false);
  
          if (!directoryExists) {
            await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
          }
  
          const localUri = await FileSystem.downloadAsync(fileUrl, `${directoryUri}${item?.id}.mp4`);
          content.url = localUri.uri;
        }
      }
  
      setLoading(false);
      await Share.share(content);
    } catch (error) {
      setLoading(false);
      showAlert('Error', 'Sharing failed. Please try again.');
      console.error(error);
    }
  };
  
  const handleProductDelete = () => {
    if (Platform.OS !== "web") {
      // For iOS and Android
      Alert.alert(
        "Confirm",
        "Are you sure you want to delete?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Delete action canceled"),
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => onDelete(item),
            style: "destructive",
          },
        ]
      );
    } else {
      // For Web
      const isConfirmed = window.confirm("Are you sure you want to delete?");
      if (isConfirmed) {
        onDelete(item);
      }
    }
  };


  const created_At = moment(item?.created_at).format('MMM D');
  const isContentNoFile = (!isBigDisplay) ? styles.contentNoFile : styles.contentNoFileWeb;
  const isContentNoFilePLat = !isBigDisplay ? styles.content : styles.contentNoFileWeb;
  return (
      <View
        style={
          
            (Platform.OS !== 'web' && !isBigDisplay)
            ? [styles.containerProfile, hasShadow && styles.shadow] // iOS/Android styles
            : [styles.containerWebProfile, hasShadow && styles.shadow] // Web-specific styles
          
        }
      >
        

      {/* media and content */}
       
      <View style={item?.file ? (styles.content):(isContentNoFile)}>
        <View style={styles.postBody}>
        
     <View style={styles.header}>
     <Text style={{margin:5,fontWeight: '700',
    fontSize: hp(2.2),}}>{item?.name}</Text>
        {showMoreIcon && (
            <TouchableOpacity onPress={openProductDetails}>
              <Icon name="ellipsis-v" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {
            showDelete && currentUser.id == item?.user?.id && (
              Platform.OS !== "web" ? (
              <View style={styles.actions}>
                  <TouchableOpacity disabled={Platform.OS === "web"? true:false} onPress={Platform.OS != "web" ?()=>onEdit(item):showAlert("Post","Edit not available on web")}>
                    <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleProductDelete} >
                    <Icon name="trash" size={hp(2.5)}  color={theme.colors.rose} />
                  </TouchableOpacity>
              </View>
            ) :
            (
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleProductDelete} >
                    <Icon name="trash" size={hp(2.5)}  color={theme.colors.rose} />
                  </TouchableOpacity>
            </View>
          )
        
        )
        }
      </View>
          <Text style={styles.productPrice}>{"₹"+item?.price}</Text>
          <Text style={{margin:5,fontWeight:theme.fonts.textLight}}>{item?.details}</Text>
          {item?.file && item?.file.includes('productImages') && (
            <Image source={getSupabaseFileUrl(item?.file)} transition={100} 
            style={
               (( !isBigDisplay) ?[styles.postMediaProfile]:[styles.postMediaWeb,{height:hp(60)}])
            } 
            contentFit="cover" />
          )}

          {/* video */}
          {item?.file && item?.file.includes('productVideos') && (
            <Video
              style={ !isBigDisplay ?[styles.postMedia, { height: hp(30) }]:[styles.postMediaWeb,{height:hp(60)}]}
              source={getSupabaseFileUrl(item?.file)}
              useNativeControls
              resizeMode="cover"
              isLooping
            />
          )}
        </View>
        { showContact &&
        <View>
        <Text style={{margin:5,fontWeight:theme.fonts.textDark,marginBottom:10,marginTop:10}}>Contact Seller : </Text>
        { showHeader &&
        <TouchableOpacity onPress={openProfile}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            
            <Text style={styles.userName}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{created_At}</Text>
      
          </View>
        </View> 
        </TouchableOpacity>
        }
        <Text style={{margin:5,fontWeight:theme.fonts.text}}>{item?.address || item?.user?.address}</Text>
          <TouchableOpacity onPress={onCall}>
                <Text style={{margin:5,fontWeight:"bold"}}>{item?.user?.phoneNumber}</Text>
            </TouchableOpacity>
        </View>
       }
        <View style={{flexDirection:"row",justifyContent:"space-between"}}>
             {/* share */}
        <View style={styles.footerButtonShare}>
            {
              loading?(
                <Loading size="small"/>
              ):(
                <TouchableOpacity onPress={onShare}>
              <Icon name="share-square-o" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
              )
            } 
          </View>
          
            {/*buy*/}
        <View style={styles.footerButtonShare}>
        {showView && <TouchableOpacity onPress={openProductDetails}>
        <Text style={{fontSize:hp(2.5)}} >view</Text></TouchableOpacity>}
            {
              loadingW?(
                <Loading size="small"/>
              ):(
            <TouchableOpacity onPress={handleWhatsAppPress}>
                <Icon name="whatsapp" color={theme.colors.primary} size={26}/>
            </TouchableOpacity>
              )
            } 
          </View>
          </View>

      </View>
    
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  footerButton: {
    flexDirection: 'row',
    marginLeft: 5,
    alignItems: 'center',
    gap: 4,
  },
  footerButtonShare: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight:8,
    gap:20,
  },
  footer: {
    alignItems: 'center',
    //justifyContent:"space-between",
    gap: 18,
    flexDirection: 'row',
  },
  postBody: {
    marginLeft: 5,
  },
  productPrice: {
    fontSize: hp(2.4),
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  containerWeb: {
    gap: 18,
    margin: 10,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#0001',
    flex: 1,
  },
  containerWebProfile: {
    gap: 18,
    margin: 10,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#0001',
    flex: 1,
  },
  container: {
    gap: 10,
    margin:3,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#0001',
    flex: 1,
  },
  containerProfile: {
    gap: 10,
    margin:3,
    //height:hp(30),
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#0001',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  contentNoFile: {
    gap: 10,
    height:hp(35),
    justifyContent:'center',
  },
  contentNoFileWeb: {
    gap: 20,
    height:hp(48),
    justifyContent:'center',
  },
  postMediaWeb: {
    //size: hp(40),
    height:hp(48),
    width:"100%",
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    marginTop: 5,
    
  },
  postMediaWebProfile: {
    //size: hp(40),
    height:hp(40),
    width:"100%",
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    marginTop: 5,
    
  },
  postMediaProfile: {
    height: hp(25),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    marginTop: 5,
  },
  
  postMedia: {
    height: hp(48),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    marginTop: 5,
  },
  actions:{
    flexDirection:"row",
    alignItems:'center',
    gap:18,
    //marginLeft:wp(40),
    //left:1,
    //position:"absolute",
  },
});
