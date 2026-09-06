import { MaterialItem } from '../types';
import { INITIAL_MATERIALS_DATA } from '../data/materialsData';

const STORAGE_KEY = 'g2b_school_materials_v4';

export function getSavedMaterials(): MaterialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS_DATA));
      return INITIAL_MATERIALS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Remove any religion item if previously saved
      const cleaned = parsed.filter((m: MaterialItem) => m.subjectId !== 'religion');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return INITIAL_MATERIALS_DATA;
  } catch (err) {
    console.error('Failed to load materials from localStorage', err);
    return INITIAL_MATERIALS_DATA;
  }
}

export function saveMaterials(materials: MaterialItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
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
  };
  const updated = [newItem, ...current];
  saveMaterials(updated);
  return newItem;
}

export function deleteMaterialItem(id: string): boolean {
  const current = getSavedMaterials();
  const updated = current.filter((m) => m.id !== id);
  saveMaterials(updated);
  return true;
}

export function resetToDefaultMaterials(): MaterialItem[] {
  saveMaterials(INITIAL_MATERIALS_DATA);
  return INITIAL_MATERIALS_DATA;
}
