/**
 * Dev-only: Create the admin account and seed Firestore.
 * Run from browser console: setupAdmin()
 */
import { registerWithEmail, loginWithEmail } from './auth';
import { seedFirestore } from './seed';

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
