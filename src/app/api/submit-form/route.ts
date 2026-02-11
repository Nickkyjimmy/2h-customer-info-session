import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDomainWithError } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, questions } = body

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

    // Create new attendance record with attend = true
    const attendance = await prisma.attendance.create({
      data: {
        domain,
        questions: questions || null,
        attend: true, // Set to true on submission
      },
    })

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
