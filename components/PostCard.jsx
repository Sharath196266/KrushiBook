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
import {useAuth} from '../contexts/AuthContext'
import * as MediaLibrary from 'expo-media-library';

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  onDelete=()=>{},
  onEdit=()=>{},
  showDelete=false,
}) => {
  const [likes, setLikes] = useState([]);
  const [loading,setLoading] = useState(false);
  const {user,setAuth}=useAuth();
  const isBigDisplay = wp('100%') >= 600;

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item]);

  
    console.log("is Big ", isBigDisplay)

  const openProfile = () => {
    if(item?.user?.id === user?.id){
      router.push("/profile")
    }else{
    router.push({ pathname: 'profileOthers', params: { profileId: item?.user?.id } });}
  };

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: 'postDetails', params: { postId: item?.id } });
  };

  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission', 'You need to grant permission to share the file');
      }
    } catch (error) {
      console.error('Permission error: ', error);
      showAlert('Error', 'Failed to request permission.');
    }
  };

  const onShare = async () => {
    try {
      setLoading(true);
      requestPermissions(); // Ensure permissions are requested before sharing
  
      const content = { message: item?.body };
  
      if (item?.file) {
        const fileUrl = getSupabaseFileUrl(item?.file)?.uri;
        console.log('File URL:', fileUrl); // Log the file URL
  
        if (!fileUrl) {
          showAlert('Error', 'File URL is invalid.');
          setLoading(false);
          return;
        }
  
        // Define the directory path to save the downloaded file
        const directoryUri = FileSystem.documentDirectory + 'postVideos/';
        const directoryExists = await FileSystem.readDirectoryAsync(directoryUri).catch(() => false);
  
        // If the directory doesn't exist, create it
        if (!directoryExists) {
          await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
        }
  
        // Try downloading the file
        const localUri = await FileSystem.downloadAsync(fileUrl, `${directoryUri}${item?.id}.mp4`);
        console.log('Downloaded file:', localUri.uri); // Log the downloaded URI
        content.url = localUri.uri;
      }
  
      console.log('Content to share:', content); // Log the content before sharing
      await Share.share(content); // Share the content
  
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error during file share:', error);
      showAlert('Error', 'Sharing failed. Please try again.');
    }
  };
  const handlePostDelete = () => {
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
  

  const onLike = async () => {
    const liked = likes.some((like) => like.userId === currentUser?.id);

    if (liked) {
      // Remove like
      const updatedLikes = likes.filter((like) => like.userId !== currentUser?.id);
      setLikes(updatedLikes);

      const res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        showAlert('Post', 'Something went wrong');
      }
    } else {
      // Add like
      const data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes((prevLikes) => [...prevLikes, data]);

      const res = await createPostLike(data);
      if (!res.success) {
        showAlert('Post', 'Something went wrong');
      }
    }
  };

  const isActive = (route) => {
    const pathname = usePathname();
    return pathname === route;
  };

  const liked = likes.some((like) => like.userId === currentUser?.id);

  const created_At = moment(item?.created_at).format('MMM D');
  const isContentNoFile = ( !isBigDisplay) ? styles.contentNoFile : styles.contentNoFileWeb;
  const isContentNoFilePLat = ( !isBigDisplay) ? styles.content : styles.contentNoFileWeb;
  return (
      <View
        style={
          !isActive('/profile') ? (
            (!isBigDisplay)
            ? [styles.container, hasShadow && styles.shadow] // iOS/Android styles
            : [styles.containerWeb, hasShadow && styles.shadow] // Web-specific styles
          ):(
            (!isBigDisplay)
            ? [styles.containerProfile, hasShadow && styles.shadow] // iOS/Android styles
            : [styles.containerWebProfile, hasShadow && styles.shadow] // Web-specific styles
          )
        }
      >
      <View style={styles.header}>
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
        {showMoreIcon && (
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="ellipsis-h" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {
            
            showDelete && currentUser.id == item?.user?.id && (
              Platform.OS !== "web" ? (
              <View style={styles.actions}>
                  <TouchableOpacity disabled={Platform.OS === "web"? true:false} onPress={Platform.OS != "web" ?()=>onEdit(item):Alert.alert("Post","Edit not available on web")}>
                    <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePostDelete} >
                    <Icon name="trash" size={hp(2.5)}  color={theme.colors.rose} />
                  </TouchableOpacity>
              </View>
            ) :
            (
            <View style={styles.actions}>
              <TouchableOpacity onPress={handlePostDelete} >
                    <Icon name="trash" size={hp(2.5)}  color={theme.colors.rose} />
                  </TouchableOpacity>
            </View>
          )
        
        )
        }
      </View>

      {/* Post media and content */}
       
      <View style={!isActive("/profile") ? ((item?.file ? (styles.content):(isContentNoFilePLat))) : (item?.file ? (styles.content) : (isContentNoFile))}>

        <View style={styles.postBody}>
          <Text style={( !isBigDisplay)?([{margin:5,fontWeight:theme.fonts.text}]):(item?.file ? ([{margin:5,fontWeight:theme.fonts.text}]):([{margin:5,fontWeight:theme.fonts.textDark,fontSize:hp(3)}]))}>{item?.body}</Text>
          {item?.file && item?.file.includes('postImages') && (
            
            <Image source={getSupabaseFileUrl(item?.file)} transition={100} 
            style={
              !isActive('/profile')?
              (( !isBigDisplay)?[styles.postMedia]:[styles.postMediaWeb,{height:hp(60)}]
            ): (( !isBigDisplay)?[styles.postMediaProfile]:[styles.postMediaWeb,{height:hp(60)}])
            } 
            contentFit="cover" />
          )}

          {/* Post video */}
          {item?.file && item?.file.includes('postVideos') && (
            <Video
              style={ ( !isBigDisplay)?[styles.postMedia, { height: hp(30) }]:[styles.postMediaWeb,{height:hp(60)}]}
              source={getSupabaseFileUrl(item?.file)}
              useNativeControls
              resizeMode="cover"
              isLooping
            />
          )}
        </View>

        {/* Like, share, comment */}
        <View style={{flexDirection:"row",justifyContent:"space-between"}}>
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              <Icon name={!liked? "heart-o": "heart"} size={24} color={liked ? theme.colors.rose : theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>{likes?.length}</Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comments-o" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>{
              item?.comments?.[0]?.count ?? 0
              }</Text>
          </View>
          
        </View>
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
          </View>
      </View>
    
    </View>
  );
};

export default PostCard;

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
