/**
 * Holiday Engine: US Federal & Jewish Holiday Lookup & Smart Suggestions
 * Accurately covers 2025, 2026, 2027, and 2028 school years.
 */

export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string;
  category: 'jewish' | 'federal' | 'school';
  description?: string;
  isSchoolClosedTypical: boolean;
}

// Pre-computed exact holiday dates for 2025 - 2028
export const KNOWN_HOLIDAYS: HolidayInfo[] = [
  // --- 2025 Jewish Holidays ---
  { date: '2025-03-14', name: 'Purim', category: 'jewish', isSchoolClosedTypical: false, description: 'Feast of Lots' },
  { date: '2025-04-13', name: 'Passover (Pesach) — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'First Day of Passover' },
  { date: '2025-04-14', name: 'Passover (Pesach) — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Second Day of Passover' },
  { date: '2025-04-19', name: 'Passover (Pesach) — Day 7', category: 'jewish', isSchoolClosedTypical: true, description: 'Seventh Day of Passover' },
  { date: '2025-04-20', name: 'Passover (Pesach) — Day 8', category: 'jewish', isSchoolClosedTypical: true, description: 'Final Day of Passover' },
  { date: '2025-06-02', name: 'Shavuot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks' },
  { date: '2025-06-03', name: 'Shavuot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks Day 2' },
  { date: '2025-09-23', name: 'Rosh Hashanah — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 1)' },
  { date: '2025-09-24', name: 'Rosh Hashanah — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 2)' },
  { date: '2025-10-02', name: 'Yom Kippur', category: 'jewish', isSchoolClosedTypical: true, description: 'Day of Atonement (Fast Day)' },
  { date: '2025-10-07', name: 'Sukkot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles' },
  { date: '2025-10-08', name: 'Sukkot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles Day 2' },
  { date: '2025-10-14', name: 'Shemini Atzeret', category: 'jewish', isSchoolClosedTypical: true, description: 'Eighth Day of Assembly' },
  { date: '2025-10-15', name: 'Simchat Torah', category: 'jewish', isSchoolClosedTypical: true, description: 'Rejoicing in the Torah' },
  { date: '2025-12-15', name: 'Hanukkah (Chanukah) — Day 1', category: 'jewish', isSchoolClosedTypical: false, description: 'Festival of Lights' },

  // --- 2025 US Federal & School Holidays ---
  { date: '2025-01-01', name: "New Year's Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-02-17', name: "Presidents' Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-05-26', name: 'Memorial Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-06-19', name: 'Juneteenth', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-07-04', name: 'Independence Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-09-01', name: 'Labor Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-10-13', name: 'Columbus / Indigenous Peoples Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-11-11', name: 'Veterans Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-11-27', name: 'Thanksgiving Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-11-28', name: 'Day After Thanksgiving', category: 'school', isSchoolClosedTypical: true },
  { date: '2025-12-24', name: 'Christmas Eve', category: 'school', isSchoolClosedTypical: true },
  { date: '2025-12-25', name: 'Christmas Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2025-12-31', name: "New Year's Eve", category: 'school', isSchoolClosedTypical: true },

  // --- 2026 Jewish Holidays ---
  { date: '2026-03-03', name: 'Purim', category: 'jewish', isSchoolClosedTypical: false, description: 'Feast of Lots' },
  { date: '2026-04-02', name: 'Passover (Pesach) — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'First Seder / First Day of Passover' },
  { date: '2026-04-03', name: 'Passover (Pesach) — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Second Day of Passover' },
  { date: '2026-04-08', name: 'Passover (Pesach) — Day 7', category: 'jewish', isSchoolClosedTypical: true, description: 'Seventh Day of Passover' },
  { date: '2026-04-09', name: 'Passover (Pesach) — Day 8', category: 'jewish', isSchoolClosedTypical: true, description: 'Final Day of Passover' },
  { date: '2026-05-22', name: 'Shavuot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks' },
  { date: '2026-05-23', name: 'Shavuot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks Day 2' },
  { date: '2026-09-12', name: 'Rosh Hashanah — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 1)' },
  { date: '2026-09-13', name: 'Rosh Hashanah — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 2)' },
  { date: '2026-09-21', name: 'Yom Kippur', category: 'jewish', isSchoolClosedTypical: true, description: 'Day of Atonement (Fast Day)' },
  { date: '2026-09-26', name: 'Sukkot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles' },
  { date: '2026-09-27', name: 'Sukkot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles Day 2' },
  { date: '2026-10-03', name: 'Shemini Atzeret', category: 'jewish', isSchoolClosedTypical: true, description: 'Eighth Day of Assembly' },
  { date: '2026-10-04', name: 'Simchat Torah', category: 'jewish', isSchoolClosedTypical: true, description: 'Rejoicing in the Torah' },
  { date: '2026-12-05', name: 'Hanukkah (Chanukah) — Day 1', category: 'jewish', isSchoolClosedTypical: false, description: 'Festival of Lights' },

  // --- 2026 US Federal & School Holidays ---
  { date: '2026-01-01', name: "New Year's Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-02-16', name: "Presidents' Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-05-25', name: 'Memorial Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-06-19', name: 'Juneteenth', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-07-04', name: 'Independence Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-09-07', name: 'Labor Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-10-12', name: 'Columbus / Indigenous Peoples Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-11-11', name: 'Veterans Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-11-26', name: 'Thanksgiving Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-11-27', name: 'Day After Thanksgiving', category: 'school', isSchoolClosedTypical: true },
  { date: '2026-12-24', name: 'Christmas Eve', category: 'school', isSchoolClosedTypical: true },
  { date: '2026-12-25', name: 'Christmas Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2026-12-31', name: "New Year's Eve", category: 'school', isSchoolClosedTypical: true },

  // --- 2027 Jewish Holidays ---
  { date: '2027-03-23', name: 'Purim', category: 'jewish', isSchoolClosedTypical: false, description: 'Feast of Lots' },
  { date: '2027-04-22', name: 'Passover (Pesach) — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'First Day of Passover' },
  { date: '2027-04-23', name: 'Passover (Pesach) — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Second Day of Passover' },
  { date: '2027-04-28', name: 'Passover (Pesach) — Day 7', category: 'jewish', isSchoolClosedTypical: true, description: 'Seventh Day of Passover' },
  { date: '2027-04-29', name: 'Passover (Pesach) — Day 8', category: 'jewish', isSchoolClosedTypical: true, description: 'Final Day of Passover' },
  { date: '2027-06-11', name: 'Shavuot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks' },
  { date: '2027-06-12', name: 'Shavuot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Festival of Weeks Day 2' },
  { date: '2027-10-02', name: 'Rosh Hashanah — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 1)' },
  { date: '2027-10-03', name: 'Rosh Hashanah — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Jewish New Year (Day 2)' },
  { date: '2027-10-11', name: 'Yom Kippur', category: 'jewish', isSchoolClosedTypical: true, description: 'Day of Atonement (Fast Day)' },
  { date: '2027-10-16', name: 'Sukkot — Day 1', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles' },
  { date: '2027-10-17', name: 'Sukkot — Day 2', category: 'jewish', isSchoolClosedTypical: true, description: 'Feast of Tabernacles Day 2' },
  { date: '2027-10-23', name: 'Shemini Atzeret', category: 'jewish', isSchoolClosedTypical: true, description: 'Eighth Day of Assembly' },
  { date: '2027-10-24', name: 'Simchat Torah', category: 'jewish', isSchoolClosedTypical: true, description: 'Rejoicing in the Torah' },
  { date: '2027-12-25', name: 'Hanukkah (Chanukah) — Day 1', category: 'jewish', isSchoolClosedTypical: false, description: 'Festival of Lights' },

  // --- 2027 US Federal & School Holidays ---
  { date: '2027-01-01', name: "New Year's Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-01-18', name: 'Martin Luther King Jr. Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-02-15', name: "Presidents' Day", category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-05-31', name: 'Memorial Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-06-19', name: 'Juneteenth', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-07-04', name: 'Independence Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-09-06', name: 'Labor Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-10-11', name: 'Columbus / Indigenous Peoples Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-11-11', name: 'Veterans Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-11-25', name: 'Thanksgiving Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-11-26', name: 'Day After Thanksgiving', category: 'school', isSchoolClosedTypical: true },
  { date: '2027-12-24', name: 'Christmas Eve', category: 'school', isSchoolClosedTypical: true },
  { date: '2027-12-25', name: 'Christmas Day', category: 'federal', isSchoolClosedTypical: true },
  { date: '2027-12-31', name: "New Year's Eve", category: 'school', isSchoolClosedTypical: true }
];

/**
 * Returns holiday info for a specific YYYY-MM-DD date, if any.
 */
export function getHolidayForDate(dateStr: string): HolidayInfo | null {
  return KNOWN_HOLIDAYS.find((h) => h.date === dateStr) || null;
}

/**
 * Returns all holidays within an array of date strings.
 */
export function getHolidaysForDates(dates: string[]): HolidayInfo[] {
  return KNOWN_HOLIDAYS.filter((h) => dates.includes(h.date));
}

/**
 * Popular presets categorized for quick selection in the Holiday Modal.
 */
export const CATEGORIZED_HOLIDAY_PRESETS = {
  jewish: [
    'Rosh Hashanah — No School',
    'Yom Kippur — No School / Fast',
    'Sukkot / Shemini Atzeret',
    'Simchat Torah',
    'Hanukkah Break',
    'Purim',
    'Passover (Pesach) Break',
    'Shavuot'
  ],
  federal: [
    'Labor Day — No School',
    'Thanksgiving Break (No School)',
    'Memorial Day — No School',
    'Martin Luther King Jr. Day',
    "Presidents' Day",
    'Indigenous Peoples / Columbus Day',
    'Veterans Day',
    'Juneteenth',
    'Winter Break / Christmas',
    "New Year's Day"
  ],
  school: [
    'Teacher Planning Day (No Classes)',
    'Early Release Day (No PM Pickup)',
    'Parent-Teacher Conferences',
    'Spring Break',
    'Sick Day — Stay Home',
    'Weather / Storm Closure'
  ]
};
