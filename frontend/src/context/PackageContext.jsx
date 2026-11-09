import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { PACKAGES as DEFAULT_PACKAGES } from '../data/packages';

export const DEFAULT_PACKAGE_CATEGORIES = [
  { _id: 'cat_1', name: 'Trekking', slug: 'trekking', description: 'Himalayan and summit treks, high altitude mountain trails.', order: 1, isActive: true },
  { _id: 'cat_2', name: 'Honeymoon & Leisure', slug: 'honeymoon-leisure', description: 'Romantic getaways, luxury houseboats, and serene resorts.', order: 2, isActive: true },
  { _id: 'cat_3', name: 'Adventure', slug: 'adventure', description: 'River rafting, paragliding, ATV rides, and camping.', order: 3, isActive: true },
  { _id: 'cat_4', name: 'International', slug: 'international', description: 'Exotic global destinations, private villas, and island tours.', order: 4, isActive: true },
  { _id: 'cat_5', name: 'Weekend Escapes', slug: 'weekend-escapes', description: 'Quick weekend road trips and basecamp stays from major cities.', order: 5, isActive: true },
  { _id: 'cat_6', name: 'Family Vacation', slug: 'family-vacation', description: 'Comfortable family journeys with sightseeing, safe stays, and curated itineraries.', order: 6, isActive: true },
  { _id: 'cat_7', name: 'Spiritual & Heritage', slug: 'spiritual-heritage', description: 'Sacred pilgrimages, ancient temples, and heritage trails.', order: 7, isActive: true },
];

export const PACKAGES_CACHE_KEY = 'we_cached_packages';
export const CATEGORIES_CACHE_KEY = 'we_cached_categories';

export const getInitialCachedPackages = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PACKAGES_CACHE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { packages: parsed, hasCache: true };
      }
    }
  } catch (err) {
    console.warn('[PackageContext] Error loading cached packages:', err);
  }
  return { packages: DEFAULT_PACKAGES, hasCache: false };
};

export const getInitialCachedCategories = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CATEGORIES_CACHE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[PackageContext] Error loading cached categories:', err);
  }
  return DEFAULT_PACKAGE_CATEGORIES;
};

const PackageContext = createContext();

