import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useRouter } from 'expo-router'
import Button from '../../components/Button'
import {useAuth} from '../../contexts/AuthContext'
import { supabase, supabaseAnonKey } from '../../lib/supabase'
import { theme } from '../../constants/theme'
import Icon from 'react-native-vector-icons/FontAwesome';
import { hp, wp } from '../../constants/helpers/common'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import {getUserData} from "../../services/userService"
import { TouchableOpacity } from 'react-native'
import { usePathname } from 'expo-router';
import { Platform } from 'react-native';

var limit =0; 

const home = () => {
  
    const {user,setAuth}=useAuth();
  console.log("user:",user)
    const router =useRouter();
    const [hasMore, setHasMore]=useState(true);
    const [posts,setPosts]=useState([]);
    const [notificationCount,setNotificationCount]=useState(0);
    const isActive = (route) => {
      const pathname = usePathname();
      return pathname === route;
    };
    
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
    

    const handleNotificationEvent=async(payload)=>{
      if (payload.eventType === "INSERT" && payload.new.id){ 
        setNotificationCount(prev=>prev+1);
      }
    }

  
    const handlePostEvent= async(payload)=>{

      if(payload.eventType == "INSERT" &&  payload?.new?.id){
        console.log("post updated")
        let newPost={...payload.new};
        let res= await getUserData(newPost.userId);
        newPost.user=res.success? res.data:{};
        setPosts(prevPosts=>[newPost,...prevPosts])
      }
      if(payload.eventType == "UPDATE" &&  payload?.new?.id){
        console.log("post updated")
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
      if(payload.eventType == "DELETE" && payload?.old?.id){
        console.log("post deleted")
         setPosts(prevPosts=>{
          let updatedPosts=prevPosts.filter(post=>post.id!=payload?.old?.id);
          return updatedPosts;
         })
      }

    }
    useEffect(() => {
      if (!user || !user.id) {
        console.warn("User not initialized. Skipping channel subscriptions.");
        return;
      }
    
      const postChannel = supabase
        .channel("posts")
        .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, handlePostEvent)
        .subscribe();
    
      const notificationChannel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `receiverId=eq.${user.id}` },
          handleNotificationEvent
        )
        .subscribe();
    
      const commentChannel = supabase
        .channel("custom-all-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, handleNewCommentEvent)
        .subscribe();
    
      const likeChannel = supabase
        .channel("likes")
        .on("postgres_changes", { event: "*", schema: "public", table: "postLikes" }, handleLikeEvent)
        .subscribe();
    
      return () => {
        supabase.removeChannel(postChannel);
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(commentChannel);
        supabase.removeChannel(likeChannel);
      };
    }, []);
    

    const getPosts=async ()=>{
      //call the api here
      if(!hasMore) return null;
      
      limit = limit + 10;

      let res= await fetchPosts(limit);

      if(res.success){
      if(posts.length==res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  }
    
  return (
    <ScreenWrapper>
     <View style={styles.container}>
      {/*Header*/}
     <View style={styles.header}>
      <View style={{marginRight:5}}>
     <Icon name="leaf" size={hp(3.8)} strokeWidth={1} color={theme.colors.primary}/>
     </View>
     <Text style={styles.title}>KrishiBook</Text>
     
        <View style={styles.icons}>
          {
            Platform.OS !== "web" && (
              <Pressable onPress={()=>router.push('/newPost')}>
              <Icon name="plus-square-o" size={hp(3.8)} strokeWidth={1} color={theme.colors.textDark}/>
              </Pressable>
            )
          }
            
            <Pressable onPress={()=>{
              setNotificationCount(0);
              router.push('/notifications')
              }}>
            <Icon name="bell-o" size={hp(3.3)} strokeWidth={3.2} color={theme.colors.textDark}/>
            {
              notificationCount>0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {
                       notificationCount 
                    }
                  </Text>
                </View>
              )
            }
            </Pressable>
            <Pressable onPress={()=>router.push("/profile")}>
            <Avatar
               uri={user?.image}
               size={hp(4.3)}
               rounded={theme.radius.sm}
                style={{borderWidth:2}}
            />
            </Pressable>            
          </View>
          
        </View>

        {/* posts */}
        <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lifeStyle}
        keyExtractor={item=>item.id.toString()}
        renderItem =
          {({ item })=> 
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
          <View style={{paddingBottom:hp(3),marginVertical:posts?.length==0? 200:30}}>
            <Loading/>
          </View>
        ):(
          <View style={Platform.OS != 'web'?{marginVertical:20,paddingBottom:hp(8)}:{margin:20,padding:hp(8)}}>
          <Text style={styles.noPosts}>No More posts...</Text>
          </View>
        )}
        numColumns={Platform.OS === 'web' ? 2 : 1} // 2 posts per row on Web
        />
      
          <View style={styles.footer}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/sharing')}>
            <Icon name="handshake-o" size={24} color={isActive('/sharing') ? '#000' : '#666'} />
            <Text style={[styles.navText, isActive('/sharing') && { color: '#000' }]}>Sharing</Text>
          </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/govt')}>
        <Icon name="institution" size={25} color={isActive('/govt') ? '#000' : '#666'} />
        <Text style={[styles.navText, isActive('/govt') && { color: '#000' }]}>Govt</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
        <Icon name="home" size={36} color={isActive('/home') ? '#000' : '#666'} />
        <Text style={[styles.navText, isActive('/home') && { color: '#000' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor')}>
        <Icon name="user-md" size={isActive('/doctor') ?  35:28} color={isActive('/doctor') ? '#000' : '#666'} />
        <Text style={[styles.navText, isActive('/doctor') && { color: '#000' }]}>Dr.Agri</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/market')}>
        <Icon name="shopping-cart" size={32} color={isActive('/market') ? '#000' : '#666'} />
        <Text style={[styles.navText, isActive('/market') && { color: '#000' }]}>Market</Text>
      </TouchableOpacity>
    </View>


    </View>
    
    </ScreenWrapper>
  )
}

export default home

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizantal:wp(4),
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:8,
    marginHorizontal:wp(4),
  },
  title:{
    color:theme.colors.textDark,
    fontSize:hp(3.3),
    fontWeight:theme.fonts.bold,
    marginRight:wp(20 ),
  },
  avatarImage:{
    height:hp(4.3),
    width:hp(4.3),
    borderRadius:theme.radius.sm,
    borderCurve:c='coninueous',
    borderColor:theme.colors.gray,
    borderWidth:3,
  },
  icons:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:10,

  },
  lifeStyle:{
    paddingTop:20,
    paddingHorizontal:wp(4),
  },
  noPosts:{
    fontSize:hp(2),
    //TextAlign:'center',
    alignItems:'center',
    justifyContent:'center',
    color:theme.colors.text,
  },
  pill:{
    position:'absolute',
    right:-9,
    top:-4,
    height:hp(2.2),
    width:hp(2.2),
    justifyContent:'center',
    alignItems:'center',
    borderRadius:20,
    backgroundColor:theme.colors.roseLight,

  },
  pillText:{
    color:'white',
    fontSize:hp(1.2),
    fontWeight:theme.fonts.bold,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: hp(8), // Adjust based on screen size
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    boxShadow: '0px -2px 3px rgba(0, 0, 0, 0.1)',
   //width:wp(95),
    paddingHorizontal: wp(2), // Padding for content alignment
    paddingVertical: hp(2),
    borderRadius:30,
    marginHorizontal:wp(2),
    marginVertical:wp(1),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: hp(1.5),
    color: '#666',
    marginTop: 2,
  },
  

})