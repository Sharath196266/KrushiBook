import { supabase, supabaseAnonKey } from "../lib/supabase";
import { uploadFile } from "./imageService";

 export  const createOrUpdatePost = async (post)=>{
    try{
        //upload post file
        
        if(post.file && typeof post.file =='object')
            {
            let isImage = post?.file?.type =="image";
            let folderName = isImage?'postImages':"postVideos";
            let fileResult = await uploadFile(folderName,post?.file?.uri,isImage);
            if(fileResult.success)
            {
                post.file=fileResult.data;
            }
            else{
                return fileResult;
            }
        }
            const {data,error}= await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

            if(error){
                console.log("create post",error);
                return{success:false, msg:"could not create a post "}
            }
            return {success:true,data:data};
        

    }catch(error){
        console.log("create post",error);
        return{success:false, msg:"could not create a post "}
    }

 }

 export  const fetchPosts = async (limit=10,userId)=>{
    try{
        if(userId){
            const{data,error}=await supabase 
            .from("posts")
            .select("*, user:profiles(id, name, image),postLikes(*), comments(count)")
            .order("created_at",{ascending:false})
            .eq("userId",userId)
            .limit(limit)
    
    
            if(error){
                console.log("fetch post error",error);
                return{success:false, msg:"could not able fetch posts "}
            }
            return {success:true,data:data};
    
        }else{
                const{data,error}=await supabase 
            .from("posts")
            .select("*, user:profiles(id, name, image),postLikes(*), comments(count)")
            .order("created_at",{ascending:false})
            .limit(limit)


            if(error){
                console.log("fetch post error",error);
                return{success:false, msg:"could not able fetch posts "}
            }
            return {success:true,data:data};

        }
    }catch(error){
        console.log("fetch post error",error);
        return{success:false, msg:"could not able fetch posts "}
    }

 }

 export  const createPostLike = async (postLike)=>{
    try{
        const {data,error}= await supabase
        .from("postLikes")
        .insert(postLike)
        .select()
        .single();

        if(error){
            console.log("post Like  error",error);
            return{success:false, msg:"could not like this post"}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("post like error",error);
        return{success:false, msg:"could not like this post"}
    }

 }
 export  const removePostLike = async (postId, userId)=>{
    try{
        const {error}= await supabase
        .from("postLikes")
        .delete()
        .eq('userId',userId)
        .eq('postId',postId)


        if(error){
            console.log("post Like  error",error);
            return{success:false, msg:"could not remove like"}
        }
        return {success:true};

    }catch(error){
        console.log("post like error",error);
        return{success:false, msg:"could not remove like"}
    }

 }
 export  const fetchPostDetails = async (postId)=>{
    try{
        const{data,error}=await supabase 
        .from("posts")
        .select("*, user:profiles(id, name, image),postLikes(*,user:profiles(id,name,image)),comments(*,user:profiles(id,name,image))")
        .eq('id',postId)
        .order("created_at",{ascending:false, foreignTable:"comments"})
        .single()


        if(error){
            console.log("fetch post error",error);
            return{success:false, msg:"could not able fetch post "}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("fetch post error",error);
        return{success:false, msg:"could not able fetch post "}
    }

 }
 export  const createComment = async (comment)=>{
    try{
        const {data,error}= await supabase
        .from("comments")
        .insert(comment)
        .select()
        .single();

        if(error){
            console.log("comment error",error);
            return{success:false, msg:"could not comment this post"}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("comment error",error);
        return{success:false, msg:"could not comment this post"}
    }

 }
 export  const removeComment = async (commentId)=>{
    try{
        const {error}= await supabase
        .from("comments")
        .delete()
        .eq('id',commentId)

        if(error){
            console.log("comment remove error",error);
            return{success:false, msg:"could not remove commet"}
        }
        return {success:true, data:{commentId}};

    }catch(error){
        console.log("comment remove error",error);
        return{success:false, msg:"could not remove comment"}
    }

 }
 export  const removePost = async (postId)=>{
    try{
        const {error}= await supabase
        .from("posts")
        .delete()
        .eq('id',postId)

        if(error){
            console.log("Post remove error",error);
            return{success:false, msg:"could not remove post"}
        }
        return {success:true, data:{postId}};

    }catch(error){
        console.log("comment remove post",error);
        return{success:false, msg:"could not remove post"}
    }

 }

 export  const createOrUpdateProduct = async (product)=>{
    try{
        //upload post file
        
        if(product.file && typeof product.file =='object')
            {
            let isImage = product?.file?.type =="image";
            let folderName = isImage?'productImages':"productVideos";
            let fileResult = await uploadFile(folderName,product?.file?.uri,isImage);
            if(fileResult.success)
            {
                product.file=fileResult.data;
            }
            else{
                return fileResult;
            }
        
            const {data,error}= await supabase
            .from('products')
            .upsert(product)
            .select()
            .single();

            if(error){
                console.log("create product",error);
                return{success:false, msg:"could not create a product "}
            }
            return {success:true,data:data};
        }

    }catch(error){
        console.log("create product",error);
        return{success:false, msg:"could not create a product "}
    }

 }
 export  const removeProduct = async (productId)=>{
    try{
        const {error}= await supabase
        .from("products")
        .delete()
        .eq('id',productId)

        if(error){
            console.log("Product remove error",error);
            return{success:false, msg:"could not remove product"}
        }
        return {success:true, data:{productId}};

    }catch(error){
        console.log("comment remove product",error);
        return{success:false, msg:"could not remove product"}
    }

 }

 export const fetchProductsByCategory = async (category,limit,userId) => {
    try {
        if(userId){
        const { data, error } = await supabase
        .from("products")
        .select("*, user:profiles(id, name, image,phoneNumber,address)")
        .eq("category", category)
        .eq("userId",userId)
        .order("created_at", { ascending: false })
        .limit(limit)
        if (error) return handleError("fetch products", error);
        return { success: true, data };
        }
        else{
            const { data, error } = await supabase
        .from("products")
        .select("*, user:profiles(id, name, image,phoneNumber,address)")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(limit)
        if (error) return handleError("fetch products", error);
        return { success: true, data };
        }   
    } catch (error) {
      return handleError("fetch products", error);
    }
  };

 export  const fetchProductDetails = async (productId)=>{
    try{
        const{data,error}=await supabase 
        .from("products")
        .select("*, user:profiles(id, name, image,phoneNumber,address)")
        .eq('id',productId)
        .single()


        if(error){
            console.log("fetch product error",error);
            return{success:false, msg:"could not able fetch product "}
        }
        return {success:true,data:data};

    }catch(error){
        console.log("fetch product error",error);
        return{success:false, msg:"could not able fetch product "}
    }

 }