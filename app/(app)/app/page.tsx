import { createClient } from '@/lib/supabase/server'

export default async function AppHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single()

  const name = profile?.display_name ?? user!.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100dvh-3.5rem)] md:min-h-full">
      <div className="text-center max-w-sm px-6">
        <span className="material-symbols-outlined text-[48px] text-primary mb-4 block"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>
          health_metrics
        </span>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-fg mb-2">
          Welcome, {name}.
        </h1>
        <p className="text-[15px] text-fg-muted">
          Your AI overview is being built. <em>Quiet Intelligence</em> coming soon.
        </p>
      </div>
    </div>
  )
}
