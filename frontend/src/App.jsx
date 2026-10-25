import { useState, useEffect } from 'react';

const API = 'http://localhost:3000';
const RESOURCES = ['Meeting Room A', 'Meeting Room B', 'Table 5'];

function App() {
  const [resource, setResource] = useState(RESOURCES[0]);
  const [date, setDate] = useState('2026-10-27');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      setBookings([]);
      return;
    }

    fetch(`${API}/api/slots?resource=${encodeURIComponent(resource)}&date=${date}`)
      .then((res) => res.json())
      .then((data) => setSlots(data));

    fetch(`${API}/api/bookings/${date}/${encodeURIComponent(resource)}`)
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, [resource, date, refreshKey]);

  async function handleBook() {
    if (!selectedTime) {
      setMessage({ type: 'error', text: 'Pick a time slot first.' });
      return;
    }
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Enter your name and email.' });
      return;
    }

    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource, date, time: selectedTime, name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
        setRefreshKey((k) => k + 1);
        return;
      }

      setMessage({ type: 'success', text: `Booked ${resource} at ${selectedTime}.` });
      setSelectedTime(null);
      setName('');
      setEmail('');
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  }

  async function handleCancel(id) {
    try {
      const res = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setMessage({ type: 'success', text: 'Booking cancelled.' });
      }
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    }
  }

  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const bookingLabel = selectedTime
    ? `Booking ${resource} at ${selectedTime}`
    : 'Pick a time above first';

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Booking System</h1>
          <p className="mt-1 text-blue-100">Reserve a room or table in a few clicks.</p>
        </div>
      </header>

      <main className="mx-auto -mt-8 grid max-w-5xl gap-6 px-4 pb-10 md:grid-cols-5">
        <section className="rounded-2xl bg-white p-6 shadow-lg md:col-span-3">
          <p className="text-sm font-medium text-slate-500">1. Choose a resource</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {RESOURCES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setResource(r);
                  setSelectedTime(null);
                }}
                onChange={(e) => {
  setDate(e.target.value);
  setSelectedTime(null);
  setMessage(null);
}}
                className={
                  r === resource
                    ? 'rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow'
                    : 'rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600'
                }
              >
                {r}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">2. Pick a date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedTime(null);
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-sm text-slate-400">{prettyDate}</p>

          <p className="mt-6 text-sm font-medium text-slate-500">3. Pick a time</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {slots.map((slot) => {
              let style =
                'rounded-lg border border-blue-200 bg-blue-50 py-2 font-medium text-blue-700 hover:border-blue-500 hover:bg-blue-100';
              if (!slot.available) {
                style =
                  'cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 py-2 text-slate-400 line-through';
              } else if (slot.time === selectedTime) {
                style =
                  'rounded-lg border border-blue-600 bg-blue-600 py-2 font-medium text-white shadow';
              }

              return (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedTime(slot.time);
                    setMessage(null);
                  }}
                  className={style}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-blue-100 ring-1 ring-blue-300" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-blue-600" /> Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-slate-200" /> Booked
            </span>
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">4. Your details</p>
          <p className="mt-1 text-sm text-slate-400">{bookingLabel}</p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="flex-1 rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            onClick={handleBook}
            className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            Book slot
          </button>

          {message && (
            <p
              className={
                message.type === 'error'
                  ? 'mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'
                  : 'mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700'
              }
            >
              {message.text}
            </p>
          )}
        </section>

        <aside className="self-start rounded-2xl bg-white p-6 shadow-lg md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">Reservations</h2>
          <p className="text-sm text-slate-400">
            {resource} · {prettyDate}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {bookings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                No reservations yet. Pick a time to make the first one.
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{b.name}</p>
                    <p className="text-sm text-slate-500">{b.time}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;