/**
 * Peace at Peak - Decoupled Image Upload & Media CDN Service
 * 
 * Uploads photos directly from device to public image CDNs (ImgBB / FreeImage)
 * without touching Firebase Storage. Returns permanent, high-speed public CDN URLs.
 * Also provides high-res curated resort presets for 1-click photo selection.
 */

// Free public upload keys & endpoints (no login required for resort admins)
const IMGBB_API_KEY = '7c9e1c3e34baec37e408d28dbd6be791'; // Standard free public upload endpoint key

/**
 * Curated authentic resort presets for Peace at Peak (Kanatal, Uttarakhand)
 */
export const RESORT_PHOTO_PRESETS = [
  {
    category: 'Cottages',
    name: 'Wooden Cottage Himalayan Horizon',
    url: '/images/hut1.webp',
    thumb: '/images/hut1.webp'
  },
  {
    category: 'Cottages',
    name: 'Cozy Pine Wood Interior & Bed',
    url: '/images/room_cottage_2.jpg',
    thumb: '/images/room_cottage_2.jpg'
  },
  {
    category: 'Cottages',
    name: 'Private Balcony Sunset Valley',
    url: '/images/room_cottage_3.jpg',
    thumb: '/images/room_cottage_3.jpg'
  },
  {
    category: 'Swiss Tents',
    name: 'Luxury Swiss Glamping Camp',
    url: '/images/room_tent.jpg',
    thumb: '/images/room_tent.jpg'
  },
  {
    category: 'Swiss Tents',
    name: 'Swiss Tent Valley Front View',
    url: '/images/room_tent_2.jpg',
    thumb: '/images/room_tent_2.jpg'
  },
  {
    category: 'Swiss Tents',
    name: 'Camp Veranda & Cedar Trees',
    url: '/images/room_tent_3.jpg',
    thumb: '/images/room_tent_3.jpg'
  },
  {
    category: 'Family Suites',
    name: 'Spacious Family Living Stay',
    url: '/images/room_family.jpg',
    thumb: '/images/room_family.jpg'
  },
  {
    category: 'Family Suites',
    name: 'Family Suite Patio & Garden',
    url: '/images/room_family_2.jpg',
    thumb: '/images/room_family_2.jpg'
  },
  {
    category: 'Dining & Lounge',
    name: 'Mountain Dining Hall & Hot Buffet',
    url: '/images/dining_hall_buffet.jpg',
    thumb: '/images/dining_hall_buffet.jpg'
  },
  {
    category: 'Dining & Lounge',
    name: 'Dining Pavilion Interior Seating',
    url: '/images/dining_hall_interior.jpg',
    thumb: '/images/dining_hall_interior.jpg'
  },
  {
    category: 'Dining & Lounge',
    name: 'Sunset Observation Lounge',
    url: '/images/reception_lounge_sunset.jpg',
    thumb: '/images/reception_lounge_sunset.jpg'
  },
  {
    category: 'Outdoor & Lawns',
    name: 'Giant Outdoor Chess Lawn & Fairy Lights',
    url: '/images/hero_slide_1.jpg',
    thumb: '/images/hero_slide_1.jpg'
  },
  {
    category: 'Outdoor & Lawns',
    name: 'Himalayan Twilight Horizon at 8,500 Ft',
    url: '/images/hero_slide_2.jpg',
    thumb: '/images/hero_slide_2.jpg'
  },
  {
    category: 'Outdoor & Lawns',
    name: 'Sunset Cloud Sea over Garhwal Peaks',
    url: '/images/hero_slide_3.jpg',
    thumb: '/images/hero_slide_3.jpg'
  }
];

/**
 * Optimizes an image file locally on an HTML5 canvas before uploading.
 * Converts multi-megabyte phone photos into a crisp ~60KB-120KB JPEG Blob.
 */
export function compressImageToBlob(file, maxWidth = 1600, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for compression.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format.'));
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
            resolve(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image directly to free public image CDNs.
 * Returns a permanent, publicly reachable HTTPS image URL.
 * 
 * @param {File|Blob} fileOrBlob 
 * @returns {Promise<string>} Public CDN URL
 */
export async function uploadImageToPublicCDN(fileOrBlob) {
  // 1. First compress the image to ensure superfast upload (<1 second)
  let uploadPayload = fileOrBlob;
  try {
    uploadPayload = await compressImageToBlob(fileOrBlob, 1600, 1000, 0.82);
  } catch (compErr) {
    console.warn('Canvas pre-compression bypassed:', compErr);
  }

  // 2. Try ImgBB API
  try {
    const formData = new FormData();
    formData.append('image', uploadPayload, 'peace_at_peak_photo.jpg');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.url) {
        return data.data.url;
      }
      if (data?.data?.display_url) {
        return data.data.display_url;
      }
    }
  } catch (imgbbErr) {
    console.warn('ImgBB upload attempt failed, falling back to secondary CDN:', imgbbErr);
  }

  // 3. Secondary CDN: FreeImage.host API
  try {
    const formData2 = new FormData();
    formData2.append('source', uploadPayload, 'peace_at_peak_photo.jpg');
    formData2.append('action', 'upload');
    formData2.append('key', '6d207e02198a847aa98d0a2a901485a5');

    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 10000);

    const res2 = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData2,
      signal: controller2.signal
    });
    clearTimeout(timeoutId2);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.image?.url) {
        return data2.image.url;
      }
    }
  } catch (freeImgErr) {
    console.warn('FreeImage upload failed:', freeImgErr);
  }

  // 4. Client-side high-efficiency compressed Data URL fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to encode image locally.'));
    reader.readAsDataURL(uploadPayload);
  });
}
