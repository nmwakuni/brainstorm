import { Hono } from 'hono'
import { db, advances } from '@salary-advance/database'
import { eq } from 'drizzle-orm'

const mpesa = new Hono()

// B2C Result callback
mpesa.post('/result', async c => {
  try {
    const body = await c.req.json()
    console.log('M-Pesa B2C Result:', JSON.stringify(body, null, 2))

    const result = body.Result
    const resultCode = result?.ResultCode

    // Extract transaction details from callback parameters
    const resultParameters = result?.ResultParameters?.ResultParameter || []
    const originatorConversationId = result?.OriginatorConversationID

    // Find the advance by originatorConversationId (stored during disbursement)
    const [advance] = await db
      .select()
      .from(advances)
      .where(eq(advances.mpesaConversationId, originatorConversationId))
      .limit(1)

    if (!advance) {
      console.error('Advance not found for conversation ID:', originatorConversationId)
      return c.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (resultCode === 0) {
      // Success
      const transactionId = resultParameters.find((p: any) => p.Key === 'TransactionID')?.Value

      // Update advance to disbursed
      await db
        .update(advances)
        .set({
          status: 'disbursed',
          mpesaTransactionId: transactionId || null,
          disbursedAt: new Date(),
        })
        .where(eq(advances.id, advance.id))

      console.log(`✓ Advance ${advance.id} disbursed successfully. M-Pesa ID: ${transactionId}`)
    } else {
      // Failed
      const errorMessage = result?.ResultDesc || 'M-Pesa transaction failed'

      await db
        .update(advances)
        .set({
          status: 'failed',
          failureReason: errorMessage,
        })
        .where(eq(advances.id, advance.id))

      console.error(`✗ Advance ${advance.id} failed:`, errorMessage)
    }

    return c.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    return c.json({ ResultCode: 1, ResultDesc: 'Failed to process callback' })
  }
})

// B2C Timeout callback
mpesa.post('/timeout', async c => {
  try {
    const body = await c.req.json()
    console.log('M-Pesa B2C Timeout:', JSON.stringify(body, null, 2))

    const result = body.Result
    const originatorConversationId = result?.OriginatorConversationID

    // Find and mark as failed due to timeout
    const [advance] = await db
      .select()
      .from(advances)
      .where(eq(advances.mpesaConversationId, originatorConversationId))
      .limit(1)

    if (advance) {
      await db
        .update(advances)
        .set({
          status: 'failed',
          failureReason: 'Transaction timed out',
        })
        .where(eq(advances.id, advance.id))

      console.error(`⏱ Advance ${advance.id} timed out`)
    }

    return c.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('Error processing M-Pesa timeout:', error)
    return c.json({ ResultCode: 1, ResultDesc: 'Failed to process timeout' })
  }
})

// Query result callback
mpesa.post('/query-result', async c => {
  try {
    const body = await c.req.json()
    console.log('M-Pesa Query Result:', JSON.stringify(body, null, 2))
    return c.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('Error processing query result:', error)
    return c.json({ ResultCode: 1, ResultDesc: 'Failed' })
  }
})

// Query timeout callback
mpesa.post('/query-timeout', async c => {
  try {
    const body = await c.req.json()
    console.log('M-Pesa Query Timeout:', JSON.stringify(body, null, 2))
    return c.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('Error processing query timeout:', error)
    return c.json({ ResultCode: 1, ResultDesc: 'Failed' })
  }
})

// Health check endpoint
mpesa.get('/health', c => {
  return c.json({ status: 'ok', message: 'M-Pesa webhook endpoints active' })
})

export default mpesa
