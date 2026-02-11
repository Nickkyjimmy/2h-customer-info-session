import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }

    // Fetch attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        card: true,
      },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    // Check if user has attended
    if (!attendance.attend) {
      return NextResponse.json(
        { error: 'This attendance has not been confirmed' },
        { status: 403 }
      )
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance record' },
      { status: 500 }
    )
  }
}

// Update attendance card assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { cardReceive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }

    // Verify card exists if cardReceive is provided
    if (cardReceive) {
      const card = await prisma.card.findUnique({
        where: { id: cardReceive },
      })

      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        )
      }
    }

    // Update attendance
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        cardReceive: cardReceive || null,
      },
      include: {
        card: true,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}
