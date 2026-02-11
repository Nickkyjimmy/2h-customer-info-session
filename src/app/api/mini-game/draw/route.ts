import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attendanceId } = body

    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }

    console.log('Processing draw for attendance:', attendanceId)

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Check if user already has a card
      const attendance = await tx.attendance.findUnique({
        where: { id: attendanceId },
        include: { card: true }
      })

      if (!attendance) {
        throw new Error('Attendance not found')
      }

      if (attendance.card) {
        console.log('User already has card:', attendance.card.name)
        return { alreadyDrawn: true, card: attendance.card }
      }

      // 2. Fetch all cards with quantity > 0
      const availableCards = await tx.card.findMany({
        where: { quantity: { gt: 0 } }
      })

      if (availableCards.length === 0) {
        console.error('No cards left!')
        throw new Error('No cards left!')
      }

      console.log('Available cards count:', availableCards.length)

      // 3. Calculate weighted probability
      const totalWeight = availableCards.reduce((sum: number, card: { quantity: number }) => sum + card.quantity, 0)
      console.log('Total weight:', totalWeight)
      
      let randomValue = Math.random() * totalWeight
      console.log('Random value:', randomValue)
      
      let selectedCard = availableCards[availableCards.length - 1] // Fallback

      // Iterate to find the interval
      for (const card of availableCards) {
        if (randomValue < card.quantity) {
          selectedCard = card
          break
        }
        randomValue -= card.quantity
      }
      
      console.log('Selected card:', selectedCard.name)

      // 4. Decrement quantity
      await tx.card.update({
        where: { id: selectedCard.id },
        data: { quantity: { decrement: 1 } }
      })

      // 5. Assign card to attendance
      const updatedAttendance = await tx.attendance.update({
        where: { id: attendanceId },
        data: { cardReceive: selectedCard.id },
        include: { card: true }
      })

      return { alreadyDrawn: false, card: updatedAttendance.card }
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error drawing card:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to draw card' },
      { status: 500 }
    )
  }
}
