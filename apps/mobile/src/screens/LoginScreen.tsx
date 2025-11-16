import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import {
  checkBiometricCapabilities,
  authenticateWithBiometrics,
  getBiometricTypeName,
} from '../utils/biometrics'

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [biometricsAvailable, setBiometricsAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState('')
  const login = useAuthStore(state => state.login)

  useEffect(() => {
    checkBiometrics()
    loadSavedCredentials()
  }, [])

  const checkBiometrics = async () => {
    const capabilities = await checkBiometricCapabilities()
    setBiometricsAvailable(capabilities.isAvailable)
    if (capabilities.isAvailable) {
      setBiometricType(getBiometricTypeName(capabilities))
    }
  }

  const loadSavedCredentials = async () => {
    const savedPhone = await SecureStore.getItemAsync('lastPhoneNumber')
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }
  }

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      Alert.alert('Error', 'Please enter phone number and PIN')
      return
    }

    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits')
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.login(phoneNumber, pin)

      if (response.success && response.token) {
        // Save phone number for biometric login
        await SecureStore.setItemAsync('lastPhoneNumber', phoneNumber)
        await SecureStore.setItemAsync('savedPin', pin)

        await login(response.token, response.user)
      } else {
        Alert.alert('Error', response.error || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'An error occurred. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    const savedPin = await SecureStore.getItemAsync('savedPin')
    const savedPhone = await SecureStore.getItemAsync('lastPhoneNumber')

    if (!savedPin || !savedPhone) {
      Alert.alert(
        'Setup Required',
        'Please log in with your PIN first to enable biometric authentication.'
      )
      return
    }

    setIsLoading(true)
    try {
      const result = await authenticateWithBiometrics('Log in to Salary Advance')

      if (result.success) {
        // Use saved credentials to log in
        const response = await authApi.login(savedPhone, savedPin)

        if (response.success && response.token) {
          await login(response.token, response.user)
        } else {
          Alert.alert('Error', 'Login failed. Please try again with your PIN.')
        }
      } else {
        if (result.error) {
          Alert.alert('Authentication Failed', result.error)
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error)
      Alert.alert('Error', 'Biometric authentication failed. Please use your PIN.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>💰 Salary Advance</Text>
        <Text style={styles.subtitle}>Access your earned wages instantly</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="0712345678"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          {biometricsAvailable && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Text style={styles.biometricButtonText}>
                  {biometricType === 'Face ID' ? '👤' : '👆'} Use {biometricType}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Don't have an account? Contact your employer</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#10b981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 48,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#10b981',
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
})
