import axios from 'axios'

interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  shortcode: string
  initiatorName: string
  securityCredential: string
  passkey: string
  callbackUrl: string
  environment: 'sandbox' | 'production'
}

interface MpesaAuthResponse {
  access_token: string
  expires_in: string
}

interface B2CRequest {
  amount: number
  phoneNumber: string
  remarks: string
  occasionReference: string
}

interface B2CResponse {
  ConversationID: string
  OriginatorConversationID: string
  ResponseCode: string
  ResponseDescription: string
}

export class MpesaService {
  private config: MpesaConfig
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: MpesaConfig) {
    this.config = config
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke'
  }

  // Get OAuth token from M-Pesa
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString(
        'base64'
      )

      const response = await axios.get<MpesaAuthResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      )

      this.accessToken = response.data.access_token
      // Set expiry to 50 minutes (token lasts 1 hour)
      this.tokenExpiry = Date.now() + 50 * 60 * 1000

      return this.accessToken!
    } catch (error: any) {
      console.error('M-Pesa auth error:', error.response?.data || error.message)
      throw new Error('Failed to authenticate with M-Pesa')
    }
  }

  // Send money via B2C (Business to Customer)
  async sendMoney(request: B2CRequest): Promise<B2CResponse> {
    try {
      const token = await this.getAccessToken()

      // Format phone number (remove + and ensure it starts with 254)
      const phoneNumber = request.phoneNumber.replace(/\+/g, '').replace(/^0/, '254')

      const payload = {
        InitiatorName: this.config.initiatorName,
        SecurityCredential: this.config.securityCredential,
        CommandID: 'BusinessPayment',
        Amount: Math.round(request.amount),
        PartyA: this.config.shortcode,
        PartyB: phoneNumber,
        Remarks: request.remarks,
        QueueTimeOutURL: `${this.config.callbackUrl}/timeout`,
        ResultURL: `${this.config.callbackUrl}/result`,
        Occasion: request.occasionReference,
      }

      const response = await axios.post<B2CResponse>(
        `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('M-Pesa B2C error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.errorMessage || 'Failed to send M-Pesa payment')
    }
  }

  // Query transaction status
  async queryTransactionStatus(transactionId: string): Promise<any> {
    try {
      const token = await this.getAccessToken()

      const payload = {
        Initiator: this.config.initiatorName,
        SecurityCredential: this.config.securityCredential,
        CommandID: 'TransactionStatusQuery',
        TransactionID: transactionId,
        PartyA: this.config.shortcode,
        IdentifierType: '4',
        ResultURL: `${this.config.callbackUrl}/query-result`,
        QueueTimeOutURL: `${this.config.callbackUrl}/query-timeout`,
        Remarks: 'Transaction status query',
        Occasion: 'Status check',
      }

      const response = await axios.post(
        `${this.baseUrl}/mpesa/transactionstatus/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('M-Pesa query error:', error.response?.data || error.message)
      throw new Error('Failed to query transaction status')
    }
  }

  // Generate security credential (for production)
  static generateSecurityCredential(initiatorPassword: string, _certificatePath: string): string {
    // In production, you would encrypt the initiator password with M-Pesa public certificate
    // For sandbox, you can use the test credential provided by Safaricom
    // This is a placeholder - implement actual encryption in production
    return initiatorPassword
  }
}

// Singleton instance
let mpesaService: MpesaService | null = null

export function getMpesaService(): MpesaService {
  if (!mpesaService) {
    const config: MpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      shortcode: process.env.MPESA_SHORTCODE || '',
      initiatorName: process.env.MPESA_INITIATOR_NAME || '',
      securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
      passkey: process.env.MPESA_PASSKEY || '',
      callbackUrl: process.env.MPESA_CALLBACK_URL || 'http://localhost:3001/api/mpesa',
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    }

    mpesaService = new MpesaService(config)
  }

  return mpesaService
}
