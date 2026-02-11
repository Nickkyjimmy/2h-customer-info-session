import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDomainWithError } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, questions, located_in, sessionId } = body

    // Validate required fields
    if (!domain) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email domain
    const validationError = validateDomainWithError(domain)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existing = await prisma.attendance.findUnique({
      where: { domain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email has already been registered' },
        { status: 409 }
      )
    }

    // Use a transaction if sessionId is provided to decrement quantities
    let attendance;
    if (sessionId) {
      attendance = await prisma.$transaction(async (tx: any) => {
        // 1. Check if session has remaining quantity
        const session = await tx.session.findUnique({
          where: { id: sessionId },
        })

        if (!session) {
          throw new Error('Session not found')
        }

        if (session.quantities <= 0) {
          throw new Error('This session is full')
        }

        // 2. Create attendance
        const newAttendance = await tx.attendance.create({
          data: {
            domain,
            questions: questions || null,
            attend: true,
            located_in: located_in || null,
            sessionId: sessionId,
          } as any,
        })

        // 3. Decrement session quantity
        await tx.session.update({
          where: { id: sessionId },
          data: { quantities: { decrement: 1 } },
        })

        return newAttendance
      })
    } else {
      // Create new attendance record without session
      attendance = await prisma.attendance.create({
        data: {
          domain,
          questions: questions || null,
          attend: true, // Set to true on submission
          located_in: located_in || null,
          sessionId: null,
        } as any,
      })
    }

    // Return the attendance ID for redirect
    return NextResponse.json(
      { 
        success: true,
        id: attendance.id,
        redirectUrl: `/mini-game/${attendance.id}`
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}
