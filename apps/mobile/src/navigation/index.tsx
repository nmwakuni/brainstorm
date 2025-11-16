import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../store/authStore'

// Screens
import LoginScreen from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import RequestAdvanceScreen from '../screens/RequestAdvanceScreen'
import AdvanceHistoryScreen from '../screens/AdvanceHistoryScreen'
import ProfileScreen from '../screens/ProfileScreen'

export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  RequestAdvance: undefined
  AdvanceHistory: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function Navigation() {
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore()

  useEffect(() => {
    loadAuth()
  }, [])

  if (isLoading) {
    return null // TODO: Add loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#10b981',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'My Salary Advance' }}
            />
            <Stack.Screen
              name="RequestAdvance"
              component={RequestAdvanceScreen}
              options={{ title: 'Request Advance' }}
            />
            <Stack.Screen
              name="AdvanceHistory"
              component={AdvanceHistoryScreen}
              options={{ title: 'History' }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
