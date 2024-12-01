import { StyleSheet,Button, View, Text} from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';



if (typeof window === 'undefined') {
    global.window = {};
    global.window.localStorage = {
        getItem: (key) => null,
        setItem: (key, value) => {},
        removeItem: (key) => {},
    };
    global.window.navigator = { userAgent: 'node.js' };
    

}

const index = () => {
    
    const router=useRouter();
    return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Loading/>
    </View>
    )
}

export default index