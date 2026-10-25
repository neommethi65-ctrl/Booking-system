const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const bookings = [
  {
    id: 1,
    resource: 'Meeting Room A',
    date: '2026-10-27',
    time: '10:00',
    name: 'Thandi',
    email: 'thandi@example.com',
  },
];
let nextId = 2;

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

app.get('/', (req, res) => {
  res.send('Booking API is running');
});

app.get('/api/slots', (req, res) => {
  const { resource, date } = req.query;

  if (!resource || !date) {
    return res.status(400).json({ error: 'resource and date are required' });
  }

  const bookedTimes = bookings
    .filter((b) => b.resource === resource && b.date === date)
    .map((b) => b.time);

  const slots = TIME_SLOTS.map((time) => ({
    time,
    available: !bookedTimes.includes(time),
  }));

  res.json(slots);
});

app.post('/api/bookings', (req, res) => {
  const { resource, date, time, name, email } = req.body;

  if (!resource || !date || !time || !name || !email) {
    return res.status(400).json({ error: 'resource, date, time, name and email are required' });
  }

  if (!TIME_SLOTS.includes(time)) {
    return res.status(400).json({ error: 'That time is not a valid slot' });
  }

  const conflict = bookings.some(
    (b) => b.resource === resource && b.date === date && b.time === time
  );
  if (conflict) {
    return res.status(409).json({ error: 'That slot is already booked' });
  }

  const newBooking = { id: nextId++, resource, date, time, name, email };
  bookings.push(newBooking);

  res.status(201).json(newBooking);
});

app.get('/api/bookings/:date/:resource', (req, res) => {
  const { date, resource } = req.params;

  const result = bookings.filter(
    (b) => b.date === date && b.resource === resource
  );

  res.json(result);
});

app.delete('/api/bookings/:id', (req, res) => {
  const id = Number(req.params.id);

  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  bookings.splice(index, 1);
  res.json({ message: 'Booking cancelled' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});