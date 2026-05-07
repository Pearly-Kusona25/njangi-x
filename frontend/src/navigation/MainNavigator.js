import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NjangiListScreen from '../screens/groups/NjangiListScreen';
import CreateNjangiScreen from '../screens/groups/CreateNjangiScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import JoinGroupScreen from '../screens/groups/JoinGroupScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import PaymentSuccessScreen from '../screens/payments/PaymentSuccessScreen';
import TransactionHistoryScreen from '../screens/payments/TransactionHistoryScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AdminDashboardScreen from '../screens/profile/AdminDashboardScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const NjangiStack = createNativeStackNavigator();
const PayStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
      <HomeStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </HomeStack.Navigator>
  );
}

function NjangiStackNav() {
  return (
    <NjangiStack.Navigator screenOptions={{ headerShown: false }}>
      <NjangiStack.Screen name="NjangiList" component={NjangiListScreen} />
      <NjangiStack.Screen name="CreateNjangi" component={CreateNjangiScreen} />
      <NjangiStack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <NjangiStack.Screen name="JoinGroup" component={JoinGroupScreen} />
      <NjangiStack.Screen name="GroupChat" component={ChatScreen} />
      <NjangiStack.Screen name="Payment" component={PaymentScreen} />
      <NjangiStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </NjangiStack.Navigator>
  );
}

function PayStackNav() {
  return (
    <PayStack.Navigator screenOptions={{ headerShown: false }}>
      <PayStack.Screen name="PayMain" component={PaymentScreen} />
      <PayStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <PayStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </PayStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Njangis: focused ? 'people' : 'people-outline',
            Pay: focused ? 'wallet' : 'wallet-outline',
            History: focused ? 'time' : 'time-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNav} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Njangis" component={NjangiStackNav} options={{ tabBarLabel: 'Njangis' }} />
      <Tab.Screen name="Pay" component={PayStackNav} options={{ tabBarLabel: 'Pay' }} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileStackNav} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingBottom: 8,
    paddingTop: 8,
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
});
