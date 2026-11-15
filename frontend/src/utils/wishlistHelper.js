import { apiClient } from '../api/apiClient';

const STORAGE_IDS_KEY = 'travel_wishlist_ids';
const STORAGE_ITEMS_KEY = 'travel_wishlist_items';

export const getSavedWishlistIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getSavedWishlistItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const isDestinationWishlisted = (destinationId) => {
  if (!destinationId) return false;
  const ids = getSavedWishlistIds();
  return ids.includes(Number(destinationId));
};

export const toggleDestinationWishlist = async (dest, user) => {
  if (!dest || !dest.destinationId) return false;

  const destId = Number(dest.destinationId);
  let ids = getSavedWishlistIds();
  let items = getSavedWishlistItems();
  const alreadySaved = ids.includes(destId);

  if (alreadySaved) {
    // Remove
    ids = ids.filter((id) => id !== destId);
    items = items.filter((item) => Number(item.destinationId) !== destId);

    localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));

    if (user) {
      try {
        await apiClient.delete(`/wishlist?destinationId=${destId}`);
      } catch (err) {
        console.warn('Backend wishlist remove failed, local state updated:', err);
      }
    }

    window.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { action: 'removed', destinationId: destId } }));
    return false;
  } else {
    // Add
    ids = [...ids, destId];

    const newItem = {
      wishlistId: Date.now(),
      destinationId: destId,
      destinationName: dest.name || dest.destinationName,
      destinationState: dest.state || dest.destinationState,
      destinationCountry: dest.country || dest.destinationCountry || 'India',
      description: dest.description,
      imageUrl: dest.imageUrl || dest.thumbnailUrl,
      dailyBudgetEstimated: dest.dailyBudgetEstimated || dest.budget,
      popularityScore: dest.popularityScore || 4.8,
      totalReviews: dest.totalReviews || 120,
      createdAt: new Date().toISOString()
    };

    items = [newItem, ...items.filter((i) => Number(i.destinationId) !== destId)];

    localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));

    if (user) {
      try {
        await apiClient.post('/wishlist', { destinationId: destId });
      } catch (err) {
        console.warn('Backend wishlist add failed, local state updated:', err);
      }
    }

    window.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { action: 'added', item: newItem } }));
    return true;
  }
};

export const fetchUserWishlist = async (user) => {
  if (user) {
    try {
      const serverItems = await apiClient.get('/wishlist');
      if (Array.isArray(serverItems)) {
        // Sync to local storage
        const ids = serverItems.map((i) => i.destinationId).filter(Boolean);
        localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
        localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(serverItems));
        return serverItems;
      }
    } catch (err) {
      console.warn('Failed to fetch remote wishlist, falling back to local storage:', err);
    }
  }

  return getSavedWishlistItems();
};

export const removeWishlistItem = async (item, user) => {
  const destId = item.destinationId ? Number(item.destinationId) : null;
  const wishId = item.wishlistId ? Number(item.wishlistId) : null;

  let ids = getSavedWishlistIds();
  let items = getSavedWishlistItems();

  if (destId) {
    ids = ids.filter((id) => id !== destId);
  }
  items = items.filter((i) => i.wishlistId !== wishId && (!destId || Number(i.destinationId) !== destId));

  localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));

  if (user) {
    try {
      if (destId) {
        await apiClient.delete(`/wishlist?destinationId=${destId}`);
      } else if (wishId) {
        await apiClient.delete(`/wishlist?wishlistId=${wishId}`);
      }
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
  }

  window.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { action: 'removed', destinationId: destId } }));
  return items;
};
