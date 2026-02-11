import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, quantity } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Card name is required' },
        { status: 400 }
      )
    }

    // Create new card
    const card = await prisma.card.create({
      data: {
        name,
        quantity: quantity ?? 0,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific card by ID
      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          attendances: true,
        },
      })

      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(card)
    }

    // Get all cards
    const cards = await prisma.card.findMany({
      include: {
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, quantity } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    // Update card
    const card = await prisma.card.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity }),
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    // Check if card exists
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // Optional: Prevent deletion if card has attendances
    if (card._count.attendances > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete card with existing attendances',
          attendanceCount: card._count.attendances 
        },
        { status: 409 }
      )
    }

    // Delete card
    await prisma.card.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: 'Card deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    )
  }
}
