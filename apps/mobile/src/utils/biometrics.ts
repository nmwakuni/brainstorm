import * as LocalAuthentication from 'expo-local-authentication'

export interface BiometricCapabilities {
  isAvailable: boolean
  hasHardware: boolean
  isEnrolled: boolean
  supportedTypes: LocalAuthentication.AuthenticationType[]
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricCapabilities(): Promise<BiometricCapabilities> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  const isEnrolled = await LocalAuthentication.isEnrolledAsync()
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

  return {
    isAvailable: hasHardware && isEnrolled,
    hasHardware,
    isEnrolled,
    supportedTypes,
  }
}

/**
 * Get a human-readable name for the biometric type
 */
export function getBiometricTypeName(capabilities: BiometricCapabilities): string {
  if (
    capabilities.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return 'Face ID'
  }
  if (capabilities.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint'
  }
  if (capabilities.supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris'
  }
  return 'Biometric'
}

/**
 * Authenticate the user using biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to continue'
): Promise<{ success: boolean; error?: string }> {
  try {
    const capabilities = await checkBiometricCapabilities()

    if (!capabilities.isAvailable) {
      return {
        success: false,
        error: !capabilities.hasHardware
          ? 'This device does not support biometric authentication'
          : 'No biometric credentials are enrolled on this device',
      }
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })

    if (result.success) {
      return { success: true }
    }

    return {
      success: false,
      error: 'Authentication failed',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}
