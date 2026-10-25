# Booking & Reservation System

A full-stack booking app. Pick a resource and a date, see which time slots are free, and book or cancel a reservation.

## Tech stack

- Front-end: React, Vite, Tailwind CSS
- Back-end: Node.js, Express
- Storage: in-memory array (bookings reset when the server restarts)

## Features

- Resource selector and date picker
- Live availability view (booked slots are greyed out)
- Booking form with name and email
- Conflict detection: the server refuses double bookings (409)
- Reservation list with a Cancel button

## API routes

| Method | Route | What it does |
| --- | --- | --- |
| GET | `/api/slots?resource=...&date=...` | Slots for a resource and date, with availability |
| POST | `/api/bookings` | Create a booking (409 if the slot is taken) |
| GET | `/api/bookings/:date/:resource` | Bookings for a date and resource |
| DELETE | `/api/bookings/:id` | Cancel a booking |

## How to run

You need Node.js installed. Open two terminals.

**Terminal 1: back-end (runs on port 3000)**

```bash
npm install
node server.js
```

**Terminal 2: front-end (runs on port 5173)**

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.