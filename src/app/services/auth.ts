import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserDoc, UserRole } from '../types/firestore';

// ─── Validation helpers ────────────────────────────────────────────

export interface AuthError {
  field?: 'email' | 'password' | 'name' | 'phone';
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Enter a valid 10-digit phone number';
  if (!digits.startsWith('9')) return 'Phone number must start with 9';
  return null;
}

// ─── Register ──────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole = 'CUSTOMER',
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userDoc: UserDoc = {
    userId: user.uid,
    name,
    email,
    phone,
    loyaltyPoints: 0,
    role,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), userDoc);

  // Send email verification
  await sendEmailVerification(user);

  return user;
}

// ─── Login ─────────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ─── Google Sign-In ────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export interface GoogleLoginResult {
  user: User;
  needsProfileCompletion: boolean;
}

export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Check if user doc exists
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    // First-time Google sign-in — create a stub doc, profile completion needed
    const userDoc: UserDoc = {
      userId: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      phone: '',
      loyaltyPoints: 0,
      role: 'CUSTOMER',
      createdAt: new Date(),
    };
    await setDoc(userRef, userDoc);
    return { user, needsProfileCompletion: true };
  }

  // Existing user — check if phone/name is missing
  const data = existing.data() as UserDoc;
  const needsCompletion = !data.name || !data.phone;
  return { user, needsProfileCompletion: needsCompletion };
}

// ─── Logout ────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await signOut(auth);
}

// ─── User profile ──────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserDoc>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ─── Auth listener ─────────────────────────────────────────────────

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── Firebase error to friendly message ────────────────────────────

export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
