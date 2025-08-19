import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getQuote, getUsdIls, clearCache } from '../src/lib/prices'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('TwelveData Prices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()
    // Mock environment variable
    process.env.TWELVEDATA_KEY = 'test-key'
  })

  it('should parse TwelveData quote response correctly', async () => {
    const mockResponse = {
      data: {
        symbol: 'AAPL',
        name: 'Apple Inc',
        exchange: 'NASDAQ',
        mic_code: 'XNGS',
        currency: 'USD',
        datetime: '2024-01-15 16:00:00',
        timestamp: 1705334400,
        open: '185.00',
        high: '186.50',
        low: '184.20',
        close: '185.75',
        volume: '45123456',
        previous_close: '184.50',
        change: '1.25',
        percent_change: '0.68',
        average_volume: '50000000',
        is_market_open: false,
        fifty_two_week: {
          low: '124.17',
          high: '199.62',
          low_change: '61.58',
          high_change: '-13.87',
          low_change_percent: '49.57',
          high_change_percent: '-6.95',
          range: '124.17 - 199.62'
        }
      }
    }

    mockedAxios.get.mockResolvedValueOnce(mockResponse)

    const result = await getQuote('AAPL')

    expect(result).toEqual({
      price: 185.75,
      prevClose: 184.50,
      currency: 'USD',
      asOf: '2024-01-15 16:00:00'
    })

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.twelvedata.com/quote?symbol=AAPL&apikey=test-key',
      { timeout: 15000 }
    )
  })

  it('should parse USD/ILS forex rate correctly', async () => {
    const mockResponse = {
      data: {
        symbol: 'USD/ILS',
        name: 'USD/ILS',
        exchange: 'Forex',
        mic_code: '',
        currency: 'ILS',
        datetime: '2024-01-15 22:00:00',
        timestamp: 1705356000,
        open: '3.7100',
        high: '3.7250',
        low: '3.7050',
        close: '3.7180',
        volume: '0',
        previous_close: '3.7120',
        change: '0.0060',
        percent_change: '0.16',
        average_volume: '0',
        is_market_open: true,
        fifty_two_week: {
          low: '3.4500',
          high: '3.8900',
          low_change: '0.2680',
          high_change: '-0.1720',
          low_change_percent: '7.77',
          high_change_percent: '-4.42',
          range: '3.4500 - 3.8900'
        }
      }
    }

    mockedAxios.get.mockResolvedValueOnce(mockResponse)

    const result = await getUsdIls()

    expect(result).toBe(3.7180)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.twelvedata.com/quote?symbol=USD/ILS&apikey=test-key',
      { timeout: 15000 }
    )
  })

  it('should use cache for repeated requests', async () => {
    const mockResponse = {
      data: {
        symbol: 'MSFT',
        close: '380.25',
        previous_close: '378.50',
        currency: 'USD',
        datetime: '2024-01-15 16:00:00'
      }
    }

    mockedAxios.get.mockResolvedValueOnce(mockResponse)

    // First call
    const result1 = await getQuote('MSFT')
    expect(result1.price).toBe(380.25)

    // Second call should use cache
    const result2 = await getQuote('MSFT')
    expect(result2.price).toBe(380.25)

    // Should only call API once
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
  })

  it('should fallback to FX_NOW when TWELVEDATA_KEY is missing', async () => {
    delete process.env.TWELVEDATA_KEY
    process.env.FX_NOW = '3.65'

    const result = await getUsdIls()

    expect(result).toBe(3.65)
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })
})
