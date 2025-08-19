import { PrismaClient } from '../src/generated/prisma'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function main() {
  // Ensure accounts exist
  const extrade = await prisma.account.upsert({
    where: { name: 'Extrade' },
    update: {},
    create: { name: 'Extrade' },
  })

  const ibkr = await prisma.account.upsert({
    where: { name: 'IBKR' },
    update: {},
    create: { name: 'IBKR' },
  })

  const kraken = await prisma.account.upsert({
    where: { name: 'Kraken' },
    update: {},
    create: { name: 'Kraken' },
  })

  // Create instruments and trades
  // Extrade: AAPL
  const aaplInstrument = await prisma.instrument.upsert({
    where: { accountId_symbol: { accountId: extrade.id, symbol: 'AAPL' } },
    update: {},
    create: {
      accountId: extrade.id,
      symbol: 'AAPL',
      assetType: 'equity',
      quoteCurrency: 'USD',
    },
  })

  await prisma.trade.upsert({
    where: { id: 'extrade-aapl-buy-1' },
    update: {},
    create: {
      id: 'extrade-aapl-buy-1',
      instrumentId: aaplInstrument.id,
      side: 'BUY',
      qty: new Decimal(10),
      price: new Decimal(150),
      fee: new Decimal(2),
      date: new Date('2025-03-01'),
    },
  })

  // IBKR: MSFT
  const msftInstrument = await prisma.instrument.upsert({
    where: { accountId_symbol: { accountId: ibkr.id, symbol: 'MSFT' } },
    update: {},
    create: {
      accountId: ibkr.id,
      symbol: 'MSFT',
      assetType: 'equity',
      quoteCurrency: 'USD',
    },
  })

  await prisma.trade.upsert({
    where: { id: 'ibkr-msft-buy-1' },
    update: {},
    create: {
      id: 'ibkr-msft-buy-1',
      instrumentId: msftInstrument.id,
      side: 'BUY',
      qty: new Decimal(5),
      price: new Decimal(300),
      fee: new Decimal(2),
      date: new Date('2025-04-10'),
    },
  })

  await prisma.trade.upsert({
    where: { id: 'ibkr-msft-sell-1' },
    update: {},
    create: {
      id: 'ibkr-msft-sell-1',
      instrumentId: msftInstrument.id,
      side: 'SELL',
      qty: new Decimal(2),
      price: new Decimal(320),
      fee: new Decimal(2),
      date: new Date('2025-05-05'),
    },
  })

  // Kraken: BTC
  const btcInstrument = await prisma.instrument.upsert({
    where: { accountId_symbol: { accountId: kraken.id, symbol: 'BTC' } },
    update: {},
    create: {
      accountId: kraken.id,
      symbol: 'BTC',
      assetType: 'crypto',
      quoteCurrency: 'USD',
    },
  })

  await prisma.trade.upsert({
    where: { id: 'kraken-btc-buy-1' },
    update: {},
    create: {
      id: 'kraken-btc-buy-1',
      instrumentId: btcInstrument.id,
      side: 'BUY',
      qty: new Decimal(0.05),
      price: new Decimal(60000),
      fee: new Decimal(2),
      date: new Date('2025-06-01'),
    },
  })

  // Cash moves for IBKR
  await prisma.cashMove.upsert({
    where: { id: 'ibkr-deposit-ils-1' },
    update: {},
    create: {
      id: 'ibkr-deposit-ils-1',
      accountId: ibkr.id,
      type: 'DEPOSIT',
      amount: new Decimal(1500),
      currency: 'ILS',
      date: new Date('2025-03-01'),
    },
  })

  await prisma.cashMove.upsert({
    where: { id: 'ibkr-deposit-usd-1' },
    update: {},
    create: {
      id: 'ibkr-deposit-usd-1',
      accountId: ibkr.id,
      type: 'DEPOSIT',
      amount: new Decimal(2000),
      currency: 'USD',
      date: new Date('2025-03-02'),
    },
  })

  // FX conversions for IBKR
  await prisma.fxConversion.upsert({
    where: { id: 'ibkr-fx-1' },
    update: {},
    create: {
      id: 'ibkr-fx-1',
      accountId: ibkr.id,
      fromCurrency: 'ILS',
      fromAmount: new Decimal(7000),
      toCurrency: 'USD',
      toAmount: new Decimal(1944),
      rate: new Decimal(3.60),
      fee: new Decimal(0),
      date: new Date('2025-03-03'),
    },
  })

  await prisma.fxConversion.upsert({
    where: { id: 'ibkr-fx-2' },
    update: {},
    create: {
      id: 'ibkr-fx-2',
      accountId: ibkr.id,
      fromCurrency: 'ILS',
      fromAmount: new Decimal(3750),
      toCurrency: 'USD',
      toAmount: new Decimal(1000),
      rate: new Decimal(3.75),
      fee: new Decimal(0),
      date: new Date('2025-03-05'),
    },
  })

  console.log('Seeded sample data successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })