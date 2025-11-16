import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import * as Device from 'expo-device'

export interface NotificationPermissionStatus {
  granted: boolean
  canAskAgain: boolean
  status: Notifications.PermissionStatus
}

export interface NotificationData {
  type: 'advance_approved' | 'advance_disbursed' | 'payment_reminder' | 'general'
  advanceId?: string
  amount?: string
  message?: string
}

// Configure how notifications are displayed when app is in foreground
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<NotificationPermissionStatus> {
  if (!Device.isDevice) {
    return {
      granted: false,
      canAskAgain: false,
      status: 'undetermined' as Notifications.PermissionStatus,
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  return {
    granted: finalStatus === 'granted',
    canAskAgain: finalStatus !== 'denied',
    status: finalStatus,
  }
}

// Get push notification token (for sending notifications from server)
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices')
    return null
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // TODO: Replace with actual Expo project ID
    })
    return token.data
  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }
}

// Configure notification channel for Android
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Salary Advance Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
      sound: 'default',
      enableVibrate: true,
    })

    // Channel for critical notifications (disbursements)
    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#10b981',
      sound: 'default',
      enableVibrate: true,
    })
  }
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  seconds: number = 0
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
    },
    trigger: seconds > 0 ? { seconds } : null,
  })

  return identifier
}

// Cancel a scheduled notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier)
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync()
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count)
}

// Clear badge
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0)
}

// Helper to send notification for advance approval
export async function notifyAdvanceApproved(amount: string, advanceId: string) {
  await scheduleLocalNotification(
    'Advance Approved! 🎉',
    `Your salary advance of ${amount} has been approved and is being processed.`,
    {
      type: 'advance_approved',
      advanceId,
      amount,
    }
  )
}

// Helper to send notification for advance disbursement
export async function notifyAdvanceDisbursed(amount: string, advanceId: string) {
  await scheduleLocalNotification(
    'Money Sent! 💸',
    `${amount} has been sent to your M-Pesa. Check your phone for the confirmation.`,
    {
      type: 'advance_disbursed',
      advanceId,
      amount,
    }
  )
}

// Helper to send payment reminder
export async function notifyPaymentReminder(amount: string, daysUntilPayday: number) {
  await scheduleLocalNotification(
    'Payment Reminder 📅',
    `${amount} will be deducted from your salary in ${daysUntilPayday} days.`,
    {
      type: 'payment_reminder',
      amount,
    }
  )
}
