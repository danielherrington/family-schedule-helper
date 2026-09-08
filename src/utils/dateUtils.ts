/**
 * Date utilities for schedule handling and filtering.
 */

export const getTodayDateStr = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks whether a given YYYY-MM-DD date is today or in the future.
 * Returns true if dateStr >= today's date in local time.
 */
export const isTodayOrUpcoming = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const todayStr = getTodayDateStr();
  return dateStr >= todayStr;
};

/**
 * Checks whether an event date is strictly in the past (before today).
 * Returns true if dateStr < today's date in local time.
 */
export const isPastDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const todayStr = getTodayDateStr();
  return dateStr < todayStr;
};
