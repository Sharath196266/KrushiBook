import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications, clearNotifications } from '../../services/notificationService';  // You may need to create this service
import { hp, wp } from '../../constants/helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useRouter } from 'expo-router';
import NotificationItem from '../../components/NotificationItem';
import Header from '../../components/Header';

const notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    if (res.success) setNotifications(res.data);
  }

  const handleClearAll = async () => {
    // Clear the notifications from the state and optionally from the backend
    if(notifications==0) Alert.alert( "No notifications yet!");
    else{
    const res = await clearNotifications(user.id);
    if (res.success) {
      setNotifications([]); // Clear the local state
      Alert.alert("Success", "All notifications have been cleared.");
    } else {
      Alert.alert("Error", "There was an issue clearing the notifications.");
    }
  }
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header title={"Notifications"} mb={10} />
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item => {
              return (
                <NotificationItem
                  item={item}
                  key={item?.id}
                  router={router}
                />
              )
            })
          }
          {
            notifications.length === 0 && (
              <Text style={styles.noData}>No Notifications yet!</Text>
            )
          }
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: wp(1),
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: theme.colors.roseLight,
    borderRadius: 5,
    paddingVertical: 1,  
    paddingHorizontal: 8,  
    justifyContent: 'center',
    alignItems: 'center',
    height:32,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: theme.fonts.medium,
    fontSize: hp(1.6),
  },
})
