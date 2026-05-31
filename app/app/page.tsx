import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const name = profile?.display_name ?? user.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="text-center max-w-sm px-6">
        <span className="material-symbols-outlined text-[48px] text-primary mb-4 block">
          health_metrics
        </span>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground mb-2">
          Welcome, {name}.
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Your dashboard is being built. <em>Quiet Intelligence</em> coming soon.
        </p>
      </div>
    </div>
  )
}
