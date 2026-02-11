import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDomainWithError } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, questions, attend } = body

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

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        domain,
        questions: questions || null,
        attend: attend ?? false,
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (domain) {
      // Get specific attendance by domain
      const attendance = await prisma.attendance.findUnique({
        where: { domain },
        include: {
          card: true,
        },
      })

      if (!attendance) {
        return NextResponse.json(
          { error: 'Attendance not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(attendance)
    }

    // Get all attendances
    const attendances = await prisma.attendance.findMany({
      include: {
        card: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Error fetching attendances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}
