import { FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacityComponent, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import { hp,wp } from '../../constants/helpers/common'
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../../constants/theme';
import { TouchableOpacity } from 'react-native'
import SettingButton from '../../components/SettingButton'
import Avatar from '../../components/Avatar'
import { ScrollView } from 'react-native'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { supabase } from '../../lib/supabase'
import { getUserData } from '../../services/userService'

var limit=0;

const profile = () => {
    const {user,setAuth}=useAuth();
    const router=useRouter();
    const [hasMore, setHasMore]=useState(true);
    const [posts,setPosts]=useState([]);

        const handleNewCommentEvent = async (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "DELETE") {
            console.log("comment fetched");
            // Fetch updated posts after a comment event
            await getPosts();
        }
        };

      const handleLikeEvent = async (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "DELETE") {
          // Fetch updated posts after a like event
          console.log("like ftched")
          await getPosts();
        }
      };
      
    
      const handlePostEvent= async(payload)=>{
  
        if(payload.eventType == "INSERT" &&  payload?.new?.id){
          let newPost={...payload.new};
          let res= await getUserData(newPost.userId);
          newPost.user=res.success? res.data:{};
          setPosts(prevPosts=>[newPost,...prevPosts])
        }
        if(payload.eventType == "UPDATE" &&  payload?.new?.id){
          setPosts(prevPosts=>{
            let updatedPosts=prevPosts.map(post=>{
              if(post.id===payload.new.id){
                post.body=payload.new.body;
                post.file=payload.new.file;
              }
              return post; 
            });
            return updatedPosts;
          })
        }
        if(payload.eventType == "DELETE" && payload.old.id){
           setPosts(prevPosts=>{
            let updatedPosts=prevPosts.filter(post=>post.id!=payload.old.id);
            return updatedPosts;
           })
        }
  
      }

    useEffect(()=>{

        if (!user || !user.id) {
          console.warn("User not initialized. Skipping channel subscriptions.");
          return;
        }
  
        let postChannel =supabase
        .channel("posts")
        .on("postgres_changes", {event :'*',schema:"public", table:"posts"}, handlePostEvent)
        .subscribe();
         
        //getPosts();
      
        let commentChannel = supabase.channel('custom-all-channel')
        .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        handleNewCommentEvent
        )
        .subscribe();
  
        let likeChannel = supabase
          .channel("likes")
          .on("postgres_changes", { event: "*", schema: "public", table: "postLikes" }, handleLikeEvent)
          .subscribe();
  
          return () =>{
          supabase.removeChannel(postChannel);
          supabase.removeChannel(commentChannel);
          supabase.removeChannel(likeChannel);
          }
      },[])
    const getPosts=async ()=>{
        //call the api here
        if(!hasMore || !user?.id) return null;

        limit = limit + 4;

        let res= await fetchPosts(limit,user.id);
        if(res.success){
        if(posts.length==res.data.length) setHasMore(false);
        setPosts(res.data);
      }}

  return (
    <ScreenWrapper bg="white">
         
        {/* posts */}
        <FlatList
            data={posts}
            ListHeaderComponent={<UserHeader user={user} router={router}/>}
            ListHeaderComponentStyle={{marginBottom:30}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lifeStyle}
            keyExtractor={item=>item.id.toString()}
            renderItem={({ item })=> 
                <PostCard
                item={item}
                currentUser={user}
                router={router}
                />
            }
            onEndReached={()=>{
            getPosts();
            }}
            onEndReachedThreshold={0}
            ListFooterComponent={hasMore?(
            <View style={{paddingBottom:hp(3),marginVertical:posts?.length==0? 100:30}}>
                <Loading/>
            </View>
            ):(
            <View style={{marginVertical:20,paddingBottom:hp(8)}}>
            <Text style={styles.noPosts}>No More posts...</Text>
            </View>
            )}
            numColumns={2}
        />
       
    </ScreenWrapper>
  )
}

const UserHeader=({user,router})=>{
    
    return(
        <View style={{flex:1,backgroundColor:'white',paddingHorizontal:wp(2)}}>
            <View style={styles.headerContainer}>
                <Header title={"Profile"} mb={10}/>
                <TouchableOpacity style={styles.settingButton} >
                <SettingButton />
                </TouchableOpacity>
             </View>

        <ScrollView style={{flex:1}}>
        <View style={{gap:15}}>
            <View style={styles.avatarContainer}>
                <Avatar 
                    uri={user?.image}
                     size={hp(24)}
                     rounded={theme.radius.xxl*3.2}
                />
                {
                Platform.OS != "web" && (
                    <Pressable style={styles.editIcon} onPress={()=>{router.push('/editProfile')}}>
                    <Icon name='pencil' strokeWidth={2.5}  size={20} color={theme.colors.dark} />
                     </Pressable>)
                }
            </View>

            {/*User Info*/}
            <View style={{alignItems:'center', gap:4}}>
                <Text style={styles.userName}>{user && user?.name}</Text>
                { user && user.address &&
                <Text style={styles.infoText}>{user && user?.address}</Text> }
            </View>

            {/*User Info - email phone bio*/}
            <View style={{gap:20}}>
            <View style={styles.info}>
                 <Icon name="envelope-o" size={24} color={theme.colors.textLight}/>
                <Text style={styles.infoTech}>{user && user.email}</Text>
            </View>
            
            {
                user && user.phoneNumber &&  <View style={styles.info}>
                <Icon name="phone" size={24} color={theme.colors.textLight}/>
               
               <Text style={styles.infoTech}>{user && user.phoneNumber}</Text>
           </View>       
            }
            
            {
                user && user.bio && 
                 <View style={styles.info}>
                    {/*<Icon name="info" size={24} color={theme.colors.textLight}/>*/}
               
                     <Text style={styles.infoTech}>{user && user.bio}
                     </Text>                                                                                          
                 </View>
            }
        </View>
    
        </View>
        
        </ScrollView>
        </View>
    )
}

export default profile

const styles = StyleSheet.create({
    container:{
        flex:1,

    },
    headerShape:{
        flex:1,
        width:wp(100),
        height:hp(20),
    },
    headerContainer:{
        flexDirection:'row',
        marginBottom:20,
        //marginHorizontal:wp(2), 
        justifyContent:'space-between',
    },
    avatarContainer:{
        height:hp(24),
        width:wp(24),
        alignSelf:'center',
        alignItems:'center',

    },
    editIcon:{
        position:'absolute',
        bottom:0,
        right:-(wp(10)),
        padding:7,
        borderRadius:theme.radius.sm,
        backgroundColor:"white",
        shadowColor:theme.colors.textLight,
        shadowOffset:{width:0,height:4},
        shadowOpacity:0.5,
        shadowRadius:5,
        elevation:7,
        
    },
    infoTech:{
        fontSize:hp(2.5),
        fontWeight:'500',
        color:theme.colors.textLight,

    },
    noPosts:{
        fontSize:hp(2),
        textAlign:'center',
        color:theme.colors.text,
    },
    lifeStyle:{
        paddingHorizontal:wp(4),
        paddingBottom:30,
    },
    settingButton:{
        padding:2,
        position:'absolute',
        right: 0,
        borderRadius:theme.radius.sm,
        backgroundColor:'white',
        marginRight:wp(1),
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