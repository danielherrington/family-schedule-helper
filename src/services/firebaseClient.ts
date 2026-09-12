import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { EventTemplate, Caregiver, Child, CaregiverTravel } from '../types/schedule';

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
  travels?: CaregiverTravel[];
  updatedAt?: string;
  updatedBy?: string;
}

export const isStaging = typeof window !== 'undefined' && (
  window.location.hostname.includes('staging') ||
  window.location.hostname.includes('localhost') ||
  window.location.hostname === '127.0.0.1'
);

export const DOC_NAME = isStaging ? 'setup_staging' : 'setup';
const FAMILY_DOC_REF = doc(db, 'family', DOC_NAME);
const PROD_DOC_REF = doc(db, 'family', 'setup');

/**
 * Strips undefined properties recursively so Cloud Firestore does not throw serialization errors
 */
function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Saves blueprints to shared Cloud Firestore
 */
export async function saveSharedBlueprints(blueprints: EventTemplate[]): Promise<boolean> {
  try {
    const cleanBlueprints = cleanForFirestore(blueprints);
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        blueprints: cleanBlueprints, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
    console.log(`[Firestore] Successfully saved ${cleanBlueprints.length} blueprints to /family/${DOC_NAME}`);
    return true;
  } catch (err) {
    console.error('[Firestore] saveSharedBlueprints error:', err);
    return false;
  }
}

/**
 * Saves caregivers to shared Cloud Firestore
 */
export async function saveSharedCaregivers(caregivers: Caregiver[]): Promise<boolean> {
  try {
    const cleanCaregivers = cleanForFirestore(caregivers);
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        caregivers: cleanCaregivers, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
    console.log(`[Firestore] Successfully saved ${cleanCaregivers.length} caregivers to /family/${DOC_NAME}`);
    return true;
  } catch (err) {
    console.error('[Firestore] saveSharedCaregivers error:', err);
    return false;
  }
}

/**
 * Saves children list to shared Cloud Firestore
 */
export async function saveSharedKids(children: Child[]): Promise<boolean> {
  try {
    const cleanKids = cleanForFirestore(children);
    await setDoc(
      FAMILY_DOC_REF, 
      { 
        children: cleanKids, 
        updatedAt: new Date().toISOString() 
      }, 
      { merge: true }
    );
    console.log(`[Firestore] Successfully saved ${cleanKids.length} children to /family/${DOC_NAME}`);
    return true;
  } catch (err) {
    console.error('[Firestore] saveSharedKids error:', err);
    return false;
  }
}

/**
 * Saves caregiver Google Calendar mappings to shared Cloud Firestore
 */
export async function saveSharedCalendarMappings(
  calendarMappings: Record<string, { calendarId: string; calendarName: string }>
): Promise<boolean> {
  try {
    const cleanMappings = cleanForFirestore(calendarMappings);
    await setDoc(
      FAMILY_DOC_REF,
      {
        calendarMappings: cleanMappings,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log(`[Firestore] Successfully saved calendar mappings to /family/${DOC_NAME}`);
    return true;
  } catch (err) {
    console.error('[Firestore] saveSharedCalendarMappings error:', err);
    return false;
  }
}

/**
 * Saves caregiver travel records to shared Cloud Firestore
 */
export async function saveSharedTravels(travels: CaregiverTravel[]): Promise<boolean> {
  try {
    const cleanTravels = cleanForFirestore(travels);
    await setDoc(
      FAMILY_DOC_REF,
      {
        travels: cleanTravels,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log(`[Firestore] Successfully saved ${cleanTravels.length} travel records to /family/${DOC_NAME}`);
    return true;
  } catch (err) {
    console.error('[Firestore] saveSharedTravels error:', err);
    return false;
  }
}

/**
 * One-time fetch of family setup from Cloud Firestore.
 * If in staging and no staging document exists yet, auto-initializes with a copy of prod setup.
 */
export async function fetchSharedFamilySetup(): Promise<FamilySetupDoc | null> {
  try {
    const snap = await getDoc(FAMILY_DOC_REF);
    if (snap.exists()) {
      return snap.data() as FamilySetupDoc;
    }
    
    // Auto-seed staging from prod on first staging load
    if (isStaging) {
      const prodSnap = await getDoc(PROD_DOC_REF);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data() as FamilySetupDoc;
        await setDoc(FAMILY_DOC_REF, {
          ...prodData,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Auto-seeded from Production'
        });
        return prodData;
      }
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetchSharedFamilySetup error:', err);
    return null;
  }
}

/**
 * Copies latest production setup to staging setup in Cloud Firestore
 */
export async function copyProdSetupToStaging(): Promise<boolean> {
  try {
    const snap = await getDoc(PROD_DOC_REF);
    if (snap.exists()) {
      const prodData = snap.data() as FamilySetupDoc;
      await setDoc(
        doc(db, 'family', 'setup_staging'),
        {
          ...prodData,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Copied from Production'
        }
      );
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error copying prod setup to staging:', err);
    return false;
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
