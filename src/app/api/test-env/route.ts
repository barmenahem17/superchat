import { NextResponse } from 'next/server'
import { env, validateEnv } from '@/lib/env'

export async function GET() {
  try {
    const isValid = validateEnv()
    
    return NextResponse.json({
      success: true,
      valid: isValid,
      environment: {
        NODE_ENV: env.NODE_ENV,
        DATABASE_URL: env.DATABASE_URL ? '✅ Set' : '❌ Missing',
        FX_NOW: env.FX_NOW,
        TWELVEDATA_KEY: env.TWELVEDATA_KEY 
          ? `✅ Set (${env.TWELVEDATA_KEY.substring(0, 8)}...${env.TWELVEDATA_KEY.substring(env.TWELVEDATA_KEY.length - 4)})`
          : '❌ Missing',
      },
      message: isValid ? 'All environment variables loaded successfully!' : 'Some environment variables are missing',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Environment test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
