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

    let targetOfficeId = null as string | null;

    if (body.officeId) {
        targetOfficeId = body.officeId;
    } else if (located_in) {
      // Find office by name if located_in is provided
      const office = await prisma.office.findFirst({
        where: { name: located_in }
      });
      if (office) {
        targetOfficeId = office.id;
      }
    }

    // Create new attendance record and update office quantity
    const attendance = await prisma.$transaction(async (tx) => {
        // Prepare data for attendance creation
        const attendanceData: any = {
            domain,
            questions: questions || null,
            attend: true,
            officeId: targetOfficeId, 
            sessionId: sessionId || null,
        };

        const newAttendance = await tx.attendance.create({
            data: attendanceData
        });

        // Decrement office quantity if an office was selected
        if (targetOfficeId) {
             const office = await tx.office.findUnique({
                where: { id: targetOfficeId }
             });
             
             if (office && office.quantity > 0) {
                 await tx.office.update({
                     where: { id: targetOfficeId },
                     data: { quantity: { decrement: 1 } }
                 });
             } else if (office && office.quantity <= 0) {
                 throw new Error("Selected office is full");
             }
        }

        return newAttendance;
    });

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
