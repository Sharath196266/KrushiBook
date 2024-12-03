import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createComment, fetchPostDetails, fetchProductDetails, fetchProducts, removeComment, removePost, removeProduct } from '../../services/postService';
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
import { getUserData } from "../../services/userService";
import { createNotification } from '../../services/notificationService';
import { showAlert } from '../../utilities/showAlert';
import ProductCard from '../../components/ProductCard';
import BackButton from '../../components/BackButton';
import ScreenWrapper from '../../components/ScreenWrapper';


const ProductDetails = () => {
  const { productId } = useLocalSearchParams(); 
  const { user } = useAuth(); 
  const [startLoading, setStartLoading] = useState(true); 
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const commentRef = useRef(''); // Ref for comment input
  
  const [product, setProduct] = useState(null); // State to store product details

  // Fetch product details using productId
  const getProductDetails = async () => {
    const res = await fetchProductDetails(productId);
    if (res.success) {
      setProduct(res.data); // Set product data if successful
    }
    setStartLoading(false); // Stop loading
  };

  useEffect(() => {
    getProductDetails(); // Fetch product details when component mounts
  }, [productId]);

  const onWhatsApp = async () => {
    try {
      setLoading(true);
      const phoneNumber = item?.user?.phoneNumber;
      const message = 'Hello, I am interested in buying this product.';
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) Linking.openURL(url);
      else console.log('WhatsApp not installed');
    } catch (error) {
      console.error('WhatsApp Error:', error);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle buying (via WhatsApp or Phone call)
  const onCall = async () => {
    try {
      setLoading(true);
      const phoneNumber = item?.user?.phoneNumber;
      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) Linking.openURL(url);
      else console.log('Cannot open dialer');
    } catch (error) {
      console.error('Call Error:', error);
    } finally {
      setLoading(false);
    }
  };
  // Function to delete the product
  const onDeleteProduct = async (product) => {
    const res = await removeProduct(product.id);
    if (res.success) {
      router.back(); // Go back if successful
    } else {
      showAlert("Product", res.msg); // Show alert if error
    }
  };

  // Function to edit the product
  const onEditProduct = async (product) => {
    router.push({
      pathname: 'newProduct',
      params: { ...product }, // Pass product data to the newProduct page
    });
  };

  // Loading screen if product data is not fetched yet
  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  // Product not found screen
  if (!product) {
    return (
      <View style={[styles.center, { justifyContent: 'flex-start', marginTop: 100 }]}>
        <Text style={styles.notFound}>Product not found!</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
    <View style={styles.container}>
        <BackButton router={router}/>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <ProductCard
          item={{ ...product }}
          currentUser={user}
          hasShadow={false}
          router={router}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeleteProduct}
          onEdit={onEditProduct}
          showHeader={true}
          showContact={true}
        />
      </ScrollView>
      
    </View>
    </ScreenWrapper>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: wp(8),
    backgroundColor: 'white',
    justifyContent:"center",
    gap:15,
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
