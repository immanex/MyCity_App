import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncUser } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await syncUser(user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
