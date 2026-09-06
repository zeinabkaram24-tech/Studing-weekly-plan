import { MaterialItem } from '../types';
import { INITIAL_MATERIALS_DATA } from '../data/materialsData';

const STORAGE_KEY = 'g2b_school_materials_v6_clean';
const OLD_STORAGE_KEYS = [
  'g2b_school_materials_v5',
  'g2b_school_materials_v4',
  'g2b_school_materials_v3',
  'g2b_school_materials_v2',
];

// Identifiers of old mock/placeholder items that the user requested to delete
const OLD_MOCK_PREFIXES = [
  'mat-sci-',
  'mat-eng-',
  'mat-math-',
  'mat-ar-',
  'mat-french-',
  'mat-ger-',
  'mat-ict-',
  'mat-soc-',
  'mat-pe-',
  'mat-art-',
  'mat-mus-',
];

function isMockItem(item: MaterialItem): boolean {
  if (!item || !item.id) return false;
  return OLD_MOCK_PREFIXES.some((prefix) => item.id.startsWith(prefix));
}

export function getSavedMaterials(): MaterialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Clean out any religion items or old mock items
        const cleaned = parsed.filter(
          (m: MaterialItem) => m.subjectId !== 'religion' && !isMockItem(m)
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }

    // Check old keys if user had uploaded a custom file in week 1 or similar
    for (const oldKey of OLD_STORAGE_KEYS) {
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        try {
          const oldParsed = JSON.parse(oldRaw);
          if (Array.isArray(oldParsed)) {
            // Keep ONLY real user uploads (non-mock items, or items with fileUrl)
            const userOnly = oldParsed.filter(
              (m: MaterialItem) =>
                m.subjectId !== 'religion' &&
                !isMockItem(m) &&
                (m.fileUrl || m.isUserUploaded || m.id.startsWith('mat-1'))
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
            return userOnly;
          }
        } catch {
          // ignore
        }
      }
    }

    // Default: completely empty clean slate
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Failed to load materials from localStorage', err);
    return [];
  }
}

export function saveMaterials(materials: MaterialItem[]): void {
  try {
    const cleaned = materials.filter(
      (m) => m.subjectId !== 'religion' && !isMockItem(m)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save materials to localStorage', err);
  }
}

export function addMaterialItem(item: Omit<MaterialItem, 'id' | 'createdAt'>): MaterialItem {
  const current = getSavedMaterials();
  const newItem: MaterialItem = {
    ...item,
    id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    isUserUploaded: true,
  };
  const updated = [newItem, ...current];
  saveMaterials(updated);
  return newItem;
}

export function deleteMaterialItem(id: string): boolean {
  const current = getSavedMaterials();
  const updated = current.filter((m) => m.id !== id);
  saveMaterials(updated);

  // Sync delete with server
  fetch(`/api/materials/${id}`, { method: 'DELETE' }).catch(() => {});

  return true;
}

/**
 * Remove all mock/placeholder materials, keeping any user uploaded files.
 */
export function clearDefaultMaterials(): MaterialItem[] {
  const current = getSavedMaterials();
  const userUploadedOnly = current.filter((m) => !isMockItem(m));
  saveMaterials(userUploadedOnly);

  fetch('/api/materials/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materials: userUploadedOnly }),
  }).catch(() => {});

  return userUploadedOnly;
}

/**
 * Clear all materials completely
 */
export function clearAllMaterials(): MaterialItem[] {
  saveMaterials([]);
  fetch('/api/materials/clear-all', { method: 'POST' }).catch(() => {});
  return [];
}

export function resetToDefaultMaterials(): MaterialItem[] {
  saveMaterials([]);
  fetch('/api/materials/clear-all', { method: 'POST' }).catch(() => {});
  return [];
}
