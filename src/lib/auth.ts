import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

// [FIX BUG #1] Teruskan authOptions agar session tidak selalu null
export async function auth() {
  return await getServerSession(authOptions);
}
