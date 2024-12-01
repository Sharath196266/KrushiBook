import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { hp, wp } from '../../constants/helpers/common';
import { theme } from '../../constants/theme';
import PostCard from '../../components/PostCard';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import Input from '../../components/Input';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import {getUserData} from "../../services/userService"
import { createNotification } from '../../services/notificationService';
import { showAlert } from '../../utilities/showAlert';


const PostDetails = () => {
  const { postId,commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const [startLoading, setStartLoading] = useState(true);
  const router = useRouter();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const commentRef = useRef('');
  
  //console.log("post id",postId)

  const [post, setPost] = useState(null);

  const handleNewComment = async(payload) =>{
    //console.log("got new comment : ",payload.new)
    if(payload.new)
      {
      let newComment = { ...payload.new };
      let res=await getUserData(newComment.userId);
      newComment.user = res.success? res.data : {};
      setPost((prevPost)=>{
        return{
        ...prevPost,
        comments :[newComment, ...prevPost.comments],
        }
      })
    }
  };

  useEffect(()=>{
    //console.log("comment added")
    let commentChannel =supabase
    .channel("comments")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "comments",
      filter: `postId=eq.${postId}`
  },handleNewComment)
  .subscribe();

    getPostDetails();

    return () =>{
      supabase.removeChannel(commentChannel);
    }
  },[]);

  const getPostDetails = async () => {
    
      let res = await fetchPostDetails(postId);
      //console.log("post details: ",res)
      if (res.success)  setPost(res.data);
      setStartLoading(false);
  };

  const onDeleteComment = async(comment)=>{
     
    let res =await removeComment(comment?.id);
    if(res.success){
          setPost(prevPost=>{
          let updatedPost ={...prevPost};
          updatedPost.comments=updatedPost.comments.filter(c=>c.id != comment.id);
          return updatedPost;
        })
    }else{
      showAlert('Comment', res.msg);
    }
  }
  //console.log("comment list",post?.comments?.[0])

  const onNewComment = async () => {

    if (!commentRef.current.trim()) return null;
    const data = {
      postId: post?.id,
      userId: user?.id,
      text: commentRef.current,
    };
    
    setLoading(true);
   
      let res = await createComment(data);
    setLoading(false);

      if (res.success) {
        //notification
        if(user.id!=post.userId){
          //send notification
          let notify={
            senderId:user.id,
            receiverId:post.userId,
            title:'commented on your post',
            data : JSON.stringify({postId:post.id,commentId:res?.data?.id}),
          }
          createNotification(notify);
        }

        commentRef.current = ''; // Clear input after successful comment
        inputRef.current.clear(); // Clear input field visually
      } else {
        showAlert('Comment', res.msg);
      }
    
  };
  const onDeletePost=async(item)=>{
    //delete post
    let res=await removePost(post.id);
    if(res.success) router.back();
    else {
      showAlert("Post",res.msg);
    }
  }
  const onEditPost=async(item)=>{
    router.back();
    router.push({pathname:"newPost", params:{...item}})
  }

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }
  if(!post){
    return(
      <View style={[styles.center,{justifyContent:"flex-start",marginTop:100}]}>
        <Text style={styles.notFound}>
          Post not found !
        </Text>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <PostCard
          item={{...post,comments:[{count:post.comments.length}]}}
          currentUser={user}
          hasShadow={false}
          router={router}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
        />
        <View style={styles.inputContainer}>
          <Input
            inputRef={inputRef}
            placeholder="Type a comment..."
            onChangeText={(value) => (commentRef.current = value)}
            placeholderTextColor={theme.colors.textLight}
            containerStyle={{ flex: 1, height: hp(6.2), borderRadius: theme.radius.xl }}
          />
          {
          loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
        {/*comment list*/}
        <View style={{marginVertical:15,gap:17}}>
          { 
          
            post?.comments?.map(comment=>
              <CommentItem
              item={comment}
              key={comment?.id?.toString()}
              highlight={comment?.id == commentId}
              onDelete={onDeleteComment}
              canDelete={user.id==comment.userId || user.id == post.userId}
              />
            )
          }
          { 
            post?.comments?.lenght == 0 && (
              <Text style={{color:theme.colors.text,marginLeft:5}}>
                Be first to Comment!
              </Text>
            )
          }
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: wp(7),
    backgroundColor: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.3 }],
  },
});