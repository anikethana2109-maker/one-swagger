import { HistoryItem } from '../../../types/http';

const STORAGE_KEY = 'oneswagger_history_v1';
const MAX_HISTORY_ITEMS = 100;

export function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse history from localStorage', err);
    return [];
  }
}

export function saveLocalHistoryItem(item: HistoryItem): void {
  try {
    const current = getLocalHistory();
    const updated = [item, ...current.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history item to localStorage', err);
  }
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history from localStorage', err);
  }
}

export function exportHistoryAsJson(): void {
  const history = getLocalHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `one-swagger-history-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
