import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cardFiles = [
    "card-1.png",
    "card-10.png",
    "card-11.png",
    "card-12.png",
    "card-13-10.png",
    "card-14.png",
    "card-15.png",
    "card-16.png",
    "card-17.png",
    "card-18.png",
    "card-19-10.png",
    "card-2-10.png",
    "card-20.png",
    "card-21-10.png",
    "card-22.png",
    "card-3-10.png",
    "card-5.png",
    "card-6.png",
    "card-7.png",
    "card-8-10.png",
    "card-9.png",
    "rare.png"
  ]

  console.log('Start seeding...')

  for (const file of cardFiles) {
    const name = file.replace('.png', '')
    let quantity = 9

    if (file === 'rare.png') {
      quantity = 5
    } else if (file.includes('-10')) {
      quantity = 10
    }

    const existingCard = await prisma.card.findFirst({
      where: { name }
    })

    if (existingCard) {
      console.log(`Updating card: ${name} (quantity: ${quantity})`)
      await prisma.card.update({
        where: { id: existingCard.id },
        data: { quantity }
      })
    } else {
      console.log(`Creating card: ${name} (quantity: ${quantity})`)
      await prisma.card.create({
        data: {
          name,
          quantity
        }
      })
    }
  }

  console.log('Seeding finished.')
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
