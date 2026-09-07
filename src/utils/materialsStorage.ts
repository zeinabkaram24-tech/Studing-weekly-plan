import { MaterialItem } from '../types';
import { INITIAL_MATERIALS_DATA } from '../data/materialsData';
import { deleteMaterialBlob, deleteMultipleMaterialBlobs } from './materialsDb';

const STORAGE_KEY = 'g2b_school_materials_v4';

export function getSavedMaterials(): MaterialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS_DATA));
      return INITIAL_MATERIALS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove any religion item if previously saved & normalize category labels to English
      const cleaned = parsed
        .filter((m: MaterialItem) => m && m.subjectId !== 'religion')
        .map((m: MaterialItem) => {
          if (m.category === 'main_sheets' || m.categoryLabel === 'الشيتات الرئيسية') {
            return { ...m, categoryLabel: 'Main Sheets' };
          }
          if (m.category === 'week1' || m.categoryLabel === 'ويك 1') {
            return { ...m, categoryLabel: 'Week 1' };
          }
          if (m.category === 'week2' || m.categoryLabel === 'ويك 2') {
            return { ...m, categoryLabel: 'Week 2' };
          }
          if (m.category === 'week3' || m.categoryLabel === 'ويك 3') {
            return { ...m, categoryLabel: 'Week 3' };
          }
          return m;
        });
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
  deleteMaterialBlob(id);
  return true;
}

export function updateMaterialItem(id: string, updates: Partial<MaterialItem>): MaterialItem | null {
  const current = getSavedMaterials();
  let updatedItem: MaterialItem | null = null;
  const updated = current.map((m) => {
    if (m.id === id) {
      updatedItem = { ...m, ...updates };
      return updatedItem;
    }
    return m;
  });
  if (updatedItem) {
    saveMaterials(updated);
  }
  return updatedItem;
}

export function deleteMultipleMaterialItems(ids: string[]): boolean {
  if (!ids || ids.length === 0) return false;
  const idSet = new Set(ids);
  const current = getSavedMaterials();
  const updated = current.filter((m) => !idSet.has(m.id));
  saveMaterials(updated);
  deleteMultipleMaterialBlobs(ids);
  return true;
}

export function resetToDefaultMaterials(): MaterialItem[] {
  saveMaterials(INITIAL_MATERIALS_DATA);
  return INITIAL_MATERIALS_DATA;
}
