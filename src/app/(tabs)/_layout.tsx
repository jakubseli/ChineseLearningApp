import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarIconStyle: { display: 'none' }, tabBarLabelStyle: { fontSize: 15 } }}>
      <Tabs.Screen name="index" options={{ title: 'Dnes' }} />
      <Tabs.Screen name="words" options={{ title: 'Slovíčka' }} />
      <Tabs.Screen name="progress" options={{ title: 'Pokrok' }} />
    </Tabs>
  );
}
