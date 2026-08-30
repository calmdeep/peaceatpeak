import React, { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, User, CheckCircle2, ChevronRight, Calculator, ShieldCheck } from 'lucide-react';
import { ROOMS_DATA } from './Rooms';

export default function BookingForm({ preselectedRoomId }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    checkIn: today,
    checkOut: tomorrow,
    roomId: preselectedRoomId || 'private_cottage',
    guests: '2',
    name: '',
    email: '',
    phone: '',
  });

  const [bookingSummary, setBookingSummary] = useState({
    nights: 1,
    basePrice: 4500,
    tax: 540,
    total: 5040,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (preselectedRoomId) {
      setFormData(prev => ({ ...prev, roomId: preselectedRoomId }));
    }
  }, [preselectedRoomId]);

  useEffect(() => {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);

    if (checkOutDate <= checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, checkOut: nextDayStr }));
      return;
    }

    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const selectedRoom = ROOMS_DATA.find(r => r.id === formData.roomId) || ROOMS_DATA[0];
    const roomRate = selectedRoom.price;
    const basePrice = roomRate * diffNights;
    const tax = Math.round(basePrice * 0.12);
    const total = basePrice + tax;

    setBookingSummary({
      nights: diffNights,
      basePrice,
      tax,
      total,
    });
  }, [formData.checkIn, formData.checkOut, formData.roomId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please complete all contact credentials fields.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `PAP-${new Date().getFullYear()}-${randomNum}`;
    setBookingId(id);
    setIsSubmitted(true);
  };

  const selectedRoom = ROOMS_DATA.find(r => r.id === formData.roomId) || ROOMS_DATA[0];

  if (isSubmitted) {
    return (
      <section className="py-24 bg-bg-light min-h-[85vh] flex items-center anim-fade">
        <div className="container max-w-xl">
          <div className="boarding-pass overflow-hidden shadow-lg bg-white">
            {/* Boarding Pass Header */}
            <div className="bg-primary-deep text-center py-8 px-6 text-white border-b border-dashed border-border-gold/30">
              <CheckCircle2 className="text-accent-gold mx-auto mb-3" size={48} />
              <h2 className="text-2xl font-light tracking-widest uppercase font-display text-white">RESERVATION CONFIRMED</h2>
              <p className="text-accent-gold text-[0.65rem] tracking-widest uppercase mt-1">Peace at Peak Resort, Kanatal</p>
            </div>

            {/* Boarding Pass Details */}
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center bg-bg-light p-4 rounded border border-border-light">
                <span className="text-[0.65rem] uppercase tracking-widest text-text-dark-secondary font-bold">Booking ID</span>
                <span className="font-mono text-sm font-semibold text-primary-deep">{bookingId}</span>
              </div>

              {/* Grid Specifications */}
              <div className="space-y-4">
                <h3 className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold border-b border-border-light pb-2">Voucher Info</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  <div>
                    <p className="text-text-dark-secondary font-medium uppercase tracking-wider">ACCOMMODATION</p>
                    <p className="font-semibold text-sm text-primary-deep mt-0.5">{selectedRoom.name}</p>
                  </div>
                  <div>
                    <p className="text-text-dark-secondary font-medium uppercase tracking-wider">GUESTS</p>
                    <p className="font-semibold text-sm text-primary-deep mt-0.5">{formData.guests} Occupants</p>
                  </div>
                  <div>
                    <p className="text-text-dark-secondary font-medium uppercase tracking-wider">CHECK-IN</p>
                    <p className="font-semibold text-sm text-primary-deep mt-0.5">{formData.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-text-dark-secondary font-medium uppercase tracking-wider">CHECK-OUT</p>
                    <p className="font-semibold text-sm text-primary-deep mt-0.5">{formData.checkOut}</p>
                  </div>
                </div>
              </div>

              {/* Guest Profile */}
              <div className="space-y-4">
                <h3 className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold border-b border-border-light pb-2">Guest Profile</h3>
                <div className="text-xs space-y-1 text-primary-deep">
                  <p><span className="text-text-dark-secondary uppercase tracking-wider font-semibold mr-1">LEAD GUEST:</span> {formData.name}</p>
                  <p><span className="text-text-dark-secondary uppercase tracking-wider font-semibold mr-1">CONTACT:</span> {formData.phone}</p>
                  <p><span className="text-text-dark-secondary uppercase tracking-wider font-semibold mr-1">EMAIL:</span> {formData.email}</p>
                </div>
              </div>

              {/* Calculations Box */}
              <div className="bg-bg-light p-5 rounded-lg border border-border-light space-y-2 text-xs">
                <div className="flex justify-between text-text-dark-secondary">
                  <span>Room Charge ({bookingSummary.nights} nights)</span>
                  <span>₹{bookingSummary.basePrice}</span>
                </div>
                <div className="flex justify-between text-text-dark-secondary">
                  <span>Simulated Tax (12% GST)</span>
                  <span>₹{bookingSummary.tax}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary-deep pt-3 border-t border-dashed border-border-light">
                  <span className="uppercase tracking-widest">GRAND TOTAL</span>
                  <span className="text-accent-gold font-display text-lg">₹{bookingSummary.total}</span>
                </div>
              </div>

              <div className="text-center text-[0.65rem] text-text-dark-secondary space-y-1 pt-2">
                <p>⚠️ Demo voucher. No real charges are debited.</p>
                <p>Check-in details and route directions have been sent to your inbox.</p>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-outline-dark btn-block py-3.5 mt-4"
                style={{ borderRadius: '0px' }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-bg-light" id="booking">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="luxury-heading-badge">RESERVATIONS</span>
          <h2
            className="text-4xl sm:text-5xl font-light text-primary-deep mt-3 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Request Your Stay
          </h2>
          <div className="gold-divider" />
          <p className="text-text-dark-secondary text-sm leading-relaxed max-w-lg mx-auto">
            Choose your dates, specify your sanctuary cottage, and enter contact details. View final fares and request details instantly.
          </p>
        </div>

        <div className="grid grid-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Reservation Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-md border border-border-light space-y-6"
          >
            <h3
              className="text-2xl font-light text-primary-deep font-display border-b border-border-light pb-3"
            >
              Booking Form
            </h3>

            {/* Stay Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  min={today}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  min={formData.checkIn || today}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Room & Occupants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                  Sanctuary
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-semibold"
                >
                  {ROOMS_DATA.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                  Occupants
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-semibold"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                </select>
              </div>
            </div>

            {/* Credentials Info */}
            <div className="space-y-4 pt-4 border-t border-border-light">
              <h4 className="text-[0.65rem] uppercase tracking-widest text-text-dark-secondary font-bold">Lead Contact</h4>

              <div className="space-y-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                  Guest Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 99887 76655"
                    className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block py-4 text-xs font-semibold uppercase tracking-widest"
              style={{ borderRadius: '0px' }}
            >
              Request Reservation <ChevronRight size={16} />
            </button>
          </form>

          {/* Pricing Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-border-light">
              <img
                src={selectedRoom.image}
                alt={selectedRoom.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <span className="text-accent-gold text-[0.6rem] uppercase tracking-widest font-semibold">SELECTED RETREAT</span>
                <h4 className="text-xl font-light text-primary-deep font-display mt-0.5">{selectedRoom.name}</h4>
                <p className="text-text-dark-secondary text-xs mt-1">{selectedRoom.tagline}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-primary-deep text-white p-6 rounded-2xl shadow-md space-y-6 border border-border-gold">
              <h3
                className="text-xl font-light font-display border-b border-white/10 pb-3 text-white tracking-wider"
              >
                Fare Calculations
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-text-light-secondary">
                  <span>Room rate (Per Night)</span>
                  <span>₹{selectedRoom.price}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Duration</span>
                  <span>{bookingSummary.nights} {bookingSummary.nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Subtotal</span>
                  <span>₹{bookingSummary.basePrice}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Hotel GST (12%)</span>
                  <span>₹{bookingSummary.tax}</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span className="uppercase tracking-widest">GRAND TOTAL</span>
                  <span className="text-accent-gold text-base">₹{bookingSummary.total}</span>
                </div>
              </div>

              <div className="bg-bg-dark/50 p-4 rounded-xl border border-border-gold/25 flex items-start gap-2.5 text-[0.65rem] text-text-light-secondary leading-relaxed">
                <ShieldCheck className="text-accent-gold shrink-0 mt-0.5" size={14} />
                <p>
                  Prices are locked upon reservation submit. Free cancellations are honored up to 24 hours prior to check-in dates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
