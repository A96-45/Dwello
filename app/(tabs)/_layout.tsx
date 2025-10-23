import { Tabs } from "expo-router";
import { Home, MessageCircle, DollarSign, PlusCircle, Car, User, BarChart3 } from "lucide-react-native";
import React from "react";
import { useApp } from "@/contexts/AppContext";

const COLORS = {
  primary: '#3B82F6',
  inactive: '#9CA3AF',
  background: '#FFFFFF',
};

export default function TabLayout() {
  const { userRole } = useApp();
  
  const isTenant = userRole === 'tenant' || userRole === 'both';
  const isLandlord = userRole === 'landlord' || userRole === 'both';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isLandlord ? "Dashboard" : "Home",
          tabBarIcon: ({ color, size }) => isLandlord ? <BarChart3 color={color} size={size} /> : <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: isTenant ? "Pay Rent" : "Post",
          tabBarIcon: ({ color, size }) => isTenant ? <DollarSign color={color} size={size} /> : <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="smartpark"
        options={{
          title: "SmartPark",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
