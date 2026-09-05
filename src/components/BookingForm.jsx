import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Calculator, 
  ShieldCheck, 
  XCircle,
  CreditCard,
  Sparkles,
  Lock,
  Send,
  Copy,
  Check,
  Download,
  Eye,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { initiateRazorpayPayment, isPlaceholderRazorpayKey } from '../services/razorpayService';
import { 
  formatReservationWhatsAppMessage, 
  getResortWhatsAppUrl,
  getGuestWhatsAppUrl,
  getWhatsAppShareUrl,
  shareReservationVoucher,
  triggerWhatsAppWebhook,
  dispatchAutomatedWhatsAppReceipt,
  RESORT_WHATSAPP_PRIMARY 
} from '../services/whatsappService';
import {
  getReceiptImageBlob,
  generateAndUploadReceiptImage,
  downloadReceiptImage,
  shareReceiptImageFile
} from '../services/receiptImageService';

export default function BookingForm({ preselectedRoomId }) {
  const { rooms, addBooking, getEffectivePrice, getRoomInventory } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    checkIn: today,
    checkOut: tomorrow,
    roomId: preselectedRoomId || (rooms[0]?.id || 'private_cottage'),
    guests: '2',
    name: '',
    email: '',
    phone: '',
  });

  // Payment Options: 'full' (100% online) | 'advance' (50% online) | 'arrival' (pay at resort)
  const [paymentOption, setPaymentOption] = useState('full');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [simulationModal, setSimulationModal] = useState(null);

  const selectedRoom = rooms.find(r => r.id === formData.roomId) || rooms[0] || {};
  const currentInv = getRoomInventory
    ? getRoomInventory(formData.roomId, formData.checkIn, formData.checkOut)
    : { totalUnits: 6, availableUnits: 6, occupiedUnits: 0 };
  const isRoomAvailable = selectedRoom.available !== false && currentInv.availableUnits > 0;
  const effectiveRate = getEffectivePrice ? getEffectivePrice(selectedRoom) : (selectedRoom.price || 4500);

  const [bookingSummary, setBookingSummary] = useState({
    nights: 1,
    basePrice: effectiveRate,
    tax: Math.round(effectiveRate * 0.12),
    total: Math.round(effectiveRate * 1.12),
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [autoSentWhatsApp, setAutoSentWhatsApp] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [autoSendStatus, setAutoSendStatus] = useState('idle'); // 'sending' | 'sent' | 'unconfigured' | 'failed'

  const payableNow = paymentOption === 'full' 
    ? bookingSummary.total 
    : (paymentOption === 'advance' ? Math.round(bookingSummary.total / 2) : 0);
  const balanceDue = bookingSummary.total - payableNow;

  // Automatically generate high-res receipt image and dispatch to customer WhatsApp upon confirmation
  useEffect(() => {
    if (isSubmitted && bookingId && !autoSentWhatsApp) {
      setAutoSentWhatsApp(true);
      setAutoSendStatus('sending');

      const currentBooking = {
        id: bookingId,
        guestName: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomName: selectedRoom?.name || 'Luxury Stay',
        guests: formData.guests,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: bookingSummary.nights,
        amount: bookingSummary.total,
        paidAmount: paymentResult?.paidAmount || 0,
        balanceAmount: paymentResult?.balanceAmount || 0,
        paymentStatus: paymentResult?.paymentId ? (paymentOption === 'full' ? 'paid' : 'advance_paid') : 'pay_at_checkin',
        paymentMethod: paymentResult?.method || (paymentResult?.paymentId ? 'Razorpay Online' : 'Pay on Arrival'),
        paymentId: paymentResult?.paymentId || null,
        basePrice: bookingSummary.basePrice,
        tax: bookingSummary.tax
      };

      setIsGeneratingReceipt(true);

      // 1. Immediately render high-res receipt locally on canvas
      getReceiptImageBlob(currentBooking)
        .then(({ dataUrl }) => {
          setReceiptDataUrl(dataUrl);

          // 2. Upload to public CDN so WhatsApp gets a direct permanent image link
          generateAndUploadReceiptImage(currentBooking)
            .then(uploadedUrl => {
              setIsGeneratingReceipt(false);
              const finalImageUrl = uploadedUrl && uploadedUrl.startsWith('http') ? uploadedUrl : null;
              if (finalImageUrl) {
                setReceiptImageUrl(finalImageUrl);
              }

              // 3. Automatically dispatch via backend Serverless API to customer's WhatsApp
              dispatchAutomatedWhatsAppReceipt(currentBooking, finalImageUrl)
                .then(apiRes => {
                  if (apiRes?.success) {
                    setAutoSendStatus('sent');
                  } else if (apiRes?.requiresConfiguration) {
                    setAutoSendStatus('unconfigured');
                  } else {
                    setAutoSendStatus('unconfigured');
                  }
                })
                .catch(() => setAutoSendStatus('unconfigured'));

              // Also trigger webhook if configured
              triggerWhatsAppWebhook({ ...currentBooking, receiptImageUrl: finalImageUrl });
            })
            .catch(() => {
              setIsGeneratingReceipt(false);
              dispatchAutomatedWhatsAppReceipt(currentBooking, null)
                .then(apiRes => setAutoSendStatus(apiRes?.success ? 'sent' : 'unconfigured'))
                .catch(() => setAutoSendStatus('unconfigured'));
            });
        })
        .catch(err => {
          console.warn('Receipt generation notice:', err);
          setIsGeneratingReceipt(false);
          dispatchAutomatedWhatsAppReceipt(currentBooking, null)
            .then(apiRes => setAutoSendStatus(apiRes?.success ? 'sent' : 'unconfigured'))
            .catch(() => setAutoSendStatus('unconfigured'));
        });
    }
  }, [isSubmitted, bookingId, formData, paymentResult, paymentOption, bookingSummary, selectedRoom, autoSentWhatsApp]);

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

    const currentRoom = rooms.find(r => r.id === formData.roomId) || rooms[0] || {};
    const roomRate = getEffectivePrice ? getEffectivePrice(currentRoom) : (currentRoom.price || 4500);
    const basePrice = roomRate * diffNights;
    const tax = Math.round(basePrice * 0.12);
    const total = basePrice + tax;

    setBookingSummary({
      nights: diffNights,
      basePrice,
      tax,
      total,
    });
  }, [formData.checkIn, formData.checkOut, formData.roomId, rooms, getEffectivePrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please complete all contact credentials fields.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `PAP-${new Date().getFullYear()}-${randomNum}`;
    setBookingId(id);

    // Option 1: Pay on arrival
    if (paymentOption === 'arrival') {
      const bookingRecord = {
        id,
        guestName: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomId: formData.roomId,
        roomName: selectedRoom.name,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: bookingSummary.nights,
        amount: bookingSummary.total,
        status: 'active',
        paymentStatus: 'pay_at_checkin',
        paymentMethod: 'Pay at Resort / UPI on Arrival',
        paidAmount: 0,
        balanceAmount: bookingSummary.total
      };
      if (addBooking) addBooking(bookingRecord);
      setPaymentResult({
        paymentId: null,
        method: 'Pay on Arrival (UPI / Cash at Resort)',
        paidAmount: 0,
        balanceAmount: bookingSummary.total
      });
      setIsSubmitted(true);
      return;
    }

    // Option 2 & 3: Razorpay Payment (Full or 50% Advance)
    setIsProcessingPayment(true);
    try {
      await initiateRazorpayPayment({
        amount: payableNow,
        bookingId: id,
        roomName: selectedRoom.name,
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        onSuccess: (paymentData) => {
          setIsProcessingPayment(false);
          const bookingRecord = {
            id,
            guestName: formData.name,
            email: formData.email,
            phone: formData.phone,
            roomId: formData.roomId,
            roomName: selectedRoom.name,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            nights: bookingSummary.nights,
            amount: bookingSummary.total,
            status: 'confirmed',
            paymentStatus: paymentOption === 'full' ? 'paid' : 'advance_paid',
            paymentMethod: 'Razorpay Online (UPI / Card / NetBanking)',
            paymentId: paymentData.paymentId,
            paidAmount: payableNow,
            balanceAmount: balanceDue
          };
          if (addBooking) addBooking(bookingRecord);
          setPaymentResult({
            paymentId: paymentData.paymentId,
            method: 'Razorpay Online (UPI / Card / NetBanking)',
            paidAmount: payableNow,
            balanceAmount: balanceDue
          });
          setIsSubmitted(true);
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
          if (isPlaceholderRazorpayKey()) {
            setSimulationModal({
              id,
              payableNow,
              balanceDue
            });
          }
        }
      });
    } catch (err) {
      console.error('Razorpay launch error', err);
      setIsProcessingPayment(false);
      alert('Could not launch Razorpay: ' + (err.message || 'Please check your connection and try again.'));
    }
  };

  if (isSubmitted) {
    const currentConfirmedBooking = {
      id: bookingId,
      guestName: formData.name,
      email: formData.email,
      phone: formData.phone,
      roomName: selectedRoom?.name || 'Luxury Stay',
      guests: formData.guests,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: bookingSummary.nights,
      amount: bookingSummary.total,
      paidAmount: paymentResult?.paidAmount || 0,
      balanceAmount: paymentResult?.balanceAmount || 0,
      paymentStatus: paymentResult?.paymentId ? (paymentOption === 'full' ? 'paid' : 'advance_paid') : 'pay_at_checkin',
      paymentMethod: paymentResult?.method || (paymentResult?.paymentId ? 'Razorpay Online' : 'Pay on Arrival'),
      paymentId: paymentResult?.paymentId || null,
      basePrice: bookingSummary.basePrice,
      tax: bookingSummary.tax
    };

    const whatsAppVoucherText = formatReservationWhatsAppMessage(currentConfirmedBooking, receiptImageUrl);
    const resortWhatsAppUrl = getResortWhatsAppUrl(currentConfirmedBooking, RESORT_WHATSAPP_PRIMARY, receiptImageUrl);
    const guestWhatsAppUrl = getGuestWhatsAppUrl(formData.phone, currentConfirmedBooking, receiptImageUrl);
    const universalShareUrl = getWhatsAppShareUrl(currentConfirmedBooking, receiptImageUrl);

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

              {/* Automated WhatsApp Delivery Notification Banner */}
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                autoSendStatus === 'sent' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' 
                  : (autoSendStatus === 'sending' 
                      ? 'bg-sky-50 border-sky-300 text-sky-950 shadow-xs'
                      : (autoSendStatus === 'unconfigured' 
                          ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'))
              }`}>
                <div className="shrink-0 mt-0.5">
                  {autoSendStatus === 'sending' && <Loader2 size={16} className="animate-spin text-sky-600" />}
                  {autoSendStatus === 'sent' && <CheckCircle2 size={16} className="text-emerald-600" />}
                  {autoSendStatus === 'unconfigured' && <Sparkles size={16} className="text-amber-600" />}
                  {autoSendStatus === 'idle' && <Send size={16} className="text-emerald-600" />}
                </div>
                <div className="flex-1 text-left space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold uppercase tracking-wider text-[0.7rem]">
                      {autoSendStatus === 'sent' && '✓ Receipt Automatically Delivered to WhatsApp'}
                      {autoSendStatus === 'sending' && '⚡ Automatically Sending Receipt to WhatsApp...'}
                      {autoSendStatus === 'unconfigured' && 'Automated WhatsApp Dispatch Ready'}
                      {autoSendStatus === 'idle' && 'WhatsApp Reservation Dispatch'}
                    </p>
                    <span className="text-[0.62rem] font-mono px-2 py-0.5 rounded bg-white/80 font-bold">
                      {formData.phone}
                    </span>
                  </div>
                  <p className="text-[0.68rem] opacity-90 leading-relaxed">
                    {autoSendStatus === 'sent' && (
                      `Your official booking receipt image and voucher have been sent automatically to ${formData.phone}. Check your WhatsApp!`
                    )}
                    {autoSendStatus === 'sending' && (
                      `Sending official digital receipt image to ${formData.phone} via resort gateway...`
                    )}
                    {autoSendStatus === 'unconfigured' && (
                      `Background dispatch API is active. To enable silent 24/7 background sending without opening WhatsApp, connect your resort WhatsApp gateway (UltraMsg / Meta Cloud API) in Vercel environment variables.`
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Verification Badge */}
              <div className="bg-emerald-50/80 p-4 rounded-lg border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-emerald-950 font-bold">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> Payment Status</span>
                  <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[0.68rem] font-bold">
                    {paymentResult?.paymentId ? 'Verified via Razorpay' : 'Confirmed (Pay on Arrival)'}
                  </span>
                </div>
                {paymentResult?.paymentId && (
                  <div className="flex justify-between text-[0.7rem] text-emerald-800 font-mono">
                    <span>Razorpay ID:</span>
                    <span>{paymentResult.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-emerald-900 pt-1.5 border-t border-emerald-200/60">
                  <span>Paid Online:</span>
                  <span className="font-bold text-sm">₹{paymentResult?.paidAmount?.toLocaleString() || 0}</span>
                </div>
                {paymentResult?.balanceAmount > 0 && (
                  <div className="flex justify-between text-xs text-amber-900 font-semibold">
                    <span>Balance Due on Arrival:</span>
                    <span className="font-bold text-amber-800">₹{paymentResult.balanceAmount.toLocaleString()}</span>
                  </div>
                )}
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
                  <span>GST (12%)</span>
                  <span>₹{bookingSummary.tax}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary-deep pt-3 border-t border-dashed border-border-light">
                  <span className="uppercase tracking-widest">GRAND TOTAL</span>
                  <span className="text-accent-gold font-display text-lg">₹{bookingSummary.total}</span>
                </div>
              </div>

              {/* Official Billing Receipt Image Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white space-y-3.5 shadow-md border border-slate-800 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-accent-gold flex items-center justify-center font-bold shrink-0">
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        Official Billing Receipt Image
                      </h4>
                      <p className="text-[0.68rem] text-slate-400">
                        {isGeneratingReceipt ? 'Rendering digital boarding pass receipt image...' : 'High-resolution official reservation receipt generated'}
                      </p>
                    </div>
                  </div>
                  {isGeneratingReceipt ? (
                    <span className="flex items-center gap-1 text-[0.65rem] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full animate-pulse">
                      <Loader2 size={10} className="animate-spin" /> Rendering
                    </span>
                  ) : (
                    <span className="text-[0.65rem] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      ✓ Ready
                    </span>
                  )}
                </div>

                {/* Receipt Image Preview Thumbnail if generated */}
                {receiptDataUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/60 p-2.5 flex items-center justify-between gap-3">
                    <div 
                      className="flex items-center gap-3 overflow-hidden cursor-pointer group"
                      onClick={() => setShowReceiptModal(true)}
                    >
                      <img 
                        src={receiptDataUrl} 
                        alt="Reservation Boarding Pass Receipt" 
                        className="w-14 h-20 object-cover rounded border border-slate-700 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="text-left text-xs space-y-0.5 truncate">
                        <p className="font-bold text-slate-200 truncate group-hover:text-accent-gold transition-colors">{selectedRoom?.name || 'Luxury Stay'}</p>
                        <p className="text-[0.68rem] text-slate-400 font-mono">{bookingId}</p>
                        <p className="text-[0.68rem] text-accent-gold font-bold">Total: ₹{Number(bookingSummary.total).toLocaleString('en-IN')}</p>
                        <span className="text-[0.62rem] text-slate-400 underline block pt-0.5">Click to preview full image</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowReceiptModal(true)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-600 transition-colors"
                        title="Inspect receipt image"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadReceiptImage(currentConfirmedBooking)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-600 transition-colors"
                        title="Download receipt image"
                      >
                        <Download size={12} /> Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Receipt Image Quick Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const shared = await shareReceiptImageFile(currentConfirmedBooking, whatsAppVoucherText);
                      if (!shared) {
                        window.open(resortWhatsAppUrl, '_blank');
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Send size={14} /> 📲 Send Receipt to WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadReceiptImage(currentConfirmedBooking)}
                    className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-100 border border-slate-600 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Download size={14} /> 📥 Download Receipt (JPG)
                  </button>
                </div>
              </div>

              {/* WhatsApp Reservation Confirmation & Instant Dispatch Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-emerald-500/80 text-left space-y-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                      <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider">
                          Connect with Resort on WhatsApp
                        </h4>
                        <span className="inline-flex items-center text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                          Instant
                        </span>
                      </div>
                      <p className="text-[0.72rem] text-emerald-800 mt-0.5 leading-snug">
                        Send this booking voucher directly to Peace at Peak Front Desk for immediate check-in coordination and road directions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Call to Action: Send directly to Resort Concierge */}
                <a
                  href={resortWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg text-center tracking-wide"
                >
                  <Send size={16} /> 📲 Send Booking to Resort on WhatsApp (+91 70555 22239)
                </a>

                {/* Secondary Actions Row: Share & Copy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const shared = await shareReceiptImageFile(currentConfirmedBooking, whatsAppVoucherText);
                      if (!shared) {
                        const sharedText = await shareReservationVoucher(currentConfirmedBooking);
                        if (!sharedText) {
                          window.open(universalShareUrl, '_blank');
                        }
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 active:scale-98 text-emerald-950 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                    title="Share voucher with family or travel companions via WhatsApp"
                  >
                    <Sparkles size={14} className="text-emerald-600" /> Share Voucher & Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(whatsAppVoucherText);
                      setCopiedWhatsApp(true);
                      setTimeout(() => setCopiedWhatsApp(false), 2500);
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 active:scale-98 text-emerald-950 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                    title="Copy full voucher text to clipboard"
                  >
                    {copiedWhatsApp ? (
                      <>
                        <Check size={14} className="text-emerald-600 font-bold" /> Voucher Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-emerald-700" /> Copy Voucher Text
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Assistance & Guest receipt */}
                <div className="pt-2 border-t border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-[0.68rem] text-emerald-900 gap-1.5">
                  <span className="text-emerald-800">
                    Lead Guest: <strong>{formData.name}</strong> ({formData.phone})
                  </span>
                  <a
                    href={guestWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                    title="Open chat to save voucher to your own WhatsApp"
                  >
                    Save Copy to My WhatsApp ({formData.phone})
                  </a>
                </div>
              </div>

              {/* Full Resolution Receipt Image Lightbox Modal */}
              {showReceiptModal && receiptDataUrl && (
                <div 
                  className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setShowReceiptModal(false)}
                >
                  <div 
                    className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 my-8 space-y-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-900">Official Reservation Receipt</h3>
                        <p className="text-[0.7rem] text-slate-500 font-mono">{bookingId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowReceiptModal(false)}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200 shadow-inner">
                      <img 
                        src={receiptDataUrl} 
                        alt="Full Boarding Pass Receipt" 
                        className="w-full h-auto block"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadReceiptImage(currentConfirmedBooking)}
                        className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download size={14} /> Download Receipt
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const shared = await shareReceiptImageFile(currentConfirmedBooking, whatsAppVoucherText);
                          if (!shared) {
                            window.open(resortWhatsAppUrl, '_blank');
                          }
                        }}
                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send size={14} /> Send to WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center text-[0.65rem] text-text-dark-secondary space-y-1 pt-2">
                <p>Check-in instructions and route directions have been sent to your email.</p>
                <p>We look forward to welcoming you at Peace at Peak, Kanatal!</p>
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
                  {rooms.map(room => {
                    const inv = getRoomInventory
                      ? getRoomInventory(room.id, formData.checkIn, formData.checkOut)
                      : { totalUnits: 6, availableUnits: 6, occupiedUnits: 0 };
                    const roomAvail = room.available !== false && inv.availableUnits > 0;
                    const effPrice = getEffectivePrice ? getEffectivePrice(room) : (room.price || 4500);
                    return (
                      <option key={room.id} value={room.id} disabled={!roomAvail}>
                        {room.name} {!roomAvail ? '— [SOLD OUT]' : `— ₹${effPrice.toLocaleString()}/night (${inv.availableUnits} of ${inv.totalUnits} Available)`}
                      </option>
                    );
                  })}
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
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults (Extra Bed)</option>
                  <option value="4">4 Adults (Family Suite)</option>
                </select>
              </div>
            </div>

            {/* Inventory Real-Time Status Feedback */}
            {isRoomAvailable && currentInv.occupiedUnits > 0 && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <span>
                  <strong>High Demand:</strong> Only <strong>{currentInv.availableUnits} of {currentInv.totalUnits}</strong> {selectedRoom.unitLabel || 'cottages'} remaining for your selected dates ({formData.checkIn} to {formData.checkOut}).
                </span>
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold border-b border-border-light pb-2">
                Primary Contact Information
              </h4>

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
                    placeholder="e.g. +91 70555 22239"
                    className="w-full px-4 py-3 rounded-md border border-border-light focus:border-accent-gold bg-bg-light transition-all text-xs font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Options (Razorpay UPI / Cards vs Pay on Arrival) */}
            <div className="space-y-3 pt-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-text-dark-primary font-bold flex items-center justify-between">
                <span>Select Payment Mode</span>
                <span className="text-accent-gold text-[0.62rem] font-semibold flex items-center gap-1">
                  <Lock size={11} /> 256-Bit SSL Encrypted
                </span>
              </label>

              <div className="space-y-2.5">
                {/* Full Online Payment via Razorpay */}
                <label 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentOption === 'full' 
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                      : 'border-border-light hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="full"
                    checked={paymentOption === 'full'}
                    onChange={() => setPaymentOption('full')}
                    className="mt-1"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-primary-deep flex items-center gap-1.5">
                        <CreditCard size={14} className="text-amber-600" /> Pay 100% Online (Razorpay)
                      </span>
                      <span className="text-xs font-bold text-primary-deep font-mono">₹{bookingSummary.total.toLocaleString()}</span>
                    </div>
                    <p className="text-[0.68rem] text-text-dark-secondary mt-0.5">
                      Instant guaranteed confirmation via UPI (Google Pay, PhonePe, Paytm), Cards, or NetBanking.
                    </p>
                  </div>
                </label>

                {/* 50% Advance Token Deposit */}
                <label 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentOption === 'advance' 
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                      : 'border-border-light hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="advance"
                    checked={paymentOption === 'advance'}
                    onChange={() => setPaymentOption('advance')}
                    className="mt-1"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-primary-deep flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-600" /> 50% Advance Deposit (Razorpay)
                      </span>
                      <span className="text-xs font-bold text-amber-700 font-mono">Pay ₹{Math.round(bookingSummary.total / 2).toLocaleString()}</span>
                    </div>
                    <p className="text-[0.68rem] text-text-dark-secondary mt-0.5">
                      Pay ₹{Math.round(bookingSummary.total / 2).toLocaleString()} now to block your cottage; balance ₹{(bookingSummary.total - Math.round(bookingSummary.total / 2)).toLocaleString()} payable at check-in.
                    </p>
                  </div>
                </label>

                {/* Pay on Arrival / Offline UPI at Resort */}
                <label 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentOption === 'arrival' 
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                      : 'border-border-light hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="arrival"
                    checked={paymentOption === 'arrival'}
                    onChange={() => setPaymentOption('arrival')}
                    className="mt-1"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-primary-deep">
                        Pay on Arrival (UPI / Cash at Front Desk)
                      </span>
                      <span className="text-[0.68rem] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Pay Later</span>
                    </div>
                    <p className="text-[0.68rem] text-text-dark-secondary mt-0.5">
                      Confirm your reservation now and pay total tariff directly upon arrival in Kanatal.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {!isRoomAvailable && (
              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <XCircle size={16} className="shrink-0 text-red-500" />
                <span>All {currentInv.totalUnits} {selectedRoom.unitLabel || 'units'} of this sanctuary are <strong>Sold Out</strong> for your dates ({formData.checkIn} to {formData.checkOut}). Please choose another stay above.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isRoomAvailable || isProcessingPayment}
              className={`btn btn-block py-4 text-xs font-semibold uppercase tracking-widest ${
                isRoomAvailable && !isProcessingPayment
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {isProcessingPayment ? (
                'Opening Razorpay Secure Window...'
              ) : isRoomAvailable ? (
                paymentOption === 'arrival' ? (
                  <>
                    Confirm Reservation (Pay on Arrival) <ChevronRight size={16} />
                  </>
                ) : (
                  <>
                    Pay ₹{payableNow.toLocaleString()} via Razorpay <ChevronRight size={16} />
                  </>
                )
              ) : (
                'Selected Sanctuary Is Sold Out'
              )}
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
                  <span>₹{selectedRoom.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Duration</span>
                  <span>{bookingSummary.nights} {bookingSummary.nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Subtotal</span>
                  <span>₹{bookingSummary.basePrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-light-secondary">
                  <span>Hotel GST (12%)</span>
                  <span>₹{bookingSummary.tax?.toLocaleString()}</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span className="uppercase tracking-widest">GRAND TOTAL</span>
                  <span className="text-accent-gold text-base">₹{bookingSummary.total?.toLocaleString()}</span>
                </div>

                {paymentOption === 'advance' && (
                  <div className="bg-white/10 p-3 rounded-lg text-xs space-y-1 mt-3 border border-white/15">
                    <div className="flex justify-between text-amber-300 font-bold">
                      <span>Payable Now (50% Deposit):</span>
                      <span>₹{payableNow.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 text-[0.7rem]">
                      <span>Balance on Check-In:</span>
                      <span>₹{balanceDue.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-bg-dark/50 p-4 rounded-xl border border-border-gold/25 flex items-start gap-2.5 text-[0.65rem] text-text-light-secondary leading-relaxed">
                <ShieldCheck className="text-accent-gold shrink-0 mt-0.5" size={14} />
                <p>
                  Instant confirmation. Protected by Razorpay 256-Bit SSL Bank Grade Security. Free cancellations honored up to 24 hours prior to check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Simulation Modal for Placeholder Key */}
      {simulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-border-light text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Razorpay Sandbox Simulation
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Razorpay standard test accounts require your personal free Key ID to enable test UPI/Cards. 
            </p>

            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1 text-left">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Lock size={13} /> Test Mode Sandbox Ready
              </p>
              <p className="text-[0.72rem] text-amber-900/90 leading-normal">
                Would you like to <strong>simulate a verified payment</strong> now to inspect the Cloud Firestore sync and Boarding Pass voucher?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSimulationModal(null)}
                className="w-1/2 py-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const simBooking = {
                    id: simulationModal.id,
                    guestName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    roomId: formData.roomId,
                    roomName: selectedRoom.name,
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                    nights: bookingSummary.nights,
                    amount: bookingSummary.total,
                    status: 'confirmed',
                    paymentStatus: paymentOption === 'full' ? 'paid' : 'advance_paid',
                    paymentMethod: 'Razorpay Sandbox (Simulated UPI)',
                    paymentId: `pay_sim_${Math.floor(100000 + Math.random() * 900000)}`,
                    paidAmount: simulationModal.payableNow,
                    balanceAmount: simulationModal.balanceDue,
                    createdAt: new Date().toISOString()
                  };
                  if (addBooking) addBooking(simBooking);
                  setPaymentResult({
                    paymentId: simBooking.paymentId,
                    method: 'Razorpay Sandbox (Simulated UPI)',
                    paidAmount: simulationModal.payableNow,
                    balanceAmount: simulationModal.balanceDue
                  });
                  setSimulationModal(null);
                  setIsSubmitted(true);
                }}
                className="w-1/2 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                Simulate Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
