import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, email, password, phoneNumber, agencyName } = data;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'AGENT'
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 2. Create user in Prisma DB
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        fullName,
        phoneNumber,
        role: 'AGENT',
        agentMetadata: {
          create: {
            agencyName: agencyName || 'Independent Agent'
          }
        }
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
