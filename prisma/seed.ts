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

  // Office seeding
  const offices = [
    { name: 'Hồ Chí Minh', quantity: 18 },
    { name: 'Hà Nội', quantity: 13 },
    { name: 'Đà Nẵng', quantity: 3 },
  ]

  for (const office of offices) {
    const existingOffice = await prisma.office.findFirst({
      where: { name: office.name }
    })

    if (!existingOffice) {
      console.log(`Creating office: ${office.name}`)
      await prisma.office.create({
        data: {
          name: office.name,
          quantity: office.quantity
        }
      })
    } else {
        console.log(`Updating office quantity: ${office.name}`)
        await prisma.office.update({
            where: { id: existingOffice.id },
            data: { quantity: office.quantity }
        })
    }
  }

  // Session seeding
  const sessions = [
    "The Patron",
    "The Reformer",
    "The Merchant of Venice", 
    "The Joybringer", 
    "The Artisan", 
    "The Alchemist", 
    "The Grandmaster", 
    "The Pathfinder", 
    "The Voyager", 
    "The Visionary", 
    "The Strategist"
  ]

  for (const name of sessions) {
    const existingSession = await prisma.session.findFirst({
      where: { name }
    })

    if (!existingSession) {
      console.log(`Creating session: ${name}`)
      await prisma.session.create({
        data: { name }
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