export function PackageProvider({ children }) {
  const { API_BASE_URL } = useSettings();
  const { token, user } = useAuth();

  const initialPkgRef = React.useRef(null);
  if (!initialPkgRef.current) {
    initialPkgRef.current = getInitialCachedPackages();
  }

  const [packages, setPackages] = useState(initialPkgRef.current.packages);
  const [categories, setCategories] = useState(() => getInitialCachedCategories());
  const [loading, setLoading] = useState(!initialPkgRef.current.hasCache);
  const [error, setError] = useState(null);

  // Fetch packages from backend with fallback
  const fetchPackages = useCallback(
    async (fetchAll = false) => {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_BASE_URL}/packages${fetchAll ? '?all=true' : ''}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(PACKAGES_CACHE_KEY, JSON.stringify(data.packages));
              }
            } catch (e) {}
            setLoading(false);
            return data.packages;
          }
        }
        setPackages((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_PACKAGES));
      } catch (err) {
        console.warn('[PackageContext] Backend unreachable, using fallback packages:', err.message);
        setPackages((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_PACKAGES));
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return DEFAULT_PACKAGES;
    },
    [API_BASE_URL]
  );

  // Fetch categories from backend with fallback
  const fetchCategories = useCallback(
    async (fetchAll = false) => {
      try {
        const url = `${API_BASE_URL}/packages/categories/all${fetchAll ? '?all=true' : ''}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(data.categories));
              }
            } catch (e) {}
            return data.categories;
          }
        }
        setCategories((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_PACKAGE_CATEGORIES));
      } catch (err) {
        console.warn('[PackageContext] Using fallback categories:', err.message);
        setCategories((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_PACKAGE_CATEGORIES));
      }
      return DEFAULT_PACKAGE_CATEGORIES;
    },
    [API_BASE_URL]
  );

  // Initial load
  useEffect(() => {
    fetchPackages(!!user);
    fetchCategories(!!user);
  }, [fetchPackages, fetchCategories, user]);

  // Synchronous or asynchronous getter
  const getPackageById = useCallback(
    (id) => {
      if (!id) return packages[0] || DEFAULT_PACKAGES[0];
      const found = packages.find((p) => p.id === id || p._id === id);
      if (found) return found;
      return DEFAULT_PACKAGES.find((p) => p.id === id) || packages[0] || DEFAULT_PACKAGES[0];
    },
    [packages]
  );

  // Admin: Create package
  const createPackage = async (packageData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create package');
      }

      await fetchPackages(true);
      return { success: true, package: data.package };
    } catch (err) {
      console.error('[PackageContext] createPackage error:', err);
      const newPkg = {
        ...packageData,
        id: packageData.id || packageData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        _id: `local_${Date.now()}`,
      };
      setPackages((prev) => [newPkg, ...prev]);
      return { success: true, package: newPkg, warning: 'Saved locally' };
    }
  };

  // Admin: Update package
  const updatePackage = async (id, packageData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update package');
      }

      await fetchPackages(true);
      return { success: true, package: data.package };
    } catch (err) {
      console.error('[PackageContext] updatePackage error:', err);
      setPackages((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? { ...p, ...packageData } : p))
      );
      return { success: true, warning: 'Updated locally' };
    }
  };

  // Admin: Delete package
  const deletePackage = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete package');
      }

      await fetchPackages(true);
      return { success: true };
    } catch (err) {
      console.error('[PackageContext] deletePackage error:', err);
      setPackages((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      return { success: true, warning: 'Deleted locally' };
    }
  };

  // Admin: Reset / Sync default packages
  const seedPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to sync default packages');
      }

      await fetchPackages(true);
      return { success: true, packages: data.packages };
    } catch (err) {
      console.error('[PackageContext] seedPackages error:', err);
      setPackages(DEFAULT_PACKAGES);
      return { success: true, packages: DEFAULT_PACKAGES, warning: 'Defaults loaded locally' };
    }
  };

  // ── CATEGORY CRUD ──
  const createCategory = async (categoryData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create category');
      }

      await fetchCategories(true);
      return { success: true, category: data.category };
    } catch (err) {
      console.error('[PackageContext] createCategory error:', err);
      const newCat = {
        _id: `local_cat_${Date.now()}`,
        name: categoryData.name,
        slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: categoryData.description || '',
        order: categoryData.order || categories.length + 1,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      };
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat, warning: 'Category added locally' };
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update category');
      }

      await fetchCategories(true);
      return { success: true, category: data.category };
    } catch (err) {
      console.error('[PackageContext] updateCategory error:', err);
      setCategories((prev) =>
        prev.map((c) => (c._id === id || c.slug === id ? { ...c, ...categoryData } : c))
      );
      return { success: true, warning: 'Category updated locally' };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category');
      }

      await fetchCategories(true);
      return { success: true };
    } catch (err) {
      console.error('[PackageContext] deleteCategory error:', err);
      setCategories((prev) => prev.filter((c) => c._id !== id && c.slug !== id));
      return { success: true, warning: 'Category deleted locally' };
    }
  };

  // ── AVAILABILITY & BATCHES ──
  const checkAvailability = async (packageId, date, travelers = 1) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/packages/${packageId}/availability?date=${date}&travelers=${travelers}`
      );
      if (res.ok) {
        return await res.json();
      }
      return { success: false, available: true, seatsLeft: 10, status: 'available' };
    } catch (err) {
      console.warn('[PackageContext] Availability check fallback:', err.message);
      return { success: true, available: true, seatsLeft: 12, status: 'available' };
    }
  };

  const getUpcomingSlots = async (packageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${packageId}/slots`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[PackageContext] Upcoming slots fallback:', err.message);
    }
    return { success: false, slots: [] };
  };

  const seedPackageFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/seed-faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        await fetchPackages(true);
      }
      return data;
    } catch (err) {
      console.error('[PackageContext] seedPackageFaqs error:', err);
      return { success: false, message: err.message };
    }
  };

  const trendingPackages = packages.filter((p) => p.isTrending !== false);
  const categoryNames = categories.map((c) => c.name);

  const value = {
    packages,
    trendingPackages,
    categories,
    categoryNames,
    loading,
    error,
    refreshPackages: fetchPackages,
    refreshCategories: fetchCategories,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    seedPackages,
    seedPackageFaqs,
    createCategory,
    updateCategory,
    deleteCategory,
    checkAvailability,
    getUpcomingSlots,
  };

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
}
