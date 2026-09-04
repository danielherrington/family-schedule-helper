# 🚗 Family Schedule Helper & Dispatch

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_TypeScript-61dafb.svg)](https://reactjs.org/)
[![Node/Express](https://img.shields.io/badge/Backend-Node_%2B_Express_%2B_Google_Calendar_v3-339933.svg)](https://nodejs.org/)

A lightweight, mobile-first web app for multi-caregiver families (parents, nannies, grandparents, babysitters) to coordinate, reassign, and synchronize kid drop-offs and pick-ups across shared Google Calendars—**without breaking recurring events or duplicating calendar clutter**.

---

## 💥 The Problem Solved: Recurrence Isolation

When coordinating multiple children across separate shared Google Calendars:
1. Moving or copying a repeating event to another person's calendar **clones the entire recurring series (`RRULE`)**, flooding calendars with dozens of duplicate phantom events.
2. Managing 10+ overlapping colored calendars creates extreme cognitive overload.
3. Last-minute handoffs ("I'm stuck in a meeting, can you pick up Vale at 3pm?") take 6–8 tedious manual steps.

### The Atomic Recurrence Splitter:
- Queries `calendar.events.instances` for date $D$.
- Marks the instance on the source calendar as `status: 'cancelled'` (suppressing that day's notification).
- Inserts an isolated single event on the recipient caregiver's calendar with metadata linking to the master series.
- **The master recurring rule remains 100% clean and untouched.**

---

## ✨ Features

- 📱 **Mobile-First Checkbox Matrix**: Large, touch-friendly caregiver checkbox chips (`[🔘 Daniel] [⚪ Elizabeth] [⚪ Lucila] [⚪ Matilde]`). 1 tap reassigns the duty for that day.
- 📅 **Weekly Matrix & Daily Dispatch Views**: Full-week 7-day overview with child filtering and gap detection.
- 🌴 **Holiday & No Class Handling**: 1-tap cancellation for school holidays (Labor Day, Teacher Planning Days, snow days) or single class cancellations with custom reasons.
- 👥 **3-Pillar Family Setup Hub**:
  - **Caregivers**: Manage roster, roles, color themes, and linked Google Calendar IDs.
  - **Kids**: Manage children, schools, and custom color badges.
  - **Event Blueprint**: Define repeating weekly routines and generate any week in 1 click.
- 🔒 **Manager OAuth Access**: Parents authenticate once; caregivers (nannies, grandparents) receive updates on their native Apple / Google calendars without needing logins.
- 📋 **Atomic Exception Audit Log**: Verifiable log of every single-instance override created.

---

## 🚀 Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/danielherrington/family-schedule-helper.git
cd family-schedule-helper
npm install
```

### 2. Run in Development
```bash
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 🔑 Google Calendar API Setup (Optional for Live Mode)

To enable live synchronization with Google Calendar:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Calendar API**.
3. Create an **OAuth 2.0 Client ID (Web Application)**:
   - Authorized Javascript Origins: `http://localhost:5173`, `https://your-domain.web.app`
   - Authorized Redirect URIs: `http://localhost:5173/oauth/callback`, `https://your-domain.web.app/oauth/callback`
4. Copy credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
PORT=3001
```

---

## 📄 License
MIT License. Free for families and open-source contributors to use and adapt!
