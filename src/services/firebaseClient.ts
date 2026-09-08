import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { EventTemplate, Caregiver, Child } from '../types/schedule';

export const firebaseConfig = {
  apiKey: "AIzaSyC7nXGYQOah5puALpFWK75bulFzgiaFwwA",
  authDomain: "family-schedule-helper.firebaseapp.com",
  projectId: "family-schedule-helper",
  storageBucket: "family-schedule-helper.firebasestorage.app",
  messagingSenderId: "86168229528",
  appId: "1:86168229528:web:453a5530ae14adb9f922ed"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface FamilySetupDoc {
  blueprints?: EventTemplate[];
  caregivers?: Caregiver[];
  children?: Child[];
  calendarMappings?: Record<string, { calendarId: string; calendarName: string }>;
  updatedAt?: string;
  updatedBy?: string;
}

const FAMILY_DOC_REF = doc(db, 'family', 'setup');

/**
 * Saves blueprints to shared Cloud Firestore so all family members share the same routine
 */
export async function saveSharedBlueprints(blueprints: EventTemplate[]): Promise<void> {
  try {
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        blueprints, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveSharedBlueprints error:', err);
  }
}

/**
 * Saves caregivers to shared Cloud Firestore
 */
export async function saveSharedCaregivers(caregivers: Caregiver[]): Promise<void> {
  try {
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        caregivers, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveSharedCaregivers error:', err);
  }
}

/**
 * Saves children list to shared Cloud Firestore
 */
export async function saveSharedKids(children: Child[]): Promise<void> {
  try {
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        children, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveSharedKids error:', err);
  }
}

/**
 * Saves caregiver Google Calendar mappings to shared Cloud Firestore
 */
export async function saveSharedCalendarMappings(
  calendarMappings: Record<string, { calendarId: string; calendarName: string }>
): Promise<void> {
  try {
    await setDoc(
      FAMILY_DOC_REF,
      {
        calendarMappings,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveSharedCalendarMappings error:', err);
  }
}

/**
 * One-time fetch of family setup from Cloud Firestore
 */
export async function fetchSharedFamilySetup(): Promise<FamilySetupDoc | null> {
  try {
    const snap = await getDoc(FAMILY_DOC_REF);
    if (snap.exists()) {
      return snap.data() as FamilySetupDoc;
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetchSharedFamilySetup error:', err);
    return null;
  }
}

/**
 * Subscribes to real-time shared family setup changes across all devices
 */
export function subscribeToSharedFamilySetup(
  onUpdate: (data: FamilySetupDoc) => void
): Unsubscribe {
  return onSnapshot(
    FAMILY_DOC_REF,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as FamilySetupDoc);
      }
    },
    (err) => {
      console.warn('Firestore real-time subscription warning:', err);
    }
  );
}
