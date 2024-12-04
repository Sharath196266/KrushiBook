import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, Pressable, FlatList, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from "../../components/Header";
import { wp, hp } from '../../constants/helpers/common'; // Import width/height scaling helper
import { theme } from '../../constants/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { usePathname } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { fetchProductsByCategory } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';
var limit =0; 
const market = () => {
  
  const router=useRouter();
  const [products,setProducts]=useState([]);
  const {user,setAuth}=useAuth();
  const [hasMore, setHasMore]=useState(true);
  const isBigDisplay = wp('100%') >= 600;
  const isActive = (route) => {
    const pathname = usePathname();
    return pathname === route;
  };
  const getAllProducts = async () => {
    if (!hasMore) return null;
    limit = limit + 6;
    try {
      let res = await fetchProductsByCategory('Product',limit);
      if (res.success) {
        if (products.length === res.data.length) setHasMore(false);
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductEvent = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      console.log("Product inserted");
      let newProduct = { ...payload.new };
      let res = await getUserData(newProduct.userId);
      newProduct.user = res.success ? res.data : {};
      setProducts((prevProducts) => [newProduct, ...prevProducts]);
    }
    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      console.log("Product updated");
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.id === payload.new.id) {
            return { ...product, ...payload.new };
          }
          return product;
        })
      );
    }
    if (payload.eventType === "DELETE" && payload?.old?.id) {
      console.log("Product deleted");
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== payload.old.id)
      );
    }
  };
  useEffect(()=>{
    if (!user || !user.id) {
      console.warn("User not initialized. Skipping channel subscriptions.");
      return;
    }
    const productChannel = supabase
        .channel("products")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, handleProductEvent)
        .subscribe();

        return () => {
          supabase.removeChannel(productChannel);
        }
  },[])
  return (
    <ScreenWrapper bg="white">
      <View style={styles.headerContainer}>
        <Pressable onPress={()=> router.replace('home')} style={styles.bcbutton}>
          <Icon name='chevron-left' strokeWidth={3} width={23} size={20}  color='theme.colors.text'/>
          </Pressable>
        <Header title="Market" mb={10} showBackButon={false}/>
        {Platform.OS !== "web" &&
        <Pressable onPress={()=> router.replace('newProduct')} style={[styles.bcbutton,{flexDirection:"row",gap:3,justifyContent:"center"}]}>
          <Text style={{justifyContent:"center"}}>
            Sell
          </Text>
          <Icon name='plus-square-o' strokeWidth={3} size={hp(3.2)}  color='theme.colors.text'/>
          </Pressable>}
      </View>
      {/* posts */}
      <FlatList
            data={products}
            ListHeaderComponentStyle={{marginBottom:30}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lifeStyle}
            keyExtractor={item=>item.id.toString()}
            renderItem={({ item })=> 
                <ProductCard
                item={item}
                currentUser={user}
                router={router}
                showHeader={false}
                showView={true}
                />
            }
            onEndReached={()=>{
            getAllProducts();
            }}
            onEndReachedThreshold={0}
            ListFooterComponent={hasMore?(
            <View style={{paddingBottom:hp(3),marginVertical:products?.length==0? 100:30}}>
                <Loading/>
            </View>
            ):(
            <View style={{marginVertical:20,paddingBottom:hp(8)}}>
            <Text style={styles.noPosts}>No More products...</Text>
            </View>
            )}
            numColumns={2}
        />
       
      
      <ScrollView contentContainerStyle={styles.itemsContainer}>
        
      </ScrollView>
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
    <Icon name="user-md" size={28} color={isActive('/doctor') ? '#000' : '#666'} />
    <Text style={[styles.navText, isActive('/doctor') && { color: '#000' }]}>Dr.Agri</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => router.push('/market')}>
    <Icon name="shopping-cart" size={32} color={isActive('/market') ? '#000' : '#666'} style={isActive('/market') ?  {top:-1} : {position:"relative"}}/>
    <Text style={[styles.navText, isActive('/market') && { color: '#000' }]}>Market</Text>
  </TouchableOpacity>
</View>
</ScreenWrapper>
  );
};

export default market;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: wp(3),
    justifyContent: 'space-between',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
    paddingBottom:hp(10),
  },
  itemCard: {
    width: wp(45), // Adjust the width of each item
    marginBottom: 20,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemImage: {
    width: wp(40),
    height: hp(20),
    borderRadius: theme.radius.xl,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    //width:wp(95),
    borderRadius:30,
    marginHorizontal:wp(2),
    marginVertical:1,
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
  bcbutton:{
    alignSelf:'flex-start',
    padding:5,
    borderRadius:theme.radius.sm,
    backgroundColor:'rgba(0,0,0,0.07)',
  },
  lifeStyle:{
    paddingHorizontal:wp(4),
    paddingBottom:30,
},
});
