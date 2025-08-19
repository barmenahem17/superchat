import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Upsert Extrade account
  const extrade = await prisma.account.upsert({
    where: { name: 'Extrade' },
    update: {},
    create: {
      name: 'Extrade',
    },
  })

  // Upsert IBKR account
  const ibkr = await prisma.account.upsert({
    where: { name: 'IBKR' },
    update: {},
    create: {
      name: 'IBKR',
    },
  })

  // Upsert Kraken account
  const kraken = await prisma.account.upsert({
    where: { name: 'Kraken' },
    update: {},
    create: {
      name: 'Kraken',
    },
  })

  console.log('Seeded accounts:', { extrade, ibkr, kraken })
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