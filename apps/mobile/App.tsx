import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import Navigation from './src/navigation'
import {
  configureNotificationHandler,
  requestNotificationPermissions,
  setupNotificationChannel,
} from './src/utils/notifications'

const queryClient = new QueryClient()

export default function App() {
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  useEffect(() => {
    // Configure notification handler
    configureNotificationHandler()

    // Set up notification channels (Android)
    setupNotificationChannel()

    // Request permissions
    requestNotificationPermissions().then(result => {
      if (result.granted) {
        console.log('Notification permissions granted')
      } else {
        console.log('Notification permissions denied')
      }
    })

    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    // Listener for when user interacts with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response)
      const data = response.notification.request.content.data

      // Handle different notification types
      if (data?.type === 'advance_approved' || data?.type === 'advance_disbursed') {
        // TODO: Navigate to advance history or specific advance detail
        console.log('Advance notification:', data)
      }
    })

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Navigation />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
