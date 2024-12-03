import { FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, Linking, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../components/Header';
import { hp, wp } from '../../constants/helpers/common';
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../../constants/theme';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { getUserData } from '../../services/userService';
import Avatar from '../../components/Avatar';

const limit = 4;

const profileOthers = () => {
    const { profileId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingW, setLoadingW] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileId) return;
            setLoading(true);
            const profileData = await getUserData(profileId);
            if (profileData.success) {
                setProfile(profileData.data);
                console.log("Profile Data:", profileData);
            }
            setLoading(false);
        };
        fetchProfileData();
    }, [profileId]);
 
   const handleWhatsAppPress = (phoneNumber, name) => {
    setLoadingW(true);
    setTimeout(() => {
        onWhatsApp(phoneNumber, name);
        setLoadingW(false);
    }, 2000); 
};

    const onWhatsApp = async (phoneNumber, name) => {
    
        try {
            const message = `Hello ${name}`;
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                Linking.openURL(url);
            } else {
                console.log('WhatsApp is not installed or unable to open WhatsApp');
            }
        } catch (error) {
            console.error('Error during WhatsApp redirection:', error);
        }
        setLoadingW(false);
    };
    

    const getPosts = async () => {
        if (!profileId || !hasMore) return;
        const res = await fetchPosts(limit, profileId);
        if (res.success) {
            if (posts.length === res.data.length) setHasMore(false);
            setPosts(res.data);
        }
    };

    useEffect(() => {
        getPosts();
    }, [profileId]);

    if (loading) {
        return ( <View style={{alignItems:'center', marginTop:hp(48)}}><Loading  /></View>);
    }

    return (
        <ScreenWrapper bg="white">
            <FlatList
                data={posts}
                ListHeaderComponent={<UserHeader profile={profile} onWhatsAppPress={handleWhatsAppPress} loadingW={loadingW}/>}
                ListHeaderComponentStyle={{ marginBottom: 30 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.lifeStyle}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
                onEndReached={getPosts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    hasMore ? (
                        <View style={{ paddingBottom: hp(3), marginVertical: 30 }}>
                            <Loading />
                        </View>
                    ) : (
                        <View style={{ marginVertical: 20, paddingBottom: hp(8) }}>
                            <Text style={styles.noPosts}>No More Posts...</Text>
                        </View>
                    )
                }
                numColumns={1}
            />
        </ScreenWrapper>
    );
};

const UserHeader = ({ profile, onWhatsAppPress,loadingW}) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(2) }}>
            <View style={styles.headerContainer}>
                <Header title="Profile" mb={10} />
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 15 }}>
                    <View style={styles.avatarContainer}>
                        <Avatar uri={profile?.image} size={hp(24)} rounded={theme.radius.xxl * 3.2} />
                    </View>

                    {/* User Info */}
                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text style={styles.userName}>{profile?.name}</Text>
                        {profile?.address && <Text style={styles.infoText}>{profile?.address}</Text>}
                    </View>

                    {/* Contact Info */}
                    <View style={{ gap: 20 }}>
                        {profile?.email && (
                            <View style={styles.info}>
                                <Icon name="envelope-o" size={24} color={theme.colors.textLight} />
                                <Text style={styles.infoTech}>{profile?.email}</Text>
                            </View>
                        )}
                        {profile?.phoneNumber && (
                            <View style={styles.info}>
                                <Icon name="phone" size={24} color={theme.colors.textLight} />
                                <Text style={styles.infoTech}>{profile.phoneNumber}</Text>
                            {
                            loadingW?(
                                <Loading size="small"/>
                            ):(
                                <TouchableOpacity onPress={() => onWhatsAppPress(profile?.phoneNumber, profile?.name)}>
                                <Icon name="whatsapp" color={theme.colors.primary} size={28}/>
                            </TouchableOpacity>
                            )
                            } 
                            </View>
                        )}

                        {profile?.bio && (
                            <View style={styles.info}>
                                <Text style={styles.infoTech}>{profile.bio}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default profileOthers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerShape: {
        flex: 1,
        width: wp(100),
        height: hp(20),
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        height: hp(24),
        width: wp(24),
        alignSelf: 'center',
        alignItems: 'center',
    },
    infoTech: {
        fontSize: hp(2.5),
        fontWeight: '500',
        color: theme.colors.textLight,
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
    lifeStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userName: {
        fontSize: hp(3.5),
        fontWeight: 'semiBold',
        color: theme.colors.text,
    },
});
