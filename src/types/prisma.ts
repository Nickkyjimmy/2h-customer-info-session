import { Attendance, Card } from '@prisma/client'

// Export Prisma types
export type { Attendance, Card }

// Extended types with relations
export type AttendanceWithCard = Attendance & {
  card: Card | null
}

export type CardWithAttendances = Card & {
  attendances: Attendance[]
}

// Input types for creating/updating records
export type CreateAttendanceInput = {
  domain: string
  questions?: string | null
  attend?: boolean
  cardReceive?: string | null
}

export type UpdateAttendanceInput = Partial<CreateAttendanceInput>

export type CreateCardInput = {
  name: string
  quantity?: number
}

export type UpdateCardInput = Partial<CreateCardInput>
