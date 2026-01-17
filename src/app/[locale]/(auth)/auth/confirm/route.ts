import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'recovery' | 'invite' | 'magiclink' | 'signup',
      token_hash,
    });

    if (!error) {
      // Redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to error page or login on failure
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
