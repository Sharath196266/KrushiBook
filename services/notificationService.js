import { supabase } from "../lib/supabase";


export  const createNotification = async (notification)=>{
    try{
        const {data,error}= await supabase
        .from("notifications")
        .insert(notification)
        .select() 
        .single();

        if(error){
            console.log("Notification error",error);
            return{success:false, msg:"Something went wrong!"}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("Notification error",error);
        return{success:false, msg:"Something went wrong!"}
    }

 }
 export  const fetchNotifications = async (receiverId)=>{
    try{
        const{data,error}=await supabase 
        .from("notifications")
        .select("*, sender : senderId(id,name,image)")
        .eq('receiverId',receiverId)
        .order("created_at",{ascending:false})

        if(error){
            console.log("fetch Notification error",error);
            return{success:false, msg:"could not able fetch notifications "}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("fetch Notification error",error);
        return{success:false, msg:"could not able fetch notifications "}
    }

 }
 
// Assuming you're using Supabase or any backend API for notifications
export const clearNotifications = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('receiverId', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
};
