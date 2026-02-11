# API Routes Documentation

This document describes all available API routes for the 2H Info Session application.

## Table of Contents
- [Form Submission](#form-submission)
- [Attendance Management](#attendance-management)
- [Card Management](#card-management)

---

## Form Submission

### Submit Attendance Form
**Endpoint:** `POST /api/submit-form`

Creates a new attendance record and returns the UUID for redirect to mini-game.

**Request Body:**
```json
{
  "domain": "user@mservice.com.vn",
  "questions": "What time does the event start?"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "id": "clxxx...",
  "redirectUrl": "/mini-game/clxxx..."
}
```

**Error Responses:**
- `400` - Email is required or invalid domain
- `409` - Email already registered
- `500` - Server error

**Example Usage:**
```typescript
const response = await fetch('/api/submit-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'user@mservice.com.vn',
    questions: 'Optional question text'
  })
})

const data = await response.json()
if (data.id) {
  router.push(`/mini-game/${data.id}`)
}
```

---

## Attendance Management

### Get All Attendances
**Endpoint:** `GET /api/attendance`

Retrieves all attendance records with their associated cards.

**Success Response (200):**
```json
[
  {
    "id": "clxxx...",
    "domain": "user@mservice.com.vn",
    "questions": "Question text",
    "cardReceive": "clyyy...",
    "attend": true,
    "createdAt": "2026-02-11T02:59:55.000Z",
    "updatedAt": "2026-02-11T02:59:55.000Z",
    "card": {
      "id": "clyyy...",
      "name": "VIP Card",
      "quantity": 100,
      "createdAt": "2026-02-11T02:59:55.000Z",
      "updatedAt": "2026-02-11T02:59:55.000Z"
    }
  }
]
```

### Get Attendance by Email
**Endpoint:** `GET /api/attendance?domain=user@mservice.com.vn`

Retrieves a specific attendance record by email.

**Success Response (200):**
```json
{
  "id": "clxxx...",
  "domain": "user@mservice.com.vn",
  "questions": "Question text",
  "cardReceive": "clyyy...",
  "attend": true,
  "createdAt": "2026-02-11T02:59:55.000Z",
  "updatedAt": "2026-02-11T02:59:55.000Z",
  "card": {
    "id": "clyyy...",
    "name": "VIP Card",
    "quantity": 100
  }
}
```

**Error Response:**
- `404` - Attendance not found

### Get Attendance by ID
**Endpoint:** `GET /api/attendance/[id]`

Retrieves and validates an attendance record by UUID. Used by mini-game.

**Success Response (200):**
```json
{
  "id": "clxxx...",
  "domain": "user@mservice.com.vn",
  "questions": "Question text",
  "cardReceive": "clyyy...",
  "attend": true,
  "createdAt": "2026-02-11T02:59:55.000Z",
  "updatedAt": "2026-02-11T02:59:55.000Z",
  "card": {
    "id": "clyyy...",
    "name": "VIP Card",
    "quantity": 100
  }
}
```

**Error Responses:**
- `400` - Attendance ID is required
- `403` - Attendance not confirmed (attend = false)
- `404` - Attendance not found
- `500` - Server error

### Update Attendance Card Assignment
**Endpoint:** `PATCH /api/attendance/[id]`

Updates the card assignment for an attendance record.

**Request Body:**
```json
{
  "cardReceive": "clyyy..."
}
```

**Success Response (200):**
```json
{
  "id": "clxxx...",
  "domain": "user@mservice.com.vn",
  "cardReceive": "clyyy...",
  "attend": true,
  "card": {
    "id": "clyyy...",
    "name": "VIP Card",
    "quantity": 100
  }
}
```

**Error Responses:**
- `400` - Attendance ID is required
- `404` - Card or attendance not found
- `500` - Server error

---

## Card Management

### Create Card
**Endpoint:** `POST /api/card`

Creates a new card.

**Request Body:**
```json
{
  "name": "VIP Card",
  "quantity": 100
}
```

**Success Response (201):**
```json
{
  "id": "clyyy...",
  "name": "VIP Card",
  "quantity": 100,
  "createdAt": "2026-02-11T02:59:55.000Z",
  "updatedAt": "2026-02-11T02:59:55.000Z"
}
```

**Error Responses:**
- `400` - Card name is required
- `500` - Server error

### Get All Cards
**Endpoint:** `GET /api/card`

Retrieves all cards with attendance counts.

**Success Response (200):**
```json
[
  {
    "id": "clyyy...",
    "name": "VIP Card",
    "quantity": 100,
    "createdAt": "2026-02-11T02:59:55.000Z",
    "updatedAt": "2026-02-11T02:59:55.000Z",
    "_count": {
      "attendances": 5
    }
  }
]
```

### Get Card by ID
**Endpoint:** `GET /api/card?id=clyyy...`

Retrieves a specific card with all its attendances.

**Success Response (200):**
```json
{
  "id": "clyyy...",
  "name": "VIP Card",
  "quantity": 100,
  "createdAt": "2026-02-11T02:59:55.000Z",
  "updatedAt": "2026-02-11T02:59:55.000Z",
  "attendances": [
    {
      "id": "clxxx...",
      "domain": "user@mservice.com.vn",
      "attend": true
    }
  ]
}
```

**Error Response:**
- `404` - Card not found

### Update Card
**Endpoint:** `PATCH /api/card`

Updates a card's name or quantity.

**Request Body:**
```json
{
  "id": "clyyy...",
  "name": "Premium VIP Card",
  "quantity": 150
}
```

**Success Response (200):**
```json
{
  "id": "clyyy...",
  "name": "Premium VIP Card",
  "quantity": 150,
  "createdAt": "2026-02-11T02:59:55.000Z",
  "updatedAt": "2026-02-11T02:59:55.000Z"
}
```

**Error Responses:**
- `400` - Card ID is required
- `500` - Server error

### Delete Card
**Endpoint:** `DELETE /api/card?id=clyyy...`

Deletes a card. Prevents deletion if card has attendances.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

**Error Responses:**
- `400` - Card ID is required
- `404` - Card not found
- `409` - Cannot delete card with existing attendances
- `500` - Server error

---

## Application Flow

### User Journey
1. User visits `/check-in`
2. Fills in email (@mservice.com.vn or @momo.vn) and optional questions
3. Submits form → `POST /api/submit-form`
4. Server creates attendance record with `attend = true`
5. Returns UUID and redirects to `/mini-game/[uuid]`
6. Mini-game validates attendance → `GET /api/attendance/[uuid]`
7. User plays mini-game
8. (Optional) Assign card to user → `PATCH /api/attendance/[uuid]`

### Admin Journey
1. Create cards → `POST /api/card`
2. View all attendances → `GET /api/attendance`
3. View card distribution → `GET /api/card`
4. Assign cards to attendances → `PATCH /api/attendance/[id]`
5. Update card quantities → `PATCH /api/card`

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden (authorization error)
- `404` - Not Found
- `409` - Conflict (duplicate or constraint violation)
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting for production use.

## Authentication

Currently, there is no authentication implemented. All endpoints are publicly accessible. Consider adding authentication for admin endpoints in production.
