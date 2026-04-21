/**
 * Dev-only: Create the admin account and seed Firestore.
 * Run from browser console: setupAdmin()
 */
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, getFirestore as getFirestoreLite, setDoc } from 'firebase/firestore/lite';
import app, { auth } from '../config/firebase';
import { registerWithEmail, loginWithEmail } from './auth';
import { seedFirestore } from './seed';
import type { UserDoc } from '../types/firestore';

interface CashierAccountInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  assignedBranchId?: string;
}

const OFFICIAL_CASHIER_ACCOUNTS: Record<'catmonUno' | 'catmonDos' | 'pardo', CashierAccountInput> = {
  catmonUno: {
    email: 'cashier.catmonuno@beyondjcgroupopc.com',
    password: 'BeyondJcCashierCatmonUno123!',
    name: 'BJC Cashier - Catmon Uno',
    phone: '9000000001',
    assignedBranchId: '1',
  },
  catmonDos: {
    email: 'cashier.catmondos@beyondjcgroupopc.com',
    password: 'BeyondJcCashierCatmonDos123!',
    name: 'BJC Cashier - Catmon Dos',
    phone: '9000000002',
    assignedBranchId: '2',
  },
  pardo: {
    email: 'cashier.pardouno@beyondjcgroupopc.com',
    password: 'BeyondJcCashierPardo123!',
    name: 'BJC Cashier - Pardo Uno',
    phone: '9000000003',
    assignedBranchId: '6',
  },
};

async function ensureAdminSession(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Login as ADMIN in the app first, then run setupOfficialCashierAccounts().');
  }

  const primaryLiteDb = getFirestoreLite(app);
  const snap = await getDoc(doc(primaryLiteDb, 'users', currentUser.uid));
  if (!snap.exists() || (snap.data() as UserDoc).role !== 'ADMIN') {
    throw new Error('Current signed-in account is not ADMIN. Cashier provisioning is admin-only.');
  }
}

function mapProvisioningError(err: unknown): Error {
  const code = (err as { code?: string })?.code ?? '';
  const message = String((err as { message?: string })?.message ?? err ?? '');

  if (code === 'auth/operation-not-allowed') {
    return new Error('Enable Email/Password sign-in in Firebase Authentication, then run setup again.');
  }

  if (code === 'auth/wrong-password') {
    return new Error('Cashier email already exists with a different password. Use the existing password or reset it in Firebase Auth.');
  }

  if (code === 'auth/invalid-email') {
    return new Error('Invalid cashier email format. Please review configured official cashier emails.');
  }

  if (message.includes('ERR_BLOCKED_BY_CLIENT')) {
    return new Error('Browser extension/shield blocked Firestore requests. Disable ad blocker/shields for this site and try again.');
  }

  if (message.includes('Missing or insufficient permissions')) {
    return new Error('Firestore permission denied. Make sure you are logged in as ADMIN before running cashier setup.');
  }

  return err instanceof Error ? err : new Error(message || 'Cashier provisioning failed.');
}

async function upsertCashierDocAsOwner(input: CashierAccountInput): Promise<string> {
  const secondaryApp = initializeApp(app.options, `cashier-provision-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryLiteDb = getFirestoreLite(secondaryApp);

  try {
    let credential;

    try {
      credential = await createUserWithEmailAndPassword(secondaryAuth, input.email, input.password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;

      if (code !== 'auth/email-already-in-use') {
        throw err;
      }

      // Existing account: sign in and sync cashier profile fields.
      credential = await signInWithEmailAndPassword(secondaryAuth, input.email, input.password);
    }

    const uid = credential.user.uid;
    const existingSnap = await getDoc(doc(secondaryLiteDb, 'users', uid));
    const existing = existingSnap.exists() ? (existingSnap.data() as UserDoc) : undefined;
    const cashierDoc = buildCashierDoc(uid, input, existing);

    // Use secondary cashier auth so rules `isOwner(userId)` allow create/update.
    await setDoc(doc(secondaryLiteDb, 'users', uid), cashierDoc, { merge: true });
    return uid;
  } finally {
    try {
      await signOut(secondaryAuth);
    } catch {
      // No-op: secondary auth may not be signed in.
    }
    await deleteApp(secondaryApp);
  }
}

function buildCashierDoc(uid: string, input: CashierAccountInput, existing?: Partial<UserDoc>): UserDoc {
  const createdAt = existing?.createdAt ?? new Date();
  const assignedBranchId = input.assignedBranchId ?? existing?.assignedBranchId;

  return {
    userId: uid,
    name: input.name,
    email: input.email,
    phone: input.phone,
    loyaltyPoints: existing?.loyaltyPoints ?? 0,
    role: 'CASHIER',
    assignedBranchId,
    // If branch is assigned, make it active immediately for first login.
    activeBranchId: assignedBranchId ?? existing?.activeBranchId,
    createdAt,
  };
}

export async function setupCashierAccount(customInput: Partial<CashierAccountInput> = {}) {
  await ensureAdminSession();

  const input: CashierAccountInput = {
    ...OFFICIAL_CASHIER_ACCOUNTS.catmonUno,
    ...customInput,
  };

  if (!input.email || !input.password || !input.name || !input.phone) {
    throw new Error('Cashier account requires email, password, name, and phone.');
  }

  console.log(`[Setup] Provisioning cashier account for ${input.email}…`);
  try {
    const uid = await upsertCashierDocAsOwner(input);
    console.log(`[Setup] Cashier account ready ✓ (uid: ${uid})`);
    return { uid, email: input.email };
  } catch (err: unknown) {
    throw mapProvisioningError(err);
  }
}

export async function setupOfficialCashierAccount(branch: 'catmonUno' | 'catmonDos' | 'pardo' = 'catmonUno') {
  return setupCashierAccount(OFFICIAL_CASHIER_ACCOUNTS[branch]);
}

export async function setupOfficialCashierAccounts() {
  console.log('[Setup] Provisioning official cashier accounts (Catmon Uno, Catmon Dos, Pardo)…');

  const results: Array<{ branch: string; uid: string; email: string }> = [];
  for (const [branch, account] of Object.entries(OFFICIAL_CASHIER_ACCOUNTS)) {
    const created = await setupCashierAccount(account);
    results.push({ branch, ...created });
  }

  console.log('[Setup] Official cashier accounts are ready ✓');
  return results;
}

export async function setupAdmin() {
  const email = 'jomar@beyondjcgroupopc.com';
  const password = 'Beyondjcgroupopcadmin123!';
  const name = 'Jomar B. Colao';
  const phone = '9000000000';

  console.log('[Setup] Creating admin account…');
  try {
    await registerWithEmail(email, password, name, phone, 'ADMIN');
    console.log('[Setup] Admin account created ✓');
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-in-use') {
      console.log('[Setup] Admin account already exists, logging in…');
      await loginWithEmail(email, password);
    } else {
      throw err;
    }
  }

  console.log('[Setup] Seeding Firestore…');
  await seedFirestore();
  console.log('[Setup] All done ✓ — 66 products, 6 branches seeded.');
}
