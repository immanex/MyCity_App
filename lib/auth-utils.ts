import prisma from './prisma';
import { User } from '@supabase/supabase-js';

/**
 * Syncs a Supabase user with the Prisma database.
 * This should be called after a successful sign-in or on the first visit to a protected route.
 */
export async function syncUser(supabaseUser: User) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          fullName: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
          profileImage: supabaseUser.user_metadata.avatar_url,
          role: 'USER',
        }
      });
      console.log(`Synced new user: ${supabaseUser.email}`);
    }
  } catch (error) {
    console.error('Error syncing user:', error);
  }
}
