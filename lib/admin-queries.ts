import { createClient } from "@/lib/supabase/server"

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  return profile?.is_admin === true
}

export async function getAllClients() {
  const supabase = await createClient()

  const [
    { data: profiles, error },
    { data: projectCounts },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("user_id"),
    supabase.from("billing_items").select("user_id, plan, name, type, status"),
  ])

  if (error || !profiles) return []

  const countsByUser = (projectCounts ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.user_id] = (acc[p.user_id] ?? 0) + 1
    return acc
  }, {})

  const subsByUser = (subscriptions ?? []).reduce<Record<string, { plan: string; status: string; count: number }>>((acc, s) => {
    if (!acc[s.user_id] || s.status === "active") {
      acc[s.user_id] = { plan: s.name || s.plan, status: s.status, count: (acc[s.user_id]?.count ?? 0) + 1 }
    } else {
      acc[s.user_id].count = (acc[s.user_id].count ?? 0) + 1
    }
    return acc
  }, {})

  return profiles.map((profile) => ({
    id: profile.id,
    fullName: profile.full_name ?? "Unnamed",
    company: profile.company ?? "",
    avatarUrl: profile.avatar_url,
    isAdmin: profile.is_admin ?? false,
    projectCount: countsByUser[profile.id] ?? 0,
    subscription: subsByUser[profile.id]?.plan ?? "None",
    subscriptionStatus: subsByUser[profile.id]?.status ?? "none",
    createdAt: profile.created_at,
  }))
}

export async function getClientById(clientId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", clientId)
    .single()

  if (!profile) return null

  const [
    { data: projects },
    { data: websites },
    { data: billingItems },
    { data: documents },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", clientId).order("created_at", { ascending: false }),
    supabase.from("websites").select("*").eq("user_id", clientId).order("created_at", { ascending: false }),
    supabase.from("billing_items").select("*").eq("user_id", clientId).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("user_id", clientId).order("uploaded_at", { ascending: false }),
    supabase.from("bookings").select("*").eq("user_id", clientId).order("created_at", { ascending: false }),
  ])

  return {
    profile: {
      id: profile.id,
      fullName: profile.full_name ?? "Unnamed",
      company: profile.company ?? "",
      avatarUrl: profile.avatar_url,
      isAdmin: profile.is_admin ?? false,
      createdAt: profile.created_at,
    },
    projects: projects ?? [],
    websites: websites ?? [],
    billingItems: billingItems ?? [],
    subscription: billingItems?.[0] ?? null,
    documents: documents ?? [],
    bookings: bookings ?? [],
  }
}

async function getProfilesMap() {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("id, full_name, company")
  const map: Record<string, { full_name: string; company: string }> = {}
  for (const p of data ?? []) {
    map[p.id] = { full_name: p.full_name ?? "Unnamed", company: p.company ?? "" }
  }
  return map
}

export async function getAllProjects() {
  const supabase = await createClient()
  const [{ data, error }, profiles] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    getProfilesMap(),
  ])

  if (error || !data) return []
  return data.map((p) => ({ ...p, profiles: profiles[p.user_id] ?? null }))
}

export async function getAllWebsites() {
  const supabase = await createClient()
  const [{ data, error }, profiles] = await Promise.all([
    supabase.from("websites").select("*").order("created_at", { ascending: false }),
    getProfilesMap(),
  ])

  if (error || !data) return []
  return data.map((w) => ({ ...w, profiles: profiles[w.user_id] ?? null }))
}

export async function getAllBillingItems() {
  const supabase = await createClient()
  const [{ data, error }, profiles] = await Promise.all([
    supabase.from("billing_items").select("*").order("created_at", { ascending: false }),
    getProfilesMap(),
  ])

  if (error || !data) return []
  return data.map((b) => ({ ...b, profiles: profiles[b.user_id] ?? null }))
}

export async function getAllDocuments() {
  const supabase = await createClient()
  const [{ data, error }, profiles] = await Promise.all([
    supabase.from("documents").select("*").order("uploaded_at", { ascending: false }),
    getProfilesMap(),
  ])

  if (error || !data) return []
  return data.map((d) => ({ ...d, profiles: profiles[d.user_id] ?? null }))
}
