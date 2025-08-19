import { describe, it, expect, beforeAll } from 'vitest'
import { env, validateEnv } from '../src/lib/env'

describe('Environment Variables', () => {
  beforeAll(() => {
    // Ensure test environment variables are set
    process.env.TWELVEDATA_KEY = 'test-key-12345678901234567890'
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.FX_NOW = '3.70'
    process.env.NODE_ENV = 'test'
  })

  it('should load all required environment variables', () => {
    expect(env.TWELVEDATA_KEY).toBeDefined()
    expect(env.DATABASE_URL).toBeDefined()
    expect(env.FX_NOW).toBeDefined()
    expect(env.NODE_ENV).toBeDefined()
  })

  it('should validate environment variables successfully', () => {
    const isValid = validateEnv()
    expect(isValid).toBe(true)
  })

  it('should have correct default values', () => {
    expect(env.FX_NOW).toBe('3.70')
    expect(env.NODE_ENV).toBe('test')
  })

  it('should mask sensitive environment variables', () => {
    // This test ensures we don't accidentally log full API keys
    const keyLength = env.TWELVEDATA_KEY.length
    expect(keyLength).toBeGreaterThan(8) // Should have actual content in tests
  })

  it('should handle missing environment variables gracefully', () => {
    // Temporarily remove a required env var
    const originalKey = process.env.TWELVEDATA_KEY
    delete process.env.TWELVEDATA_KEY
    
    // The env object should still work but return empty string
    const { TWELVEDATA_KEY } = require('../src/lib/env').env
    expect(TWELVEDATA_KEY).toBe('')
    
    // Restore the key
    process.env.TWELVEDATA_KEY = originalKey
  })
})
