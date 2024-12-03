import { Alert, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import Icon from 'react-native-vector-icons/FontAwesome'
import { theme } from '../../constants/theme'
import ScreenWrapper from '../../components/ScreenWrapper'
import { supabase } from '../../lib/supabase'
import BackButton from '../../components/BackButton'
import { hp, wp } from '../../constants/helpers/common'
import { showAlert } from '../../utilities/showAlert'
import { Image } from 'expo-image'

const Settings = () => {
  const router = useRouter();

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert('Sign out', 'Error signing out!');
    } else {
      router.replace('/login'); // Navigate to the login screen after logout
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm('Are you sure you want to log out?');
      if (isConfirmed) {
        await onLogout();
      }
    } else {
      Alert.alert('Confirm', 'Are you sure you want to log out?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout cancelled'),
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: () => onLogout(),
          style: 'destructive',
        },
      ]);
    }
  };
  
  const navigateToEditProfile = () => {
    router.push('/editProfile'); // Adjust the route to match your app's structure
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.title}>Settings</Text>
        </View>

        <TouchableOpacity style={styles.optionButton} onPress={navigateToEditProfile}>
          <Icon name="pencil" size={20} color={theme.colors.textDark} style={styles.icon} />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color={theme.colors.rose} style={styles.icon} />
          <Text style={[styles.optionText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textDark,
    marginLeft: wp(4),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    marginBottom: hp(2),
  },
  icon: {
    marginRight: wp(3),
  },
  optionText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  logoutButton: {
    backgroundColor: theme.colors.roseLight,
  },
  logoutText: {
    color: theme.colors.rose,
  },
});
