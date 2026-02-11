import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')

    console.log('Fetching sessions for location:', location)

    if (!(prisma as any).session) {
      console.error('Prisma Error: session model not found in client')
      return NextResponse.json({ error: 'Prisma Client not updated' }, { status: 500 })
    }

    const sessions = await (prisma as any).session.findMany({
      where: location ? { located_in: location as any } : {},
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
