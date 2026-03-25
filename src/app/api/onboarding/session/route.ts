// src/app/api/onboarding/session/route.ts
// GET : état de la session d'onboarding courante

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveSession } from '@/lib/supabase/queries/onboarding'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const session = await getActiveSession(user.id)

  if (!session) {
    return NextResponse.json({ session: null })
  }

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      currentBloc: session.currentBloc,
      answeredKeys: session.answers.map((a: any) => a.questionKey),
    },
  })
}
