import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Sliders, 
  Image as ImageIcon, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BedDouble, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Percent, 
  Tag, 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft,
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  Star, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Save,
  Utensils,
  Coffee,
  Sun,
  Flame,
  HeartHandshake,
  Eye,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { uploadResortImageToStorage } from '../services/firebaseService';
import { isFirebaseConfigured } from '../firebase';
import { uploadImageToPublicCDN, RESORT_PHOTO_PRESETS } from '../services/imageUploadService';

export default function AdminDashboard({ onBackToSite }) {
  const { 
    isFirebaseActive,
    rooms, 
    setRooms,
    updateRoom, 
    addRoomImage, 
    replaceRoomImage,
    reorderRoomImages,
    removeRoomImage, 
    setRoomPrimaryImage,
    getEffectivePrice,
    getRoomInventory,
    propertySpaces,
    setPropertySpaces,
    updatePropertySpace,
    addSpaceImage,
    replaceSpaceImage,
    reorderSpaceImages,
    removeSpaceImage,
    setSpacePrimaryImage,
    heroSlides, 
    addHeroSlide, 
    removeHeroSlide, 
    reorderHeroSlide, 
    updateHeroSlide,
    publishHeroSlides,
    bookings,
    addBooking,
    updateBookingStatus,
    removeBooking,
    adminAuth,
    logout,
    resetAllToDefaults
  } = useAppContext();

  // Navigation: 'overview' | 'config' | 'spaces' | 'hero' | 'bookings' | 'settings'
  const [activeNav, setActiveNav] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Manual Reservation Modal State
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [manualBookingForm, setManualBookingForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomId: rooms[0]?.id || 'private_cottage',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    amount: 4500,
    status: 'confirmed'
  });

  // Timeframe filter for Earnings: '7days' | '28days' | '3months' | '6months'
  const [timeframe, setTimeframe] = useState('7days');

  // Selected Target for configuration: roomId | 'dining_hall' | 'reception_lounge' | 'hero'
  const [selectedTarget, setSelectedTarget] = useState(rooms[0]?.id || 'private_cottage');
  
  const selectedRoom = rooms.find(r => r.id === selectedTarget);
  const selectedSpace = (propertySpaces || []).find(s => s.id === selectedTarget);
  const isTargetRoom = Boolean(selectedRoom);
  const isTargetSpace = Boolean(selectedSpace);
  const isTargetHero = selectedTarget === 'hero';

  // -------------------------------------------------------------
  // Local Draft States for Explicit "Update" Buttons
  // -------------------------------------------------------------
  // Room Pricing & Offers Draft
  const [priceDraft, setPriceDraft] = useState(selectedRoom?.price || 0);
  const [discountDraft, setDiscountDraft] = useState(selectedRoom?.discount || 0);
  const [offerDraft, setOfferDraft] = useState(selectedRoom?.offer || '');
  const [tagDraft, setTagDraft] = useState(selectedRoom?.tag || '');
  const [tagColorDraft, setTagColorDraft] = useState(selectedRoom?.tagColor || 'gold');
  const [totalUnitsDraft, setTotalUnitsDraft] = useState(selectedRoom?.totalUnits || 5);
  const [unitLabelDraft, setUnitLabelDraft] = useState(selectedRoom?.unitLabel || 'Units');
  const [pricingSaved, setPricingSaved] = useState(false);

  // Room Specifications Draft
  const [nameDraft, setNameDraft] = useState(selectedRoom?.name || '');
  const [taglineDraft, setTaglineDraft] = useState(selectedRoom?.tagline || '');
  const [bedDraft, setBedDraft] = useState(selectedRoom?.bed || '');
  const [guestsDraft, setGuestsDraft] = useState(selectedRoom?.guests || '');
  const [viewDraft, setViewDraft] = useState(selectedRoom?.view || '');
  const [descDraft, setDescDraft] = useState(selectedRoom?.description || '');
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Availability Draft
  const [availabilityDraft, setAvailabilityDraft] = useState(selectedRoom?.available !== false);

  // Property Space (Dining/Reception) Draft
  const [spaceTitleDraft, setSpaceTitleDraft] = useState('');
  const [spaceSubtitleDraft, setSpaceSubtitleDraft] = useState('');
  const [spaceTimingsDraft, setSpaceTimingsDraft] = useState('');
  const [spaceDescDraft, setSpaceDescDraft] = useState('');
  const [spaceFeaturesDraft, setSpaceFeaturesDraft] = useState('');
  const [spaceSaved, setSpaceSaved] = useState(false);

  // Image Upload States
  const [newRoomImageUrl, setNewRoomImageUrl] = useState('');
  const [roomUploadError, setRoomUploadError] = useState('');
  const [isUploadingRoom, setIsUploadingRoom] = useState(false);
  const [newSpaceImageUrl, setNewSpaceImageUrl] = useState('');
  const [spaceUploadError, setSpaceUploadError] = useState('');
  const [isUploadingSpace, setIsUploadingSpace] = useState(false);
  const [notification, setNotification] = useState('');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetTargetType, setPresetTargetType] = useState('room'); // 'room' | 'space'
  const [presetCategory, setPresetCategory] = useState('All');

  // Hero slide form state
  const [newHeroUrl, setNewHeroUrl] = useState('');
  const [newHeroCaption, setNewHeroCaption] = useState('');
  const [newHeroPosition, setNewHeroPosition] = useState('center center');
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState('');

  // Sync room draft states when selected room changes
  useEffect(() => {
    if (selectedRoom) {
      setPriceDraft(selectedRoom.price || 0);
      setDiscountDraft(selectedRoom.discount || 0);
      setOfferDraft(selectedRoom.offer || '');
      setTagDraft(selectedRoom.tag || '');
      setTagColorDraft(selectedRoom.tagColor || (selectedRoom.id === 'private_cottage' ? 'gold' : selectedRoom.id === 'swiss_tent' ? 'emerald' : 'blue'));
      setTotalUnitsDraft(selectedRoom.totalUnits || (selectedRoom.id === 'family_tent' ? 4 : 5));
      setUnitLabelDraft(selectedRoom.unitLabel || (selectedRoom.id === 'private_cottage' ? 'Wooden Cottages' : selectedRoom.id === 'swiss_tent' ? 'Swiss Tents' : 'Family Suites'));

      setNameDraft(selectedRoom.name || '');
      setTaglineDraft(selectedRoom.tagline || '');
      setBedDraft(selectedRoom.bed || '');
      setGuestsDraft(selectedRoom.guests || '');
      setViewDraft(selectedRoom.view || '');
      setDescDraft(selectedRoom.description || '');

      setAvailabilityDraft(selectedRoom.available !== false);
    }
  }, [selectedTarget, selectedRoom]);

  // Sync space draft states when selected space changes
  useEffect(() => {
    if (selectedSpace) {
      setSpaceTitleDraft(selectedSpace.name || '');
      setSpaceSubtitleDraft(selectedSpace.subtitle || '');
      setSpaceTimingsDraft(selectedSpace.timings || '');
      setSpaceDescDraft(selectedSpace.description || '');
      setSpaceFeaturesDraft((selectedSpace.features || []).join(', '));
    }
  }, [selectedTarget, selectedSpace]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // -------------------------------------------------------------
  // Explicit "Update" Action Handlers
  // -------------------------------------------------------------
  // 1. Update Room Pricing, Offers & Inventory Capacity
  const handleUpdatePricing = (e) => {
    e?.preventDefault();
    if (!selectedRoom) return;
    const parsedPrice = parseInt(priceDraft, 10);
    const parsedDiscount = Math.min(90, Math.max(0, parseInt(discountDraft, 10) || 0));
    const parsedTotalUnits = Math.max(1, parseInt(totalUnitsDraft, 10) || 6);

    updateRoom(selectedRoom.id, {
      price: !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : selectedRoom.price,
      discount: parsedDiscount,
      offer: offerDraft.trim(),
      tag: tagDraft.trim(),
      tagColor: tagColorDraft,
      totalUnits: parsedTotalUnits,
      unitLabel: unitLabelDraft.trim() || selectedRoom.unitLabel || 'Units'
    });

    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2500);
    showToast(`✅ Successfully updated pricing, color tag & inventory (${parsedTotalUnits} units) for ${selectedRoom.name}! Live website synchronized.`);
  };

  // 2. Update Room Details
  const handleUpdateDetails = (e) => {
    e?.preventDefault();
    if (!selectedRoom) return;
    updateRoom(selectedRoom.id, {
      name: nameDraft.trim() || selectedRoom.name,
      tagline: taglineDraft.trim(),
      bed: bedDraft.trim(),
      guests: guestsDraft.trim(),
      view: viewDraft.trim(),
      description: descDraft.trim()
    });

    setDetailsSaved(true);
    setTimeout(() => setDetailsSaved(false), 2500);
    showToast(`✅ Successfully updated room details for ${selectedRoom.name}! Live website synchronized.`);
  };

  // 3. Update Room Availability
  const handleUpdateAvailability = (newStatus) => {
    if (!selectedRoom) return;
    setAvailabilityDraft(newStatus);
    updateRoom(selectedRoom.id, {
      available: newStatus,
      status: newStatus ? 'available' : 'sold_out'
    });
    showToast(`✅ Availability updated: ${selectedRoom.name} is now ${newStatus ? 'AVAILABLE' : 'SOLD OUT'}!`);
  };

  // 4. Remove a Room Image (Instant & Real-Time)
  const handleRemoveImage = (index) => {
    if (!selectedRoom) return;
    if (selectedRoom.images && selectedRoom.images.length <= 1) {
      showToast('⚠️ At least one photo must remain in the room gallery.');
      return;
    }
    removeRoomImage(selectedRoom.id, index);
    showToast(`🗑️ Photo removed from ${selectedRoom.name}! Live website synchronized.`);
  };

  // Replace a specific Room Image in-place
  const handleReplaceRoomImage = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;
    try {
      showToast('⚡ Updating photo with high-speed CDN...');
      const optimizedLocalUrl = await optimizeImageFile(file, 1200, 800, 0.78);
      replaceRoomImage(selectedRoom.id, index, optimizedLocalUrl);
      showToast(`✅ Photo #${index + 1} updated in real-time!`);
      e.target.value = '';

      uploadImageToPublicCDN(file)
        .then(cdnUrl => {
          if (cdnUrl && cdnUrl !== optimizedLocalUrl) {
            replaceRoomImage(selectedRoom.id, index, cdnUrl);
          }
        })
        .catch(err => console.warn('Public CDN sync notice (local copy active):', err));
    } catch (err) {
      console.error(err);
      showToast('❌ ' + (err.message || 'Failed to replace photo.'));
    }
  };

  // 5. Update Dining Hall or Reception Space Details
  const handleUpdateSpaceDetails = (e) => {
    e?.preventDefault();
    if (!selectedSpace) return;
    const parsedFeatures = spaceFeaturesDraft
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    updatePropertySpace(selectedSpace.id, {
      name: spaceTitleDraft.trim() || selectedSpace.name,
      subtitle: spaceSubtitleDraft.trim(),
      timings: spaceTimingsDraft.trim(),
      description: spaceDescDraft.trim(),
      features: parsedFeatures
    });

    setSpaceSaved(true);
    setTimeout(() => setSpaceSaved(false), 2500);
    showToast(`✅ Successfully updated ${selectedSpace.name} details! Live website synchronized.`);
  };

  // 6. Remove a Space Image (Dining Hall / Reception)
  const handleRemoveSpaceImage = (index) => {
    if (!selectedSpace) return;
    if (selectedSpace.images && selectedSpace.images.length <= 1) {
      showToast(`⚠️ At least one photo must remain in ${selectedSpace.name}.`);
      return;
    }
    removeSpaceImage(selectedSpace.id, index);
    showToast(`🗑️ Photo removed from ${selectedSpace.name} gallery!`);
  };

  // Replace a specific Space Image in-place
  const handleReplaceSpaceImage = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSpace) return;
    try {
      showToast('⚡ Updating photo with high-speed CDN...');
      const optimizedLocalUrl = await optimizeImageFile(file, 1200, 800, 0.78);
      replaceSpaceImage(selectedSpace.id, index, optimizedLocalUrl);
      showToast(`✅ Photo #${index + 1} updated for ${selectedSpace.name}!`);
      e.target.value = '';

      uploadImageToPublicCDN(file)
        .then(cdnUrl => {
          if (cdnUrl && cdnUrl !== optimizedLocalUrl) {
            replaceSpaceImage(selectedSpace.id, index, cdnUrl);
          }
        })
        .catch(err => console.warn('Public CDN sync notice (local copy active):', err));
    } catch (err) {
      console.error(err);
      showToast('❌ ' + (err.message || 'Failed to replace photo.'));
    }
  };

  // 7. Update a Hero Slide
  const handleUpdateHeroSlide = (idx, updates) => {
    updateHeroSlide(idx, updates);
    const updated = heroSlides.map((slide, i) => (i === idx ? { ...slide, ...updates } : slide));
    if (publishHeroSlides) publishHeroSlides(updated);
    showToast(`✅ Hero slide #${idx + 1} updated and synced live!`);
  };

  // 8. Remove a Hero Slide
  const handleRemoveHeroSlide = (idx) => {
    if (heroSlides.length <= 1) {
      alert('At least one hero slide must remain active in the slideshow.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove Hero Slide #${idx + 1}?`)) {
      const updated = heroSlides.filter((_, i) => i !== idx);
      removeHeroSlide(idx);
      if (publishHeroSlides) publishHeroSlides(updated);
      showToast(`🗑️ Hero slide #${idx + 1} removed and synced!`);
    }
  };

  const handleReorderHeroSlide = (idx, direction) => {
    reorderHeroSlide(idx, direction);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= heroSlides.length) return;
    const copy = [...heroSlides];
    const temp = copy[idx];
    copy[idx] = copy[newIdx];
    copy[newIdx] = temp;
    if (publishHeroSlides) publishHeroSlides(copy);
  };

  const [isPublishingHero, setIsPublishingHero] = useState(false);
  const [showHeroPreview, setShowHeroPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [fullScreenPreview, setFullScreenPreview] = useState(null); // { url, title, subtitle, images, currentIndex }
  const touchStartXRef = useRef(null);

  useEffect(() => {
    if (!showHeroPreview || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewSlideIdx(prev => (prev + 1) % heroSlides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [showHeroPreview, heroSlides.length]);

  // Keyboard navigation for full-screen preview lightbox (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!fullScreenPreview) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFullScreenPreview(null);
      } else if (e.key === 'ArrowLeft') {
        setFullScreenPreview(prev => {
          if (!prev || !prev.images || prev.images.length <= 1) return prev;
          const nextIdx = (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
          return { ...prev, currentIndex: nextIdx };
        });
      } else if (e.key === 'ArrowRight') {
        setFullScreenPreview(prev => {
          if (!prev || !prev.images || prev.images.length <= 1) return prev;
          const nextIdx = (prev.currentIndex + 1) % prev.images.length;
          return { ...prev, currentIndex: nextIdx };
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenPreview]);

  const handlePublishAllSlides = async () => {
    setIsPublishingHero(true);
    if (publishHeroSlides) await publishHeroSlides();
    setTimeout(() => setIsPublishingHero(false), 600);
    showToast('🚀 Hero Slides published & synced live to all admin panels & mobile devices!');
  };

  // -------------------------------------------------------------
  // High-Performance Device Image Optimization & Upload Handlers
  // -------------------------------------------------------------
  const optimizeImageFile = (file, maxWidth = 1200, maxHeight = 800, quality = 0.78) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected.'));
        return;
      }
      const isImage = (file.type && file.type.startsWith('image/')) ||
                      (file.name && /\.(jpe?g|png|webp|avif|gif|bmp|heic|jfif)$/i.test(file.name));
      if (!isImage) {
        reject(new Error('Please select a valid image file (JPG, PNG, WebP).'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image from device.'));
      reader.onload = (readerEvent) => {
        const rawResult = readerEvent.target?.result;
        const img = new Image();
        img.onerror = () => {
          // Fallback to raw data URL if image rendering fails
          resolve(rawResult);
        };
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawResult);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export to high-definition ~45KB data URL
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(optimizedDataUrl);
          } catch (canvasErr) {
            console.warn('Canvas optimization fallback', canvasErr);
            resolve(rawResult);
          }
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRoomFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;

    setIsUploadingRoom(true);
    setRoomUploadError('');
    try {
      showToast('⚡ Uploading photo to high-speed CDN...');
      const optimizedLocalUrl = await optimizeImageFile(file, 1200, 800, 0.78);

      // 1. Real-time optimistic update: immediately display in gallery
      addRoomImage(selectedRoom.id, optimizedLocalUrl);
      showToast(`📸 Photo added to ${selectedRoom.name}! Synchronized live.`);
      e.target.value = '';

      // 2. Upload to public CDN (ImgBB / FreeImage) for permanent public URL across devices
      uploadImageToPublicCDN(file)
        .then(cdnUrl => {
          if (cdnUrl && cdnUrl !== optimizedLocalUrl) {
            replaceRoomImage(selectedRoom.id, (selectedRoom.images?.length || 1), cdnUrl);
          }
        })
        .catch(cdnErr => {
          console.warn('Public CDN sync notice (local high-def copy active):', cdnErr);
        });
    } catch (err) {
      console.error('Room photo upload error:', err);
      setRoomUploadError(err.message || 'Failed to upload photo.');
      showToast('❌ ' + (err.message || 'Upload failed.'));
    } finally {
      setIsUploadingRoom(false);
    }
  };

  const handleAddRoomImageByUrl = (e) => {
    e.preventDefault();
    if (!newRoomImageUrl.trim() || !selectedRoom) return;
    addRoomImage(selectedRoom.id, newRoomImageUrl.trim());
    setNewRoomImageUrl('');
    showToast('✅ Image URL added to room gallery!');
  };

  const handleSpaceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSpace) return;

    setIsUploadingSpace(true);
    setSpaceUploadError('');
    try {
      showToast(`⚡ Uploading photo for ${selectedSpace.name} to high-speed CDN...`);
      const optimizedLocalUrl = await optimizeImageFile(file, 1200, 800, 0.78);

      // Real-time optimistic update
      addSpaceImage(selectedSpace.id, optimizedLocalUrl);
      showToast(`📸 Photo added to ${selectedSpace.name}! Synchronized live.`);
      e.target.value = '';

      uploadImageToPublicCDN(file)
        .then(cdnUrl => {
          if (cdnUrl && cdnUrl !== optimizedLocalUrl) {
            replaceSpaceImage(selectedSpace.id, (selectedSpace.images?.length || 1), cdnUrl);
          }
        })
        .catch(cdnErr => {
          console.warn('Public CDN sync notice (local high-def copy active):', cdnErr);
        });
    } catch (err) {
      console.error('Space upload error:', err);
      setSpaceUploadError(err.message || 'Failed to upload space photo.');
      showToast('❌ ' + (err.message || 'Upload failed.'));
    } finally {
      setIsUploadingSpace(false);
    }
  };

  const handleAddSpaceImageByUrl = (e) => {
    e.preventDefault();
    if (!newSpaceImageUrl.trim() || !selectedSpace) return;
    addSpaceImage(selectedSpace.id, newSpaceImageUrl.trim());
    setNewSpaceImageUrl('');
    showToast(`✅ Photo added to ${selectedSpace.name}!`);
  };

  const handleSelectPresetPhoto = (presetUrl) => {
    if (presetTargetType === 'space' && selectedSpace) {
      addSpaceImage(selectedSpace.id, presetUrl);
      showToast(`📸 Resort photo added to ${selectedSpace.name}! Synchronized across website.`);
    } else if (selectedRoom) {
      addRoomImage(selectedRoom.id, presetUrl);
      showToast(`📸 Resort photo added to ${selectedRoom.name}! Synchronized across website.`);
    }
    setShowPresetModal(false);
  };

  const handleHeroFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    setHeroUploadError('');
    try {
      let finalUrl;
      if (isFirebaseConfigured()) {
        showToast('☁️ Uploading Hero Slide to Firebase Cloud Storage...');
        finalUrl = await uploadResortImageToStorage(file, 'hero');
      } else {
        finalUrl = await optimizeImageFile(file, 1920, 1080, 0.88);
      }
      const cleanCaption = newHeroCaption.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Peace at Peak Resort';
      const newSlide = {
        url: finalUrl,
        caption: cleanCaption,
        position: newHeroPosition || 'center center'
      };
      addHeroSlide(newSlide);
      if (publishHeroSlides) publishHeroSlides([...heroSlides, newSlide]);
      setNewHeroCaption('');
      showToast('🚀 Hero slide uploaded & published live across all devices!');
      e.target.value = '';
    } catch (err) {
      console.error('Hero upload error', err);
      setHeroUploadError(err.message || 'Failed to upload photo.');
      showToast('❌ ' + (err.message || 'Upload failed.'));
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleAddHeroByUrl = (e) => {
    e.preventDefault();
    if (!newHeroUrl.trim()) return;
    const newSlide = {
      url: newHeroUrl.trim(),
      caption: newHeroCaption.trim() || 'Peace at Peak Resort',
      position: newHeroPosition || 'center center'
    };
    addHeroSlide(newSlide);
    if (publishHeroSlides) publishHeroSlides([...heroSlides, newSlide]);
    setNewHeroUrl('');
    setNewHeroCaption('');
    showToast('✅ New Hero slide added and published live across all panels & devices!');
  };

  // -------------------------------------------------------------
  // Manual Reservation Handler
  // -------------------------------------------------------------
  const handleCreateManualBooking = (e) => {
    e.preventDefault();
    if (!manualBookingForm.guestName.trim() || !manualBookingForm.phone.trim()) {
      alert('Please provide at least a guest name and phone number.');
      return;
    }
    const targetRoom = rooms.find(r => r.id === manualBookingForm.roomId) || rooms[0];
    const d1 = new Date(manualBookingForm.checkIn);
    const d2 = new Date(manualBookingForm.checkOut);
    const diffNights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));

    addBooking({
      guestName: manualBookingForm.guestName.trim(),
      email: manualBookingForm.email.trim() || 'walkin@guest.com',
      phone: manualBookingForm.phone.trim(),
      roomId: targetRoom.id,
      roomName: targetRoom.name,
      checkIn: manualBookingForm.checkIn,
      checkOut: manualBookingForm.checkOut,
      nights: diffNights,
      amount: Number(manualBookingForm.amount) || (getEffectivePrice(targetRoom) * diffNights),
      status: manualBookingForm.status
    });

    setShowNewBookingModal(false);
    showToast('✅ Reservation created and recorded in live database!');
  };

  // -------------------------------------------------------------
  // Dynamic Real-Data Room Status & Multi-Unit Inventory Calculation
  // -------------------------------------------------------------
  const getRoomLiveStatus = (roomId) => {
    const inv = getRoomInventory ? getRoomInventory(roomId) : {
      totalUnits: 6,
      occupiedUnits: 0,
      availableUnits: 6,
      isAvailable: true,
      status: 'available',
      activeBookings: []
    };
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return {
        status: 'available',
        totalUnits: inv.totalUnits,
        occupiedUnits: inv.occupiedUnits,
        availableUnits: inv.availableUnits,
        activeBookings: inv.activeBookings,
        currentGuest: null
      };
    }

    // Explicit manual toggle to unavailable
    if (room.available === false) {
      return {
        status: 'sold_out',
        totalUnits: inv.totalUnits,
        occupiedUnits: inv.occupiedUnits,
        availableUnits: 0,
        activeBookings: inv.activeBookings,
        currentGuest: inv.activeBookings[0] ? {
          name: inv.activeBookings[0].guestName,
          phone: inv.activeBookings[0].phone,
          email: inv.activeBookings[0].email,
          checkIn: inv.activeBookings[0].checkIn,
          checkOut: inv.activeBookings[0].checkOut
        } : null
      };
    }

    return {
      status: inv.status, // 'available' | 'partially_booked' | 'sold_out'
      totalUnits: inv.totalUnits,
      occupiedUnits: inv.occupiedUnits,
      availableUnits: inv.availableUnits,
      activeBookings: inv.activeBookings,
      currentGuest: inv.activeBookings[0] ? {
        name: inv.activeBookings[0].guestName,
        phone: inv.activeBookings[0].phone,
        email: inv.activeBookings[0].email,
        checkIn: inv.activeBookings[0].checkIn,
        checkOut: inv.activeBookings[0].checkOut
      } : (room.currentGuest || null)
    };
  };

  // Real multi-unit inventory counts across the entire property
  const activeRoomsCount = rooms.reduce((acc, r) => acc + (Number(r.totalUnits) || (r.id === 'family_tent' ? 4 : 6)), 0);
  const reservedRoomsCount = rooms.reduce((acc, r) => acc + (getRoomLiveStatus(r.id).occupiedUnits || 0), 0);
  const availableRoomsCount = Math.max(0, activeRoomsCount - reservedRoomsCount);
  const soldOutRoomsCount = rooms.filter(r => r.available === false || getRoomLiveStatus(r.id).availableUnits === 0).length;

  // -------------------------------------------------------------
  // Real Dynamic Earnings & Analytics Calculation (No Placeholders)
  // -------------------------------------------------------------
  const analyticsData = useMemo(() => {
    const now = new Date();
    let maxDays = 7;
    let label = 'Last 7 Days';
    let chartBuckets = [];

    if (timeframe === '7days') {
      maxDays = 7;
      label = 'Last 7 Days';
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
        chartBuckets.push({
          label: dayLabel,
          daysAgo: i
        });
      }
    } else if (timeframe === '28days') {
      maxDays = 28;
      label = 'Last 28 Days';
      chartBuckets = [
        { label: 'Week 1', minDaysAgo: 0, maxDaysAgo: 6 },
        { label: 'Week 2', minDaysAgo: 7, maxDaysAgo: 13 },
        { label: 'Week 3', minDaysAgo: 14, maxDaysAgo: 20 },
        { label: 'Week 4', minDaysAgo: 21, maxDaysAgo: 27 }
      ];
    } else if (timeframe === '3months') {
      maxDays = 90;
      label = 'Last 3 Months';
      chartBuckets = [
        { label: 'Month 1', minDaysAgo: 0, maxDaysAgo: 29 },
        { label: 'Month 2', minDaysAgo: 30, maxDaysAgo: 59 },
        { label: 'Month 3', minDaysAgo: 60, maxDaysAgo: 89 }
      ];
    } else if (timeframe === '6months') {
      maxDays = 180;
      label = 'Last 6 Months';
      for (let m = 0; m < 6; m++) {
        chartBuckets.push({
          label: m === 0 ? 'Current' : `M -${m}`,
          minDaysAgo: m * 30,
          maxDaysAgo: (m + 1) * 30 - 1
        });
      }
    }

    // Filter real bookings in selected timeframe
    const filteredBookings = bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const bDate = b.checkIn ? new Date(b.checkIn) : new Date();
      const diffDays = Math.floor((now - bDate) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= maxDays;
    });

    const totalEarnings = filteredBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalNights = filteredBookings.reduce((sum, b) => sum + (Number(b.nights) || 1), 0);
    const bookingCount = filteredBookings.length;
    const adr = totalNights > 0 ? Math.round(totalEarnings / totalNights) : 0;
    const totalCapacity = rooms.length * maxDays;
    const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((totalNights / totalCapacity) * 100)) : 0;

    const bucketEarnings = chartBuckets.map(bucket => {
      let bucketTotal = 0;
      if (bucket.daysAgo !== undefined) {
        bucketTotal = filteredBookings
          .filter(b => {
            const bDate = b.checkIn ? new Date(b.checkIn) : new Date();
            const diffDays = Math.floor((now - bDate) / (1000 * 60 * 60 * 24));
            return diffDays === bucket.daysAgo;
          })
          .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      } else {
        bucketTotal = filteredBookings
          .filter(b => {
            const bDate = b.checkIn ? new Date(b.checkIn) : new Date();
            const diffDays = Math.floor((now - bDate) / (1000 * 60 * 60 * 24));
            return diffDays >= bucket.minDaysAgo && diffDays <= bucket.maxDaysAgo;
          })
          .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      }
      return {
        label: bucket.label,
        earnings: bucketTotal
      };
    });

    const maxBucketVal = Math.max(...bucketEarnings.map(b => b.earnings), 1000);

    return {
      label,
      totalEarnings,
      bookingCount,
      totalNights,
      adr,
      occupancyRate,
      prevPeriodComparison: `${bookingCount} verified reservation${bookingCount === 1 ? '' : 's'}`,
      bucketEarnings,
      maxBucketVal,
      filteredBookings
    };
  }, [timeframe, bookings, rooms.length]);

  const filteredPresets = useMemo(() => {
    if (presetCategory === 'All') return RESORT_PHOTO_PRESETS;
    return RESORT_PHOTO_PRESETS.filter(p => p.category === presetCategory);
  }, [presetCategory]);

  return (
    <div className="min-h-screen pms-theme flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl bg-slate-900 text-white font-semibold shadow-2xl flex items-center gap-2.5 text-xs uppercase tracking-wider border border-slate-700 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Mobile Bar (Mobile First) */}
      <header className="lg:hidden pms-mobile-header">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
            aria-label="Open Navigation Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-xs sm:text-sm leading-none block truncate" style={{ fontFamily: 'var(--font-display)' }}>
                Peace at Peak
              </span>
              <span className="text-[0.6rem] text-emerald-600 font-bold block leading-tight mt-0.5">
                ● Live PMS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewBookingModal(true)}
            className="p-1.5 px-2 sm:px-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[0.72rem] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
            title="Add Manual Reservation"
          >
            <Plus size={14} /> <span>Book</span>
          </button>
          <button
            type="button"
            onClick={onBackToSite}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all"
            title="Preview Live Site"
          >
            <ExternalLink size={15} />
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95 transition-all"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Main Split Layout: Sidebar + Canvas */}
      <div className="flex-grow flex lg:flex-row relative w-full min-w-0">
        
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="pms-mobile-backdrop lg:hidden"
            aria-label="Close navigation overlay"
          />
        )}

        {/* =========================================================================
            EXECUTIVE SIDEBAR NAVIGATION
           ========================================================================= */}
        <aside className={`pms-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
          <div className="p-5 flex flex-col h-full justify-between overflow-y-auto">
            
            {/* Top Brand Info */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Peace at Peak
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-[0.68rem] text-slate-500 font-semibold uppercase tracking-wider">
                        {isFirebaseActive ? 'Firebase Cloud Active' : 'Local Mode (Firebase Ready)'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveNav('overview'); setIsMobileSidebarOpen(false); }}
                  className={`pms-sidebar-link ${activeNav === 'overview' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={17} className="shrink-0" />
                  <span className="truncate">Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => { 
                    setSelectedTarget(rooms[0]?.id || 'private_cottage');
                    setActiveNav('config'); 
                    setIsMobileSidebarOpen(false); 
                  }}
                  className={`pms-sidebar-link ${activeNav === 'config' && isTargetRoom ? 'active' : ''}`}
                >
                  <Sliders size={17} className="shrink-0" />
                  <span className="truncate">Rooms & Rates</span>
                  <span className="ml-auto shrink-0 text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {availableRoomsCount}/{activeRoomsCount}
                  </span>
                </button>

                {/* Direct Sidebar Link to Dining Hall & Reception Lounge */}
                <button
                  type="button"
                  onClick={() => { 
                    setSelectedTarget('dining_hall');
                    setActiveNav('config'); 
                    setIsMobileSidebarOpen(false); 
                  }}
                  className={`pms-sidebar-link ${activeNav === 'config' && isTargetSpace ? 'active' : ''}`}
                >
                  <Utensils size={17} className="shrink-0" />
                  <span className="truncate">Dining & Lounge</span>
                  <span className="ml-auto shrink-0 text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {(propertySpaces || []).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveNav('hero'); setIsMobileSidebarOpen(false); }}
                  className={`pms-sidebar-link ${activeNav === 'hero' ? 'active' : ''}`}
                >
                  <ImageIcon size={17} className="shrink-0" />
                  <span className="truncate">Hero Slideshow</span>
                  <span className="ml-auto shrink-0 text-[0.65rem] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                    {heroSlides.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveNav('bookings'); setIsMobileSidebarOpen(false); }}
                  className={`pms-sidebar-link ${activeNav === 'bookings' ? 'active' : ''}`}
                >
                  <Calendar size={17} className="shrink-0" />
                  <span className="truncate">Reservations</span>
                  <span className={`ml-auto shrink-0 text-[0.65rem] px-2 py-0.5 rounded-full font-bold ${
                    bookings.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bookings.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveNav('settings'); setIsMobileSidebarOpen(false); }}
                  className={`pms-sidebar-link ${activeNav === 'settings' ? 'active' : ''}`}
                >
                  <RefreshCw size={17} className="shrink-0" />
                  <span className="truncate">Diagnostics</span>
                </button>
              </nav>
            </div>

            {/* Bottom Actions & Role Card */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(adminAuth?.user || 'AD').substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-slate-800 truncate capitalize">
                      {adminAuth?.user || 'Administrator'}
                    </p>
                    <p className="text-[0.65rem] text-emerald-600 font-semibold truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live Database Connected
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToSite}
                className="w-full pms-btn pms-btn-secondary text-xs uppercase tracking-wider py-2.5"
              >
                <ExternalLink size={14} />
                <span>Preview Live Site</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full pms-btn pms-btn-danger-soft text-xs uppercase tracking-wider py-2.5"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN VIEWPORT CANVAS
           ========================================================================= */}
        <main className="pms-main-canvas space-y-6">

          {/* =======================================================================
              VIEW 1: MAIN OVERVIEW (EARNINGS + ROOM STATUS BREAKDOWN)
             ======================================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-6 animate-fade">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 sm:pb-4">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Executive Property Dashboard
                  </h1>
                  <p className="text-[0.72rem] sm:text-xs text-slate-500 mt-0.5">
                    Live revenue analytics, occupancy metrics, and room status overview.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedTarget(rooms[0]?.id); setActiveNav('config'); }}
                    className="pms-btn pms-btn-primary text-xs uppercase tracking-wider py-2.5 px-3.5 shadow-sm"
                  >
                    <Sliders size={14} className="shrink-0" /> <span>Rooms & Rates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedTarget('dining_hall'); setActiveNav('config'); }}
                    className="pms-btn pms-btn-secondary text-xs uppercase tracking-wider py-2.5 px-3.5 shadow-sm"
                  >
                    <Utensils size={14} className="shrink-0" /> <span>Dining & Lounge</span>
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------------------
                  CARD 1: TOTAL EARNINGS WITH 7D / 28D / 3M / 6M FILTER
                 ------------------------------------------------------------------- */}
              <div className="pms-card p-3.5 sm:p-6 space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="pms-label text-slate-500 mb-0 text-[0.68rem] sm:text-xs">
                        <DollarSign size={14} className="text-amber-600" /> TOTAL PROPERTY EARNINGS
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] sm:text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 truncate">
                        {analyticsData.prevPeriodComparison}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        ₹{analyticsData.totalEarnings.toLocaleString()}
                      </span>
                      <span className="text-[0.7rem] sm:text-xs text-slate-500 font-medium">
                        gross ({analyticsData.label})
                      </span>
                    </div>
                  </div>

                  {/* Timeframe Filter Ribbon - Mobile swipeable */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-1 px-1 sm:mx-0">
                    <button
                      type="button"
                      onClick={() => setTimeframe('7days')}
                      className={`pms-time-filter shrink-0 ${timeframe === '7days' ? 'active' : ''}`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeframe('28days')}
                      className={`pms-time-filter shrink-0 ${timeframe === '28days' ? 'active' : ''}`}
                    >
                      Last 28 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeframe('3months')}
                      className={`pms-time-filter shrink-0 ${timeframe === '3months' ? 'active' : ''}`}
                    >
                      Last 3 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeframe('6months')}
                      className={`pms-time-filter shrink-0 ${timeframe === '6months' ? 'active' : ''}`}
                    >
                      Last 6 Months
                    </button>
                  </div>
                </div>

                {/* KPI Sub-Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider font-bold text-slate-500 block truncate">
                      Total Bookings
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
                      {analyticsData.bookingCount} <span className="text-xs font-normal text-slate-500 hidden sm:inline">reservations</span>
                    </p>
                    <p className="text-[0.62rem] sm:text-[0.68rem] text-slate-500 mt-0.5 truncate">{analyticsData.label}</p>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider font-bold text-slate-500 block truncate">
                      Nights Sold
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
                      {analyticsData.totalNights} <span className="text-xs font-normal text-slate-500 hidden sm:inline">nights</span>
                    </p>
                    <p className="text-[0.62rem] sm:text-[0.68rem] text-slate-500 mt-0.5 truncate">Verified guest stays</p>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider font-bold text-slate-500 block truncate">
                      Avg Rate (ADR)
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-amber-700 mt-0.5 sm:mt-1">
                      ₹{analyticsData.adr.toLocaleString()}
                    </p>
                    <p className="text-[0.62rem] sm:text-[0.68rem] text-slate-500 mt-0.5 truncate">Per occupied night</p>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider font-bold text-slate-500 block truncate">
                      Occupancy
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-700 mt-0.5 sm:mt-1">
                      {analyticsData.occupancyRate}%
                    </p>
                    <p className="text-[0.62rem] sm:text-[0.68rem] text-slate-500 mt-0.5 truncate">High mountain demand</p>
                  </div>
                </div>

                {/* Revenue Breakdown Bar Chart */}
                <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] sm:text-xs uppercase font-bold tracking-wider text-slate-700">
                      Revenue Distribution ({analyticsData.label})
                    </span>
                    <span className="text-[0.65rem] sm:text-[0.7rem] text-slate-500">
                      Peak scaled
                    </span>
                  </div>

                  <div className="h-36 sm:h-48 pt-6 pb-2 px-1.5 sm:px-2 rounded-xl bg-slate-50 border border-slate-200 flex items-end justify-between gap-1.5 sm:gap-4">
                    {analyticsData.bucketEarnings.map((bucket, idx) => {
                      const heightPercent = Math.max(8, Math.round((bucket.earnings / analyticsData.maxBucketVal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                          <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-slate-700 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mb-0.5 whitespace-nowrap">
                            ₹{bucket.earnings > 999 ? `${Math.round(bucket.earnings / 1000)}k` : bucket.earnings}
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="pms-chart-bar"
                            title={`${bucket.label}: ₹${bucket.earnings.toLocaleString()}`}
                          />
                          <span className="text-[0.6rem] sm:text-[0.65rem] font-medium text-slate-500 mt-1 sm:mt-2 truncate max-w-full text-center">
                            {bucket.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------------
                  CARD 2: ROOM STATUS BREAKDOWN (ACTIVE / AVAILABLE / RESERVED)
                 ------------------------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                      Accommodations Status Breakdown
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time inventory health across active, available, and reserved cottages & glamping tents.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('config')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    Manage Inventory <ChevronRight size={14} />
                  </button>
                </div>

                {/* 3 Status KPI Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="pms-card p-4 sm:p-5 border-l-4 border-l-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                        Active Rooms
                      </span>
                      <BedDouble size={20} className="text-slate-700" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{activeRoomsCount}</p>
                    <p className="text-[0.7rem] text-slate-500 mt-0.5">
                      Total operational units configured
                    </p>
                  </div>

                  <div className="pms-card p-4 sm:p-5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                        Available Rooms
                      </span>
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-2">{availableRoomsCount}</p>
                    <p className="text-[0.7rem] text-slate-500 mt-0.5">
                      Ready for instant guest reservation
                    </p>
                  </div>

                  <div className="pms-card p-4 sm:p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                        Reserved / Occupied
                      </span>
                      <UserCheck size={20} className="text-amber-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-amber-700 mt-2">{reservedRoomsCount}</p>
                    <p className="text-[0.7rem] text-slate-500 mt-0.5">
                      Guests currently in-house or arriving
                    </p>
                  </div>
                </div>

                {/* Individual Room Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rooms.map((room) => {
                    const effPrice = getEffectivePrice(room);
                    const liveInfo = getRoomLiveStatus(room.id);
                    const isAllAvailable = liveInfo.availableUnits === liveInfo.totalUnits && room.available !== false;
                    const isPartiallyBooked = liveInfo.availableUnits > 0 && liveInfo.occupiedUnits > 0 && room.available !== false;
                    const isSoldOut = liveInfo.availableUnits === 0 || room.available === false;

                    return (
                      <div
                        key={room.id}
                        className="pms-card p-4 space-y-3 relative overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Full-Size Unzoomed Image Preview Stage (No Zoom, 100% Complete Aspect) */}
                          <div 
                            onClick={() => {
                              const imgs = room.images && room.images.length > 0 ? room.images : [room.image];
                              setFullScreenPreview({
                                images: imgs,
                                currentIndex: 0,
                                title: room.name,
                                subtitle: `₹${effPrice.toLocaleString()} / night • ${liveInfo.totalUnits} Units Total`
                              });
                            }}
                            className="pms-img-preview-stage mb-3"
                            title="Click to view 100% full-size uncropped image"
                          >
                            <img
                              src={room.image || room.images?.[0]}
                              alt={room.name}
                            />
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[0.62rem] text-white backdrop-blur-sm pointer-events-none font-medium flex items-center gap-1">
                              <Eye size={10} className="text-amber-400" /> Full Preview
                            </span>
                          </div>

                          {/* Room Name, Pricing & Badges */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-grow">
                              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-900 truncate">
                                {room.name}
                              </h3>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-amber-700 font-bold text-sm">
                                  ₹{effPrice.toLocaleString()}
                                </span>
                                {room.discount > 0 && (
                                  <span className="text-[0.65rem] text-slate-400 line-through">
                                    ₹{room.price?.toLocaleString()}
                                  </span>
                                )}
                                <span className="text-[0.65rem] text-slate-500">/ night</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {room.tag && (
                                <span className={`room-feature-tag tag-${room.tagColor || 'gold'}`} style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem' }}>
                                  ★ {room.tag}
                                </span>
                              )}
                              {room.offer && (
                                <span className="room-offer-badge" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                                  ⚡ {room.offer}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Multi-unit Capacity & Status Pill */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-500">
                              Inventory Status:
                            </span>

                            {isAllAvailable && (
                              <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold pms-badge-available">
                                ● All {liveInfo.totalUnits} Units Available
                              </span>
                            )}
                            {isPartiallyBooked && (
                              <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold pms-badge-gold">
                                ● {liveInfo.availableUnits} of {liveInfo.totalUnits} Available
                              </span>
                            )}
                            {isSoldOut && (
                              <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold pms-badge-soldout">
                                ● Sold Out (0 of {liveInfo.totalUnits})
                              </span>
                            )}
                          </div>

                          {/* Real multi-unit capacity bar */}
                          <div className="mt-2.5 space-y-1">
                            <div className="flex items-center justify-between text-[0.65rem] font-semibold text-slate-600">
                              <span>Capacity: {room.unitLabel || 'Cottages'}</span>
                              <span className="text-slate-900 font-bold">
                                {liveInfo.availableUnits} available / {liveInfo.totalUnits} total
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                              {liveInfo.occupiedUnits > 0 && (
                                <div 
                                  style={{ width: `${Math.round((liveInfo.occupiedUnits / liveInfo.totalUnits) * 100)}%` }}
                                  className="bg-amber-500 transition-all duration-300"
                                  title={`${liveInfo.occupiedUnits} Reserved / In-House`}
                                />
                              )}
                              <div 
                                style={{ width: `${Math.round((liveInfo.availableUnits / liveInfo.totalUnits) * 100)}%` }}
                                className="bg-emerald-500 transition-all duration-300"
                                title={`${liveInfo.availableUnits} Available for reservation`}
                              />
                            </div>
                          </div>

                          {/* Active reservation list for this category */}
                          {liveInfo.activeBookings && liveInfo.activeBookings.length > 0 && (
                            <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                              <p className="text-[0.68rem] text-amber-900 font-bold flex items-center justify-between">
                                <span>👤 In-House ({liveInfo.activeBookings.length} {liveInfo.activeBookings.length === 1 ? 'Unit' : 'Units'} Booked):</span>
                              </p>
                              {liveInfo.activeBookings.slice(0, 2).map((bk, bIdx) => (
                                <div key={bk.id || bIdx} className="text-[0.65rem] text-amber-800 bg-amber-100/70 p-1 rounded flex items-center justify-between">
                                  <span className="font-semibold truncate max-w-[120px]">{bk.guestName}</span>
                                  <span className="text-[0.6rem] text-amber-700">{bk.checkIn} → {bk.checkOut}</span>
                                </div>
                              ))}
                              {liveInfo.activeBookings.length > 2 && (
                                <p className="text-[0.6rem] text-amber-700 italic">
                                  +{liveInfo.activeBookings.length - 2} more active reservation(s)
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick Update Button from Overview */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTarget(room.id);
                              setActiveNav('config');
                            }}
                            className="flex-grow pms-btn pms-btn-secondary text-[0.75rem] uppercase tracking-wider py-2.5"
                          >
                            <Sliders size={13} /> Edit & Update Room
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* -------------------------------------------------------------------
                  CARD 3: RECENT GUEST RESERVATIONS TABLE
                 ------------------------------------------------------------------- */}
              <div className="pms-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Recent Reservations
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveNav('bookings')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800"
                  >
                    View All {bookings.length} Bookings →
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No Reservations Recorded Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Reservations made through the guest website booking form or entered manually will appear here in real time.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setActiveNav('bookings'); setShowNewBookingModal(true); }}
                      className="mt-3 pms-btn pms-btn-primary text-xs uppercase tracking-wider py-2.5 px-4 shadow-sm"
                    >
                      + Add Manual Reservation
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile-Friendly Reservation Cards (< 768px) */}
                    <div className="md:hidden space-y-2.5">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-800">
                              {booking.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase ${
                              booking.status === 'active' || booking.status === 'confirmed' ? 'pms-badge-available' : 'pms-badge-slate'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{booking.guestName}</p>
                              {booking.phone && (
                                <a href={`tel:${booking.phone}`} className="text-[0.72rem] text-amber-700 font-semibold hover:underline block mt-0.5">
                                  📞 {booking.phone}
                                </a>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 text-sm">
                                ₹{Number(booking.amount || 0).toLocaleString()}
                              </span>
                              <p className="text-[0.68rem] text-slate-400">{booking.nights}n stay</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[0.72rem] text-slate-600">
                            <span className="font-medium text-amber-800">{booking.roomName}</span>
                            <span>{booking.checkIn} → {booking.checkOut}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop / Tablet Table (>= 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[0.68rem] uppercase font-bold text-slate-500 tracking-wider">
                            <th className="py-2.5 px-3">Booking ID</th>
                            <th className="py-2.5 px-3">Guest Name</th>
                            <th className="py-2.5 px-3">Room</th>
                            <th className="py-2.5 px-3">Stay Dates</th>
                            <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {bookings.slice(0, 5).map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                                {booking.id}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {booking.guestName}
                                <span className="block text-[0.68rem] text-slate-400 font-normal">{booking.phone}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {booking.roomName}
                              </td>
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                {booking.checkIn} → {booking.checkOut} ({booking.nights}n)
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-slate-900">
                                ₹{Number(booking.amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase ${
                                  booking.status === 'active' || booking.status === 'confirmed' ? 'pms-badge-available' : 'pms-badge-slate'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* =======================================================================
              VIEW 2: PROPERTY CONFIGURATIONS (ROOMS, DINING HALL, RECEPTION, HERO)
             ======================================================================= */}
          {activeNav === 'config' && (
            <div className="space-y-6 animate-fade">
              
              {/* Header */}
              <div className="border-b border-slate-200 pb-3 sm:pb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Property Configurations
                </h1>
                <p className="text-[0.72rem] sm:text-xs text-slate-500 mt-0.5">
                  Select a room, the Main Dining Hall, or the Reception Lounge below to update information, remove images, or upload new photos.
                </p>
              </div>

              {/* Target Selector Navigation Strip - Mobile Swipeable Ribbon */}
              <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-200/80 rounded-xl overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-1 px-1.5 sm:mx-0">
                {/* Rooms */}
                {rooms.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedTarget(r.id)}
                    className={`shrink-0 px-3 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                      selectedTarget === r.id
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <BedDouble size={15} className={selectedTarget === r.id ? 'text-amber-600' : 'text-slate-500'} />
                    <span>{r.name}</span>
                  </button>
                ))}

                {/* Dining Hall & Reception Lounge Targets */}
                {(propertySpaces || []).map(space => {
                  const isDining = space.id === 'dining_hall';
                  return (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => setSelectedTarget(space.id)}
                      className={`shrink-0 px-3 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                        selectedTarget === space.id
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-1 ring-amber-500/30'
                          : 'text-slate-700 hover:text-slate-900 bg-amber-50/50 hover:bg-white/70 border border-amber-200/60'
                      }`}
                    >
                      {isDining ? (
                        <Utensils size={15} className={selectedTarget === space.id ? 'text-amber-600' : 'text-amber-700'} />
                      ) : (
                        <Coffee size={15} className={selectedTarget === space.id ? 'text-amber-600' : 'text-amber-700'} />
                      )}
                      <span>{space.name}</span>
                    </button>
                  );
                })}

                {/* Hero Slideshow Target */}
                <button
                  type="button"
                  onClick={() => setSelectedTarget('hero')}
                  className={`shrink-0 px-3 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                    isTargetHero
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <ImageIcon size={15} className={isTargetHero ? 'text-amber-600' : 'text-slate-500'} />
                  <span>Hero Carousel</span>
                </button>
              </div>

              {/* ---------------------------------------------------------------
                  CASE A: ROOM SELECTED
                 --------------------------------------------------------------- */}
              {isTargetRoom && selectedRoom && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left 2 Cols: Availability, Price, Discount/Offer, and Photo Gallery */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Box 1: Availability & Pricing Form WITH EXPLICIT UPDATE BUTTON */}
                    <form onSubmit={handleUpdatePricing} className="pms-card p-3.5 sm:p-6 space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
                        <div>
                          <span className="text-[0.68rem] sm:text-[0.7rem] uppercase tracking-wider text-amber-700 font-bold">
                            Active Configuration Target
                          </span>
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            {selectedRoom.name}
                          </h2>
                        </div>

                        {/* Availability Toggle Switch */}
                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="text-[0.68rem] sm:text-[0.7rem] uppercase tracking-wider font-bold text-slate-500">
                            Availability Status:
                          </span>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleUpdateAvailability(!availabilityDraft)}
                              className={`w-full sm:w-auto pms-btn text-xs uppercase tracking-wider py-2.5 px-4 shadow-sm justify-center ${
                                availabilityDraft ? 'pms-btn-success' : 'pms-btn-danger'
                              }`}
                            >
                              {availabilityDraft ? (
                                <>
                                  <CheckCircle2 size={16} /> ROOM IS AVAILABLE
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} /> NOT AVAILABLE (SOLD OUT)
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price & Discount/Offer Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nightly Base Rate */}
                        <div className="space-y-1">
                          <label className="pms-label">
                            <DollarSign size={14} className="text-amber-600" /> Regular Nightly Price (INR ₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={priceDraft}
                              onChange={(e) => setPriceDraft(e.target.value)}
                              className="pms-input"
                              style={{ paddingLeft: '2rem' }}
                              required
                            />
                          </div>
                          <p className="text-[0.7rem] text-slate-500">
                            Base rate before promotional discounts.
                          </p>
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-1">
                          <label className="pms-label">
                            <Percent size={14} className="text-amber-600" /> Promotional Discount (%)
                          </label>
                          <div className="space-y-1.5">
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={discountDraft}
                              onChange={(e) => setDiscountDraft(e.target.value)}
                              className="pms-input"
                              placeholder="0"
                            />
                            {/* Preset Touch Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                              {[0, 10, 15, 20, 25].map(pct => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => setDiscountDraft(pct)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border shrink-0 transition-all ${
                                    Number(discountDraft) === pct
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[0.7rem] text-slate-500">
                            Instant percentage off applied on guest website.
                          </p>
                        </div>
                      </div>

                      {/* Multi-Unit Resort Capacity & Inventory Label Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="space-y-1">
                          <label className="pms-label text-slate-800 font-bold">
                            <Layers size={14} className="text-amber-600" /> Total Physical Units (Resort Capacity)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={totalUnitsDraft}
                            onChange={(e) => setTotalUnitsDraft(e.target.value)}
                            className="pms-input font-bold text-slate-900 bg-white"
                            required
                          />
                          <p className="text-[0.7rem] text-slate-500">
                            e.g. 6 Wooden Cottages. If 1 is reserved, 5 remain available for guests.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="pms-label text-slate-800 font-bold">
                            <BedDouble size={14} className="text-amber-600" /> Category Inventory Label
                          </label>
                          <input
                            type="text"
                            value={unitLabelDraft}
                            onChange={(e) => setUnitLabelDraft(e.target.value)}
                            placeholder="e.g. Wooden Cottages"
                            className="pms-input bg-white"
                          />
                          <p className="text-[0.7rem] text-slate-500">
                            Shown on guest website badges and booking forms.
                          </p>
                        </div>
                      </div>

                      {/* Offer Title & Promotional Tag */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="pms-label">
                            <Sparkles size={14} className="text-amber-600" /> Special Offer Title
                          </label>
                          <input
                            type="text"
                            value={offerDraft}
                            onChange={(e) => setOfferDraft(e.target.value)}
                            placeholder="e.g. 15% MONSOON GETAWAY DEAL"
                            className="pms-input"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="pms-label">
                            <Tag size={14} className="text-amber-600" /> Room Badge / Tag Text & Color
                          </label>
                          <input
                            type="text"
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            placeholder="e.g. MOST POPULAR, NATURE CAMP"
                            className="pms-input"
                          />

                          {/* Color Tag Selector & Live Badge Preview */}
                          <div className="pt-1 space-y-1.5">
                            <span className="text-[0.65rem] uppercase font-bold text-slate-500 block">
                              Select Visible Color Tag:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { id: 'gold', label: 'Gold', bg: 'linear-gradient(135deg, #d97706, #b45309)' },
                                { id: 'emerald', label: 'Emerald', bg: 'linear-gradient(135deg, #059669, #047857)' },
                                { id: 'amber', label: 'Amber', bg: 'linear-gradient(135deg, #ea580c, #c2410c)' },
                                { id: 'red', label: 'Ruby', bg: 'linear-gradient(135deg, #dc2626, #991b1b)' },
                                { id: 'blue', label: 'Sapphire', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
                                { id: 'purple', label: 'Purple', bg: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
                                { id: 'dark', label: 'Onyx', bg: '#0f172a' }
                              ].map(col => (
                                <button
                                  key={col.id}
                                  type="button"
                                  onClick={() => setTagColorDraft(col.id)}
                                  className={`px-2 py-0.5 rounded text-[0.65rem] font-bold text-white transition-all flex items-center gap-1 shadow-sm ${
                                    tagColorDraft === col.id ? 'ring-2 ring-offset-1 ring-slate-900 scale-105' : 'opacity-75 hover:opacity-100'
                                  }`}
                                  style={{ background: col.bg }}
                                >
                                  {tagColorDraft === col.id && <Check size={10} />}
                                  <span>{col.label}</span>
                                </button>
                              ))}
                            </div>

                            {tagDraft && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[0.65rem] text-slate-500">Live Tag Preview:</span>
                                <span className={`room-feature-tag tag-${tagColorDraft}`}>
                                  ★ {tagDraft}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live Price Calculator Summary Box */}
                      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <span className="text-[0.68rem] uppercase font-bold text-amber-800 tracking-wider">
                            Live Guest Price Preview
                          </span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold text-amber-900">
                              ₹{Math.round(Number(priceDraft || 0) * (1 - Number(discountDraft || 0) / 100)).toLocaleString()}
                            </span>
                            {Number(discountDraft) > 0 && (
                              <span className="text-xs text-slate-500 line-through">
                                ₹{Number(priceDraft || 0).toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs text-slate-600 font-medium">/ night (+ 12% GST)</span>
                          </div>
                        </div>

                        {Number(discountDraft) > 0 && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                            {discountDraft}% Discount Applied (-₹{Math.round(Number(priceDraft || 0) * (Number(discountDraft) / 100)).toLocaleString()})
                          </span>
                        )}
                      </div>

                      {/* Explicit Update Button for Pricing & Offers */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="submit"
                          className="w-full sm:w-auto pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 px-6 shadow-sm justify-center"
                        >
                          {pricingSaved ? (
                            <>
                              <Check size={16} className="text-emerald-400" /> UPDATED & PUBLISHED!
                            </>
                          ) : (
                            <>
                              <Save size={16} /> UPDATE PRICING & OFFERS
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Box 2: Room Photo Gallery Manager WITH EXPLICIT REMOVE BUTTONS */}
                    <div className="pms-card p-4 sm:p-6 space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 sm:pb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            Room Photo Gallery ({selectedRoom.images?.length || 0} Photos)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Upload photos or remove any existing image below. Guests can swipe through these in the carousel.
                          </p>
                        </div>
                      </div>

                      {/* Current Photos Grid with Visible Remove Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                        {selectedRoom.images?.map((imgUrl, idx) => {
                          const isPrimary = (selectedRoom.image === imgUrl) || (idx === 0);
                          return (
                            <div
                              key={idx}
                              className="pms-card overflow-hidden border border-slate-200 flex flex-col justify-between shadow-sm"
                            >
                              <div 
                                onClick={() => setFullScreenPreview({
                                  images: selectedRoom.images || [],
                                  currentIndex: idx,
                                  title: `${selectedRoom.name} — Photo ${idx + 1}`,
                                  subtitle: isPrimary ? 'Primary Cover Photo' : 'Room Gallery Image'
                                })}
                                className="pms-img-preview-stage"
                                title="Click to view full-size image without zoom"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${selectedRoom.name} ${idx + 1}`}
                                />

                                {isPrimary && (
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[0.65rem] uppercase tracking-wider font-bold shadow flex items-center gap-1 z-10">
                                    <Star size={10} fill="currentColor" /> Cover Photo
                                  </span>
                                )}

                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[0.62rem] text-white backdrop-blur-sm pointer-events-none font-medium flex items-center gap-1">
                                  <Eye size={10} className="text-amber-400" /> Full Preview
                                </span>
                              </div>

                              {/* Visible Action Toolbar for each image */}
                              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                                {/* Top Row: Order Badge, Reordering & Cover Selection */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[0.7rem]">
                                      #{idx + 1}
                                    </span>
                                    {selectedRoom.images?.length > 1 && (
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => reorderRoomImages(selectedRoom.id, idx, idx - 1)}
                                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 rounded"
                                          title="Move photo earlier in gallery"
                                        >
                                          <ChevronLeft size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === selectedRoom.images.length - 1}
                                          onClick={() => reorderRoomImages(selectedRoom.id, idx, idx + 1)}
                                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 rounded"
                                          title="Move photo later in gallery"
                                        >
                                          <ChevronRight size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {isPrimary ? (
                                    <span className="text-[0.7rem] font-bold text-amber-800 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                                      <Star size={10} fill="currentColor" /> Main Cover
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setRoomPrimaryImage(selectedRoom.id, idx)}
                                      className="text-[0.68rem] font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/80 uppercase transition-colors"
                                      title="Make this the primary cover photo"
                                    >
                                      Set Cover
                                    </button>
                                  )}
                                </div>

                                {/* Bottom Row: 1-Click Replace & Remove Buttons */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                                  <label
                                    className="pms-btn pms-btn-secondary text-[0.7rem] font-bold uppercase tracking-wider py-1.5 px-2.5 flex-1 justify-center cursor-pointer"
                                    title="Change or replace this photo with a new image"
                                  >
                                    <RefreshCw size={12} className="text-blue-600 shrink-0" /> Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleReplaceRoomImage(idx, e)}
                                      className="hidden"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="pms-btn pms-btn-danger text-[0.7rem] font-bold uppercase tracking-wider py-1.5 px-2.5 shrink-0"
                                    title="Remove this photo from room gallery"
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Photos Toolbar */}
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Option 1: Device Upload */}
                        <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-amber-500 transition-colors flex flex-col justify-center">
                          <label className="cursor-pointer block">
                            {isUploadingRoom ? (
                              <div className="py-2">
                                <RefreshCw size={22} className="mx-auto text-amber-600 mb-1.5 animate-spin" />
                                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                                  Uploading to CDN...
                                </span>
                              </div>
                            ) : (
                              <div className="py-1">
                                <Upload size={22} className="mx-auto text-amber-600 mb-1.5" />
                                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                                  Upload Device Photo
                                </span>
                                <span className="text-[0.68rem] text-slate-500 block mt-0.5">
                                  Instant public CDN sync
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleRoomFileUpload}
                                  className="hidden"
                                  disabled={isUploadingRoom}
                                />
                              </div>
                            )}
                          </label>
                          {roomUploadError && <p className="text-red-600 text-xs mt-1.5 font-medium">{roomUploadError}</p>}
                        </div>

                        {/* Option 2: Browse Resort Photo Presets */}
                        <div 
                          onClick={() => { setPresetTargetType('room'); setShowPresetModal(true); }}
                          className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/60 text-center cursor-pointer transition-colors flex flex-col items-center justify-center group"
                          title="Choose from authentic Peace at Peak resort photo presets"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-200/70 flex items-center justify-center text-amber-800 mb-1.5 group-hover:scale-110 transition-transform">
                            <Sparkles size={18} />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-slate-900 font-bold block">
                            Resort Photo Library
                          </span>
                          <span className="text-[0.68rem] text-amber-800/80 block mt-0.5">
                            1-Click authentic resort shots
                          </span>
                        </div>

                        {/* Option 3: Image URL Input */}
                        <form onSubmit={handleAddRoomImageByUrl} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block mb-1">
                              Add via Image Link
                            </span>
                            <input
                              type="url"
                              value={newRoomImageUrl}
                              onChange={(e) => setNewRoomImageUrl(e.target.value)}
                              placeholder="https://... or /images/..."
                              className="pms-input text-xs"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full pms-btn pms-btn-primary text-xs uppercase tracking-wider py-1.5"
                          >
                            <Plus size={13} /> Add Link
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Room Details & Specs WITH EXPLICIT UPDATE BUTTON */}
                  <div className="space-y-6">
                    <form onSubmit={handleUpdateDetails} className="pms-card p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                          Room Specifications
                        </h3>
                        <span className="text-[0.68rem] text-slate-400 font-semibold uppercase">
                          Public Info
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Room Title</label>
                        <input
                          type="text"
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          className="pms-input"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Tagline</label>
                        <input
                          type="text"
                          value={taglineDraft}
                          onChange={(e) => setTaglineDraft(e.target.value)}
                          className="pms-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="pms-label">Bedding</label>
                          <input
                            type="text"
                            value={bedDraft}
                            onChange={(e) => setBedDraft(e.target.value)}
                            className="pms-input"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="pms-label">Guests</label>
                          <input
                            type="text"
                            value={guestsDraft}
                            onChange={(e) => setGuestsDraft(e.target.value)}
                            className="pms-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">View Type</label>
                        <input
                          type="text"
                          value={viewDraft}
                          onChange={(e) => setViewDraft(e.target.value)}
                          className="pms-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Room Description</label>
                        <textarea
                          rows={6}
                          value={descDraft}
                          onChange={(e) => setDescDraft(e.target.value)}
                          className="pms-textarea"
                        />
                      </div>

                      {/* Explicit Update Button for Room Details */}
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          type="submit"
                          className="w-full pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 shadow"
                        >
                          {detailsSaved ? (
                            <>
                              <Check size={16} className="text-emerald-400" /> ROOM DETAILS UPDATED!
                            </>
                          ) : (
                            <>
                              <Save size={16} /> UPDATE ROOM DETAILS
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------------------------
                  CASE B: MAIN DINING HALL OR RECEPTION LOUNGE SELECTED
                 --------------------------------------------------------------- */}
              {isTargetSpace && selectedSpace && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade">
                  {/* Left 2 Columns: Photo Gallery Manager for Dining/Reception */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="pms-card p-3.5 sm:p-6 space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3 sm:pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="pms-label text-amber-700 mb-0">
                              {selectedSpace.id === 'dining_hall' ? <Utensils size={14} /> : <Coffee size={14} />}
                              {selectedSpace.category}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {selectedSpace.badge}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                            {selectedSpace.name} Photos ({selectedSpace.images?.length || 0})
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Photos displayed in the guest Dining & Reception showcase. Use the buttons below to remove or add photos.
                          </p>
                        </div>
                      </div>

                      {/* Existing Photos Grid with Remove Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                        {selectedSpace.images?.map((imgUrl, idx) => {
                          const isPrimary = (selectedSpace.image === imgUrl) || (idx === 0);
                          return (
                            <div
                              key={idx}
                              className="pms-card overflow-hidden border border-slate-200 flex flex-col justify-between shadow-sm"
                            >
                              <div 
                                onClick={() => setFullScreenPreview({
                                  images: selectedSpace.images || [],
                                  currentIndex: idx,
                                  title: `${selectedSpace.name} — Photo ${idx + 1}`,
                                  subtitle: isPrimary ? 'Main Display Photo' : 'Space Showcase Image'
                                })}
                                className="pms-img-preview-stage"
                                title="Click to view full-size image without zoom"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${selectedSpace.name} ${idx + 1}`}
                                />

                                {isPrimary && (
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[0.65rem] uppercase tracking-wider font-bold shadow flex items-center gap-1 z-10">
                                    <Star size={10} fill="currentColor" /> Main Display
                                  </span>
                                )}

                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[0.62rem] text-white backdrop-blur-sm pointer-events-none font-medium flex items-center gap-1">
                                  <Eye size={10} className="text-amber-400" /> Full Preview
                                </span>
                              </div>

                              {/* Visible Toolbar with Replace, Reorder & Remove Buttons */}
                              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                                {/* Top Row: Order Badge, Reordering & Cover Selection */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[0.7rem]">
                                      #{idx + 1}
                                    </span>
                                    {selectedSpace.images?.length > 1 && (
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => reorderSpaceImages(selectedSpace.id, idx, idx - 1)}
                                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 rounded"
                                          title="Move photo earlier in gallery"
                                        >
                                          <ChevronLeft size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === selectedSpace.images.length - 1}
                                          onClick={() => reorderSpaceImages(selectedSpace.id, idx, idx + 1)}
                                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 rounded"
                                          title="Move photo later in gallery"
                                        >
                                          <ChevronRight size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {isPrimary ? (
                                    <span className="text-[0.7rem] font-bold text-amber-800 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                                      <Star size={10} fill="currentColor" /> Main Display
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setSpacePrimaryImage(selectedSpace.id, idx)}
                                      className="text-[0.68rem] font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/80 uppercase transition-colors"
                                      title="Make this the primary space photo"
                                    >
                                      Set Main
                                    </button>
                                  )}
                                </div>

                                {/* Bottom Row: 1-Click Replace & Remove Buttons */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                                  <label
                                    className="pms-btn pms-btn-secondary text-[0.7rem] font-bold uppercase tracking-wider py-1.5 px-2.5 flex-1 justify-center cursor-pointer"
                                    title="Change or replace this photo with a new image"
                                  >
                                    <RefreshCw size={12} className="text-blue-600 shrink-0" /> Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleReplaceSpaceImage(idx, e)}
                                      className="hidden"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpaceImage(idx)}
                                    className="pms-btn pms-btn-danger text-[0.7rem] font-bold uppercase tracking-wider py-1.5 px-2.5 shrink-0"
                                    title="Remove this photo"
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Photos Toolbar for Space */}
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Option 1: Device File Upload */}
                        <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-amber-500 transition-colors flex flex-col justify-center">
                          <label className="cursor-pointer block">
                            {isUploadingSpace ? (
                              <div className="py-2">
                                <RefreshCw size={22} className="mx-auto text-amber-600 mb-1.5 animate-spin" />
                                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                                  Uploading to CDN...
                                </span>
                              </div>
                            ) : (
                              <div className="py-1">
                                <Upload size={22} className="mx-auto text-amber-600 mb-1.5" />
                                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                                  Upload Device Photo
                                </span>
                                <span className="text-[0.68rem] text-slate-500 block mt-0.5">
                                  Instant public CDN sync
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleSpaceFileUpload}
                                  className="hidden"
                                  disabled={isUploadingSpace}
                                />
                              </div>
                            )}
                          </label>
                          {spaceUploadError && <p className="text-red-600 text-xs mt-1.5 font-medium">{spaceUploadError}</p>}
                        </div>

                        {/* Option 2: Browse Resort Photo Presets */}
                        <div 
                          onClick={() => { setPresetTargetType('space'); setShowPresetModal(true); }}
                          className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/60 text-center cursor-pointer transition-colors flex flex-col items-center justify-center group"
                          title="Choose from authentic Peace at Peak resort photo presets"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-200/70 flex items-center justify-center text-amber-800 mb-1.5 group-hover:scale-110 transition-transform">
                            <Sparkles size={18} />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-slate-900 font-bold block">
                            Resort Photo Library
                          </span>
                          <span className="text-[0.68rem] text-amber-800/80 block mt-0.5">
                            1-Click authentic resort shots
                          </span>
                        </div>

                        {/* Option 3: Add via URL */}
                        <form onSubmit={handleAddSpaceImageByUrl} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block mb-1">
                              Add via Image Link
                            </span>
                            <input
                              type="url"
                              value={newSpaceImageUrl}
                              onChange={(e) => setNewSpaceImageUrl(e.target.value)}
                              placeholder="https://... or /images/..."
                              className="pms-input text-xs"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full pms-btn pms-btn-primary text-xs uppercase tracking-wider py-1.5"
                          >
                            <Plus size={13} /> Add Link
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Space Details Form WITH EXPLICIT UPDATE BUTTON */}
                  <div className="space-y-6">
                    <form onSubmit={handleUpdateSpaceDetails} className="pms-card p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                          Space Information & Hours
                        </h3>
                        <p className="text-xs text-slate-500">
                          Updates public descriptions on the website.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Space Title</label>
                        <input
                          type="text"
                          value={spaceTitleDraft}
                          onChange={(e) => setSpaceTitleDraft(e.target.value)}
                          className="pms-input"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Subtitle / Catchphrase</label>
                        <input
                          type="text"
                          value={spaceSubtitleDraft}
                          onChange={(e) => setSpaceSubtitleDraft(e.target.value)}
                          className="pms-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">
                          <Clock size={13} className="text-amber-600" /> Operating Timings & Hours
                        </label>
                        <input
                          type="text"
                          value={spaceTimingsDraft}
                          onChange={(e) => setSpaceTimingsDraft(e.target.value)}
                          placeholder="e.g. Breakfast: 7:30 AM – 10:30 AM | Dinner: 7:30 PM – 10:30 PM"
                          className="pms-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">
                          <CheckCircle2 size={13} className="text-amber-600" /> Key Features & Highlights
                        </label>
                        <input
                          type="text"
                          value={spaceFeaturesDraft}
                          onChange={(e) => setSpaceFeaturesDraft(e.target.value)}
                          placeholder="Separate with commas (e.g. Hot Buffet, Bonfire, Sunset View)"
                          className="pms-input"
                        />
                        <p className="text-[0.68rem] text-slate-400">Separate highlights with commas.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Detailed Description</label>
                        <textarea
                          rows={6}
                          value={spaceDescDraft}
                          onChange={(e) => setSpaceDescDraft(e.target.value)}
                          className="pms-textarea"
                        />
                      </div>

                      {/* Explicit Update Button for Space Details */}
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          type="submit"
                          className="w-full pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 shadow"
                        >
                          {spaceSaved ? (
                            <>
                              <Check size={16} className="text-emerald-400" /> SPACE DETAILS UPDATED!
                            </>
                          ) : (
                            <>
                              <Save size={16} /> UPDATE SPACE DETAILS
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------------------
                  CASE C: HERO SLIDESHOW TARGET SELECTED
                 --------------------------------------------------------------- */}
              {isTargetHero && (
                <div className="pms-card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                        Hero Slideshow Carousel Images ({heroSlides.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Images slide rightward automatically every 2.0s on the homepage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('hero')}
                      className="pms-btn pms-btn-primary text-xs uppercase tracking-wider"
                    >
                      Open Full Slideshow Engine →
                    </button>
                  </div>

                  {/* Quick Upload Dropzone directly in View 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 text-center hover:border-amber-500 transition-colors">
                      <label className="cursor-pointer block">
                        {isUploadingHero ? (
                          <div className="py-2">
                            <RefreshCw size={24} className="mx-auto text-amber-600 mb-2 animate-spin" />
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                              Optimizing & Uploading Hero Photo...
                            </span>
                            <span className="text-[0.7rem] text-slate-500 block mt-1">
                              Compressing to crystal-clear HD for desktop & mobile
                            </span>
                          </div>
                        ) : (
                          <div className="py-1">
                            <Upload size={24} className="mx-auto text-amber-600 mb-2" />
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                              Upload New Hero Photo From Device
                            </span>
                            <span className="text-[0.7rem] text-slate-500 block mt-1">
                              Landscape photo recommended • Automatically optimized for Android & Desktop
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeroFileUpload}
                              className="hidden"
                              disabled={isUploadingHero}
                            />
                          </div>
                        )}
                      </label>
                      {heroUploadError && <p className="text-red-600 text-xs mt-2 font-medium">{heroUploadError}</p>}
                    </div>

                    <form onSubmit={handleAddHeroByUrl} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                          Or Add Hero Image via URL
                        </span>
                        <input
                          type="text"
                          value={newHeroUrl}
                          onChange={(e) => setNewHeroUrl(e.target.value)}
                          placeholder="https://... or /images/..."
                          className="pms-input text-xs"
                          required
                        />
                        <input
                          type="text"
                          value={newHeroCaption}
                          onChange={(e) => setNewHeroCaption(e.target.value)}
                          placeholder="Slide caption (e.g. Sunset Panorama)"
                          className="pms-input text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full pms-btn pms-btn-primary py-2 text-xs uppercase tracking-wider"
                      >
                        <Plus size={14} /> Add to Hero Carousel
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroSlides.map((slide, idx) => (
                      <div key={idx} className="pms-card overflow-hidden border border-slate-200 flex flex-col justify-between shadow-sm">
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                          <img src={slide.url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[0.65rem] font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate">{slide.caption || 'Slide'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroSlide(idx)}
                            className="pms-btn pms-btn-danger text-[0.65rem] font-bold uppercase tracking-wider py-1 px-2 shrink-0"
                            title="Remove this hero image"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =======================================================================
              VIEW 3: HERO SLIDESHOW ENGINE WITH UPDATE AND REMOVE BUTTONS
             ======================================================================= */}
          {activeNav === 'hero' && (
            <div className="space-y-6 animate-fade">
              <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                      Hero Slideshow Carousel Engine
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Multi-Panel & Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage the background images that slide rightward every 2.0 seconds in the Hero section. Slides synchronize across other admin panels and the live hero page.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSlideIdx(0);
                      setShowHeroPreview(true);
                    }}
                    className="pms-btn pms-btn-secondary text-xs uppercase tracking-wider py-2 px-3.5"
                    title="Open live hero slideshow preview simulation"
                  >
                    <Eye size={15} /> Preview Hero
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      publishHeroSlides(heroSlides);
                      setNotification('Hero slides published & synchronized across all panels and live website!');
                      setTimeout(() => setNotification(''), 4000);
                    }}
                    className="pms-btn pms-btn-primary text-xs uppercase tracking-wider py-2 px-3.5 shadow-sm"
                    title="Publish and sync all slides across all devices and panels"
                  >
                    <RefreshCw size={15} /> Publish & Sync All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Slides List */}
                <div className="lg:col-span-2 space-y-3">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className="pms-card p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-300 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div 
                        onClick={() => setFullScreenPreview({
                          images: heroSlides.map(s => s.url),
                          currentIndex: idx,
                          title: `Hero Slide ${idx + 1}`,
                          subtitle: slide.caption || 'Hero Background Slide'
                        })}
                        className="w-full sm:w-36 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-950 flex items-center justify-center cursor-pointer group relative shadow-inner"
                        title="Click to view 100% full-size uncropped image"
                      >
                        <img 
                          src={slide.url} 
                          alt={`Hero Slide ${idx + 1}`} 
                          className="max-w-full max-h-full object-contain" 
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[0.6rem] text-white backdrop-blur-sm pointer-events-none font-medium flex items-center gap-1">
                          <Eye size={10} className="text-amber-400" /> Full
                        </span>
                      </div>

                      <div className="flex-grow min-w-0 space-y-2 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            defaultValue={slide.caption || ''}
                            onBlur={(e) => handleUpdateHeroSlide(idx, { caption: e.target.value })}
                            placeholder="Slide caption"
                            className="pms-input flex-grow"
                          />
                          <select
                            defaultValue={slide.position || 'center center'}
                            onChange={(e) => handleUpdateHeroSlide(idx, { position: e.target.value })}
                            className="pms-select sm:w-44"
                          >
                            <option value="center center">Focal: Center</option>
                            <option value="center 40%">Focal: Top / 40%</option>
                            <option value="center 60%">Focal: Center-Low / 60%</option>
                            <option value="center 70%">Focal: Bottom / 70%</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                          <span className="truncate max-w-xs">URL: {slide.url}</span>
                          <span className="text-emerald-700 font-semibold">● 2.0s Loop</span>
                        </div>
                      </div>

                      {/* Reorder & Remove Slide Controls */}
                      <div className="flex items-center justify-end sm:justify-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          type="button"
                          onClick={() => reorderHeroSlide(idx, 'up')}
                          disabled={idx === 0}
                          className="p-2 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200 active:scale-95"
                          title="Move slide up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderHeroSlide(idx, 'down')}
                          disabled={idx === heroSlides.length - 1}
                          className="p-2 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200 active:scale-95"
                          title="Move slide down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        
                        {/* Facility to Remove Existing Hero Image */}
                        <button
                          type="button"
                          onClick={() => handleRemoveHeroSlide(idx)}
                          className="pms-btn pms-btn-danger text-xs uppercase tracking-wider py-2 px-3.5"
                          title="Remove this hero image"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Hero Slide Form */}
                <div className="space-y-6">
                  <div className="pms-card p-5 sm:p-6 space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Add New Hero Slide
                    </h3>

                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-amber-500 transition-colors">
                      <label className="cursor-pointer block">
                        {isUploadingHero ? (
                          <div className="py-2">
                            <RefreshCw size={24} className="mx-auto text-amber-600 mb-2 animate-spin" />
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                              Optimizing & Uploading Hero Photo...
                            </span>
                            <span className="text-[0.7rem] text-slate-500 block mt-1">
                              Processing HD canvas encoding for desktop & mobile
                            </span>
                          </div>
                        ) : (
                          <div className="py-1">
                            <Upload size={24} className="mx-auto text-amber-600 mb-2" />
                            <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block">
                              Upload Photo From Device
                            </span>
                            <span className="text-[0.7rem] text-slate-500 block mt-1">
                              High-res phone & camera photos auto-optimized
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeroFileUpload}
                              className="hidden"
                              disabled={isUploadingHero}
                            />
                          </div>
                        )}
                      </label>
                      {heroUploadError && <p className="text-red-600 text-xs mt-2 font-medium">{heroUploadError}</p>}
                    </div>

                    <div className="text-center text-xs text-slate-400 uppercase tracking-widest font-semibold">
                      — OR USE DIRECT URL —
                    </div>

                    <form onSubmit={handleAddHeroByUrl} className="space-y-3">
                      <div className="space-y-1">
                        <label className="pms-label">Image URL</label>
                        <input
                          type="text"
                          value={newHeroUrl}
                          onChange={(e) => setNewHeroUrl(e.target.value)}
                          placeholder="https://... or /images/..."
                          className="pms-input"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Slide Caption</label>
                        <input
                          type="text"
                          value={newHeroCaption}
                          onChange={(e) => setNewHeroCaption(e.target.value)}
                          placeholder="e.g. Mountain Sunset Panorama"
                          className="pms-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="pms-label">Focal Alignment</label>
                        <select
                          value={newHeroPosition}
                          onChange={(e) => setNewHeroPosition(e.target.value)}
                          className="pms-select"
                        >
                          <option value="center center">Center (Default)</option>
                          <option value="center 40%">Top / 40%</option>
                          <option value="center 60%">Center-Low / 60%</option>
                          <option value="center 70%">Bottom / 70%</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full pms-btn pms-btn-primary py-3 text-xs uppercase tracking-wider mt-3"
                      >
                        <Plus size={15} /> Add to Hero Slideshow
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================================
              VIEW 4: GUEST RESERVATIONS LOG (REAL LIVE DATA + MANUAL ENTRY)
             ======================================================================= */}
          {activeNav === 'bookings' && (
            <div className="space-y-6 animate-fade">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Guest Reservations Log
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {bookings.length} verified reservations recorded in live property management database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(true)}
                  className="w-full sm:w-auto pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 px-5 shadow-sm justify-center"
                >
                  <Plus size={16} /> Add Manual Reservation
                </button>
              </div>

              <div className="pms-card p-4 sm:p-5">
                {bookings.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                    <Calendar size={36} className="mx-auto text-slate-400" />
                    <h3 className="text-base font-bold text-slate-800">No Reservations in Live Database</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All placeholder test data has been removed. Genuine bookings submitted by guests through the website or created manually will be recorded here in real time.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewBookingModal(true)}
                      className="mt-2 pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 px-5 shadow-sm"
                    >
                      <Plus size={15} /> Add Manual Reservation
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Reservation Cards (< 768px) */}
                    <div className="md:hidden space-y-3">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                          {/* Header: ID, Status & Quick Delete */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                              {booking.id}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete reservation ${booking.id} for ${booking.guestName}?`)) {
                                    removeBooking(booking.id);
                                    showToast('🗑️ Reservation deleted from database!');
                                  }
                                }}
                                className="pms-btn pms-btn-danger p-2 rounded-lg"
                                title="Delete reservation"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Guest Info */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{booking.guestName}</h4>
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                              {booking.phone && (
                                <a href={`tel:${booking.phone}`} className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100">
                                  📞 {booking.phone}
                                </a>
                              )}
                              {booking.email && (
                                <a href={`mailto:${booking.email}`} className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[0.75rem]">
                                  ✉️ {booking.email}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Stay Info */}
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-800 font-semibold">
                              <span className="text-amber-800 font-bold">{booking.roomName}</span>
                              <span className="text-[0.7rem] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                              </span>
                            </div>
                            <p className="text-[0.75rem] text-slate-500 font-medium">
                              📅 {booking.checkIn} → {booking.checkOut}
                            </p>
                          </div>

                          {/* Price & Status Selector */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[0.65rem] uppercase font-bold tracking-wider text-slate-400 block">Total Due</span>
                              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                                ₹{Number(booking.amount || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="min-w-[130px] sm:min-w-[150px]">
                              <span className="text-[0.65rem] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Live Status</span>
                              <select
                                value={booking.status || 'confirmed'}
                                onChange={(e) => {
                                  updateBookingStatus(booking.id, e.target.value);
                                  showToast(`Updated status to ${e.target.value}!`);
                                }}
                                className="pms-select text-xs py-2 px-2.5 font-bold uppercase rounded-lg w-full"
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="active">Active (In-House)</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop / Tablet Table (>= 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[0.68rem] uppercase font-bold text-slate-500 tracking-wider">
                            <th className="py-3 px-3">Booking Ref</th>
                            <th className="py-3 px-3">Guest</th>
                            <th className="py-3 px-3">Room Target</th>
                            <th className="py-3 px-3">Dates & Nights</th>
                            <th className="py-3 px-3 text-right">Total (₹)</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                                {booking.id}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="font-bold text-slate-900 block">{booking.guestName}</span>
                                <span className="text-[0.68rem] text-slate-500">{booking.email} • {booking.phone}</span>
                              </td>
                              <td className="py-3.5 px-3 font-medium text-slate-700">
                                {booking.roomName}
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                                {booking.checkIn} → {booking.checkOut}
                                <span className="block text-[0.68rem] text-slate-400 font-semibold">{booking.nights} nights stay</span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                                ₹{Number(booking.amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <select
                                  value={booking.status || 'confirmed'}
                                  onChange={(e) => {
                                    updateBookingStatus(booking.id, e.target.value);
                                    showToast(`Updated status to ${e.target.value}!`);
                                  }}
                                  className="pms-select text-xs py-1 px-2 font-bold uppercase rounded-md"
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="active">Active (Checked In)</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete reservation ${booking.id} for ${booking.guestName}?`)) {
                                      removeBooking(booking.id);
                                      showToast('🗑️ Reservation deleted from database!');
                                    }
                                  }}
                                  className="pms-btn pms-btn-danger text-[0.68rem] py-1 px-2.5 uppercase font-bold"
                                  title="Delete reservation"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* =======================================================================
              VIEW 5: SYSTEM DIAGNOSTICS & RESET
             ======================================================================= */}
          {activeNav === 'settings' && (
            <div className="space-y-6 animate-fade">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                  System Diagnostics & Persistence
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect local storage keys, data payloads, and system recovery controls.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="pms-card p-5">
                  <span className="pms-label text-slate-500">Rooms Data Payload</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{rooms.length} Units</h4>
                  <p className="text-[0.7rem] text-slate-500 mt-0.5">Key: <code>pap_rooms_data</code></p>
                </div>

                <div className="pms-card p-5">
                  <span className="pms-label text-slate-500">Dining & Reception</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{(propertySpaces || []).length} Spaces</h4>
                  <p className="text-[0.7rem] text-slate-500 mt-0.5">Key: <code>pap_property_spaces</code></p>
                </div>

                <div className="pms-card p-5">
                  <span className="pms-label text-slate-500">Hero Carousel</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{heroSlides.length} Slides</h4>
                  <p className="text-[0.7rem] text-slate-500 mt-0.5">Key: <code>pap_hero_slides</code></p>
                </div>

                <div className="pms-card p-5">
                  <span className="pms-label text-slate-500">Reservations</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{bookings.length} Bookings</h4>
                  <p className="text-[0.7rem] text-slate-500 mt-0.5">Key: <code>pap_bookings_data</code></p>
                </div>
              </div>

              {/* Factory Reset Card */}
              <div className="pms-card p-6 border-red-200 bg-red-50/40 max-w-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm">
                  <AlertTriangle size={20} />
                  <span>Reset All Property Settings to Factory Defaults</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clicking below will clear all customizations made to rooms, dining hall & reception photos/information, pricing, discounts, availability toggles, hero slides, and seeded bookings, restoring the pristine resort defaults.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data to factory defaults?')) {
                      resetAllToDefaults();
                      showToast('All property data reset to factory defaults!');
                    }
                  }}
                  className="pms-btn pms-btn-danger text-xs uppercase tracking-wider py-2.5 px-4"
                >
                  <RefreshCw size={15} /> Reset All Data to Defaults
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          FIXED MOBILE EXECUTIVE BOTTOM NAVIGATION BAR
         ========================================================================= */}
      <nav className="lg:hidden pms-mobile-bottom-nav">
        <button
          type="button"
          onClick={() => { setActiveNav('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`pms-bottom-nav-item ${activeNav === 'overview' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTarget(rooms[0]?.id || 'private_cottage'); setActiveNav('config'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`pms-bottom-nav-item ${activeNav === 'config' && isTargetRoom ? 'active' : ''}`}
        >
          <BedDouble size={20} />
          <span>Rooms</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTarget('dining_hall'); setActiveNav('config'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`pms-bottom-nav-item ${activeNav === 'config' && isTargetSpace ? 'active' : ''}`}
        >
          <Utensils size={20} />
          <span>Dining</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveNav('hero'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`pms-bottom-nav-item ${activeNav === 'hero' || (activeNav === 'config' && isTargetHero) ? 'active' : ''}`}
        >
          <ImageIcon size={20} />
          <span>Hero</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveNav('bookings'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`pms-bottom-nav-item relative ${activeNav === 'bookings' ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Bookings</span>
          {bookings.length > 0 && (
            <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </nav>

      {/* =========================================================================
          GLOBAL MANUAL RESERVATION MODAL (CENTERED OVERLAY)
         ========================================================================= */}
      {showNewBookingModal && (
        <div 
          className="pms-modal-overlay"
          onClick={() => setShowNewBookingModal(false)}
        >
          <div 
            className="pms-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Add New Guest Reservation
                </h3>
                <p className="text-xs text-slate-500">Record a phone or walk-in reservation directly into PMS database.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="pms-label">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={manualBookingForm.guestName}
                  onChange={(e) => setManualBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="pms-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="pms-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={manualBookingForm.phone}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="pms-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="pms-label">Email Address</label>
                  <input
                    type="email"
                    value={manualBookingForm.email}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="rahul@example.com"
                    className="pms-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="pms-label">Room Target</label>
                <select
                  value={manualBookingForm.roomId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    const r = rooms.find(rm => rm.id === rId);
                    setManualBookingForm(prev => ({
                      ...prev,
                      roomId: rId,
                      amount: r ? getEffectivePrice(r) * 2 : 4500
                    }));
                  }}
                  className="pms-select"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (₹{getEffectivePrice(r).toLocaleString()}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="pms-label">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={manualBookingForm.checkIn}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="pms-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="pms-label">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={manualBookingForm.checkOut}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="pms-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="pms-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={manualBookingForm.amount}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="pms-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="pms-label">Initial Status</label>
                  <select
                    value={manualBookingForm.status}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, status: e.target.value }))}
                    className="pms-select"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active (Checked In)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="w-full sm:w-auto pms-btn pms-btn-secondary text-xs uppercase tracking-wider py-3 px-5 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto pms-btn pms-btn-primary text-xs uppercase tracking-wider py-3 px-6 justify-center shadow-sm"
                >
                  <Check size={16} /> Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          LIVE HERO PREVIEW MODAL (DESKTOP & MOBILE SIMULATION)
         ======================================================================= */}
      {showHeroPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Hero Section Live Preview
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-normal">
                      ● 2.0s Auto Loop
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Slide {previewSlideIdx + 1} of {heroSlides.length} — {heroSlides[previewSlideIdx]?.caption || 'Hero Slide'}
                  </p>
                </div>
              </div>

              {/* Device Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} /> Mobile View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor size={14} /> Desktop View
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowHeroPreview(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Simulation Frame */}
            <div className="p-4 sm:p-8 flex-grow overflow-y-auto flex items-center justify-center bg-[#050d09]">
              {previewDevice === 'mobile' ? (
                /* Mobile Device Simulation Frame */
                <div className="w-[360px] max-w-full rounded-[2rem] border-4 border-slate-700 bg-[#050d09] overflow-hidden shadow-2xl p-4 flex flex-col items-center justify-center relative min-h-[560px]">
                  {/* Speaker Notch */}
                  <div className="w-20 h-3 bg-slate-800 rounded-full mb-3 shrink-0"></div>

                  {/* Mobile Content (Matches Live Android/Mobile Layout) */}
                  <div className="w-full flex flex-col items-center text-center space-y-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[0.6rem] uppercase font-semibold text-amber-300 border border-amber-400/40 bg-amber-400/10 tracking-wider">
                      <ShieldCheck size={11} /> Best Rate Guaranteed
                    </div>
                    <h2 className="text-white text-xl font-light leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      The Sanctuary at <span className="italic text-amber-300">Peace at Peak</span>
                    </h2>
                    <p className="text-slate-300 text-xs font-light leading-relaxed max-w-[280px]">
                      Discover silence, elegance, and pristine views of the Himalayan range at 8,500 feet.
                    </p>
                  </div>

                  {/* 16:10 Photo Frame with Transition */}
                  <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-amber-400/25 shadow-lg relative bg-black shrink-0">
                    <img
                      src={heroSlides[previewSlideIdx]?.url}
                      alt="Hero slide preview"
                      className="w-full h-full object-cover transition-opacity duration-700"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[0.65rem] text-white backdrop-blur-sm">
                      {previewSlideIdx + 1} / {heroSlides.length}
                    </div>
                  </div>

                  {/* Minimalist Dots */}
                  <div className="flex items-center justify-center gap-1.5 my-3">
                    {heroSlides.map((_, i) => (
                      <span
                        key={i}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: i === previewSlideIdx ? '18px' : '6px',
                          backgroundColor: i === previewSlideIdx ? '#f3d375' : 'rgba(255, 255, 255, 0.35)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Action Buttons Below Image */}
                  <div className="w-full space-y-2">
                    <div className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
                      <Calendar size={13} /> Check Availability
                    </div>
                    <div className="w-full py-2.5 rounded-lg bg-white/10 border border-white/30 text-white font-semibold text-xs uppercase tracking-widest text-center">
                      Explore Cottages
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Simulation Frame */
                <div className="w-full rounded-xl border-2 border-slate-700 bg-[#050d09] overflow-hidden shadow-2xl relative min-h-[420px] flex items-center justify-center">
                  <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{
                      backgroundImage: `url('${heroSlides[previewSlideIdx]?.url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: heroSlides[previewSlideIdx]?.position || 'center center',
                    }}
                  />
                  <div className="absolute inset-0 bg-black/45" />

                  <div className="relative text-center px-6 py-12 z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full mb-3 text-amber-300 border border-amber-400/40 bg-black/40 backdrop-blur-sm text-xs tracking-widest uppercase font-semibold">
                      <ShieldCheck size={12} /> Best Rate Guaranteed
                    </div>
                    <h1 className="text-white text-4xl sm:text-5xl font-light mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      The Sanctuary at <span className="italic text-amber-300">Peace at Peak</span>
                    </h1>
                    <p className="text-slate-200 text-sm sm:text-base font-light mb-6 leading-relaxed">
                      Discover silence, elegance, and pristine views of the Himalayan range at 8,500 feet.
                    </p>
                    <div className="inline-flex items-center gap-3">
                      <div className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest rounded shadow-md">
                        Reserve Your Cottage
                      </div>
                      <div className="px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold text-xs uppercase tracking-widest rounded">
                        View Accommodations
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/70 text-xs text-white backdrop-blur-sm z-10">
                    Slide {previewSlideIdx + 1} of {heroSlides.length}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400">
                Live Slideshow previews every 2.0 seconds automatically.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHeroPreview(false)}
                  className="pms-btn pms-btn-secondary text-xs uppercase tracking-wider py-2 px-4"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHeroPreview(false);
                    onBackToSite?.();
                  }}
                  className="pms-btn pms-btn-primary text-xs uppercase tracking-wider py-2 px-4 shadow-sm"
                >
                  <ExternalLink size={14} /> Open Live Website
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =======================================================================
          GLOBAL FULL-SIZE IMAGE PREVIEW LIGHTBOX WITH SWAPPING & GO BACK
         ======================================================================= */}
      {fullScreenPreview && (
        <div 
          className="pms-lightbox-overlay"
          onClick={() => setFullScreenPreview(null)}
        >
          {/* Header Bar */}
          <div 
            className="pms-lightbox-header"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Go Back Button & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setFullScreenPreview(null)}
                className="pms-lightbox-back-btn"
                title="Go back to dashboard (or press Esc)"
              >
                <ArrowLeft size={16} /> Go Back
              </button>

              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-bold text-white tracking-wide flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="truncate">{fullScreenPreview.title}</span>
                </h3>
                {fullScreenPreview.subtitle && (
                  <p className="text-[0.68rem] text-slate-400 truncate hidden sm:block">{fullScreenPreview.subtitle}</p>
                )}
              </div>
            </div>

            {/* Current Slide Counter & Badges */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {fullScreenPreview.images && fullScreenPreview.images.length > 1 && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[0.72rem] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  {fullScreenPreview.currentIndex + 1} / {fullScreenPreview.images.length}
                </span>
              )}
              
              <span className="hidden md:inline-block px-2.5 py-1 rounded-full text-[0.65rem] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                Full Size • No Zoom
              </span>

              {/* High-Visibility Close (X) Button */}
              <button
                type="button"
                onClick={() => setFullScreenPreview(null)}
                className="pms-lightbox-close-btn"
                title="Close full-size preview (Esc)"
              >
                <span className="hidden sm:inline font-bold">Close</span>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Main Stage with Floating High-Visibility Arrows (Desktop & Mobile) */}
          <div 
            className="pms-lightbox-stage-container"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0]?.clientX || 0;
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current === null) return;
              const touchEndX = e.changedTouches[0]?.clientX || 0;
              const diff = touchStartXRef.current - touchEndX;
              if (Math.abs(diff) > 40 && fullScreenPreview?.images && fullScreenPreview.images.length > 1) {
                if (diff > 0) {
                  // Swipe Left -> Next Image
                  setFullScreenPreview(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex + 1) % prev.images.length
                  }));
                } else {
                  // Swipe Right -> Previous Image
                  setFullScreenPreview(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                  }));
                }
              }
              touchStartXRef.current = null;
            }}
          >
            {/* Previous Image Arrow - Big, Golden, Floating, Super Visible */}
            {fullScreenPreview.images && fullScreenPreview.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullScreenPreview(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                  }));
                }}
                className="pms-lightbox-nav-arrow prev"
                title="Swap to previous image (or press Left Arrow)"
              >
                <ChevronLeft size={30} strokeWidth={2.5} />
              </button>
            )}

            {/* Central Uncropped Image Container */}
            <div className="pms-lightbox-image-wrap">
              <img
                key={fullScreenPreview.currentIndex}
                src={
                  typeof fullScreenPreview.images?.[fullScreenPreview.currentIndex] === 'string'
                    ? fullScreenPreview.images[fullScreenPreview.currentIndex]
                    : fullScreenPreview.images?.[fullScreenPreview.currentIndex]?.url || fullScreenPreview.url
                }
                alt={fullScreenPreview.title}
                className="animate-fade"
              />
            </div>

            {/* Next Image Arrow - Big, Golden, Floating, Super Visible */}
            {fullScreenPreview.images && fullScreenPreview.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullScreenPreview(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex + 1) % prev.images.length
                  }));
                }}
                className="pms-lightbox-nav-arrow next"
                title="Swap to next image (or press Right Arrow)"
              >
                <ChevronRight size={30} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Bottom Controls & Thumbnail Strip */}
          <div 
            className="pms-lightbox-footer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Thumbnail Swapper Strip */}
            {fullScreenPreview.images && fullScreenPreview.images.length > 1 && (
              <div className="pms-lightbox-thumb-strip">
                {fullScreenPreview.images.map((imgItem, idx) => {
                  const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem.url;
                  const isCurrent = idx === fullScreenPreview.currentIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFullScreenPreview(prev => ({ ...prev, currentIndex: idx }))}
                      className={`pms-lightbox-thumb-btn ${isCurrent ? 'active' : ''}`}
                      title={`Swap to image ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-[0.72rem] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                Use arrows, swipe, or tap thumbnails
              </span>
              <button
                type="button"
                onClick={() => setFullScreenPreview(null)}
                className="pms-lightbox-back-btn"
              >
                <ArrowLeft size={14} /> Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESORT PHOTO LIBRARY MODAL (1-Click Authentic Photos)          */}
      {/* ------------------------------------------------------------- */}
      {showPresetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Resort Photo Library
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add high-res authentic photos directly to <span className="font-semibold text-slate-800">{presetTargetType === 'space' ? selectedSpace?.name : selectedRoom?.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close photo modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white scrollbar-thin">
              {['All', 'Cottages', 'Swiss Tents', 'Family Suites', 'Dining & Lounge', 'Outdoor & Lawns'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPresetCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    presetCategory === cat
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-190px)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPresets.map((preset, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={preset.thumb || preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[0.65rem] font-semibold tracking-wide">
                        {preset.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1" title={preset.name}>
                        {preset.name}
                      </h4>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <button
                      type="button"
                      onClick={() => handleSelectPresetPhoto(preset.url)}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-98"
                    >
                      <Check size={14} /> Add This Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="hidden sm:inline">1-Click instant photo application • Real-time live update</span>
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors ml-auto sm:ml-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
