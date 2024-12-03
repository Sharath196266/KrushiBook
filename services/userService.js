import { supabase } from "../lib/supabase";

export const getUserData =async(userID)=>{
    try{
        const {data,error }= await supabase
        .from('profiles')
         .select('*')
            .eq('id',userID)
            .single()

            if(error){
                return{success:false,msg:error?.message} ;
            }
        
            return{success:true,data}; 
    }
    catch(error){
        console.log('error',error);
        return{success:flase,msg:error.message};
    }
}
export const updateUser =async(userID,data)=>{
    try{
        const {error}= await supabase
        .from('profiles')
         .update(data)
         .eq('id',userID);
            
            if(error){
                return{success:false,msg:error?.message} ;
            }
            return{success:true,data}; 

    }
    catch(error){
        console.log('error',error);
        return{success:flase,msg:error.message};
    }
}