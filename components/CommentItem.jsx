import { Alert, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp } from '../constants/helpers/common'
import { theme } from '../constants/theme'
import Avatar from './Avatar'
import moment from 'moment'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

const CommentItem = ({
    item,
    canDelete=false,
    onDelete=()=>{},
    highlight = true,
}) => {

    const created_At=moment(item?.created_at).format("MMM D, h:mm a")
    const handleDelete=()=>{
        if(Platform.OS !== "web"){
        Alert.alert("Confirm","Are you sure you want to Delete?",[
            { text :'Cancel',
             onPress :()=> console.log('model cancel'),
             style :'cancel'
      },
     {
         text:"Delete",
         onPress:()=>onDelete(item),
         style:'destructive',
     } ])
    }else {
        const isConfirmed = window.confirm("Are you sure you want to delete?");
        if (isConfirmed) {
          onDelete(item);
        }
      }
    };
  return (
    <View style={styles.container}>
        <Avatar
            uri={item?.user?.image}
        />
        <View style={[styles.content, highlight && styles.highlights]}>
            <View style={{justifyContent:"space-between",flexDirection:"row",alignItems:"center"}}>
                <View style={styles.nameContainer}>
                    <Text style={styles.text}>
                        {item?.user?.name}
                    </Text>
                    <Text>•</Text>
                    <Text style={[styles.text,{color:theme.colors.textLight}]}>
                        {created_At}
                    </Text>
                </View>
                {
                    canDelete&&(
                        <TouchableOpacity onPress={()=>handleDelete()}>
                            <Icon name="trash" size={20} color={theme.colors.rose}/>
                        </TouchableOpacity>
                    )
                }
            </View>
            <Text style={[styles.text,{fontWeight:"normal"}]}>{item?.text}</Text>
        </View>
    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:"row",
        gap:7,
    },
    text:{
        fontSize:hp(1.6),
        color:theme.fonts.textDark,
        fontWeight:theme.fonts.medium,
    },
    nameContainer:{
        flexDirection:"row",
        alignItems:"center",
        gap:3,
    },
    highlights: {
        borderWidth: 0.2,
        backgroundColor: "white",
        borderColor: theme.colors.dark,
        shadowColor: theme.colors.dark,
        shadowOffset: { width: 0, height: 2 }, // Added height offset to create a subtle shadow
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10, // Elevation only for Android
        // Web support using 'box-shadow' (React Native Web)
        boxShadow: `0px 2px 8px rgba(${theme.colors.dark}, 0.3)`, // Added box shadow for web
    },
    
    content:{
        backgroundColor:"rgba(0,0,0,0.06)",
        flex:1,
        gap:5,
        paddingHorizontal:14,
        paddingVertical:10,
        borderCurve:"continuous",
        borderRadius:theme.radius.md,
    }
})