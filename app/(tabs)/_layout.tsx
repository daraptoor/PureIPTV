import { Tabs } from 'expo-router';
import { Home, List, Settings, Star } from 'lucide-react-native';
import React from 'react';
import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomTabBar } from '../../src/components/CustomTabBar';
import { GlobalPlayer } from '../../src/components/GlobalPlayer';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const bgColor = colorScheme === 'dark' ? '#000' : '#F2F2F7';
  const systemNavColor = colorScheme === 'dark' ? '#1C1C1E' : '#E5E5EA';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <GlobalPlayer />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Watch Now',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="channels"
          options={{
            title: 'Channels',
            tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => <Star size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      {/* System Navigation Background */}
      <View style={{ height: insets.bottom, backgroundColor: systemNavColor }} />
    </View>
  );
}
