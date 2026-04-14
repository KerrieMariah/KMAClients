export const PROJECT_STAGES = [
  { value: "draft", label: "Initial Draft" },
  { value: "review", label: "Under Review" },
  { value: "build_complete", label: "Website Build Complete" },
  { value: "seo_started", label: "SEO Implementation Started" },
  { value: "seo_ongoing", label: "SEO Ongoing" },
] as const

export type ProjectStage = (typeof PROJECT_STAGES)[number]["value"]

export type Project = {
  id: string
  name: string
  description: string
  status: "active" | "in-progress" | "completed" | "paused"
  stage: ProjectStage
  startDate: string
  estimatedEnd: string
  technologies: string[]
  image: string
  goals: string[]
  notionUrl: string
}

export type Website = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "maintenance"
  uptime: number
  lastChecked: string
  responseTime: number
  visitors: {
    total: number
    change: number
  }
  bounceRate: number
  topReferrers: { source: string; visits: number; percentage: number }[]
  trafficByCountry: { country: string; visits: number; percentage: number }[]
  gaPropertyId?: string | null
  gscSiteUrl?: string | null
}

export type Product = {
  id: string
  name: string
  description: string
  type: "one_time" | "recurring"
  price: number
  currency: string
  interval: "month" | "quarter" | "year" | null
  intervalCount: number
  features: string[]
  stripeProductId: string | null
  stripePriceId: string | null
  isActive: boolean
}

export type BillingItem = {
  id: string
  name: string
  type: "one_time" | "recurring"
  price: number
  interval: "month" | "quarter" | "year" | null
  intervalCount: number
  status: "active" | "cancelled" | "past_due" | "paid" | "pending"
  startDate: string
  endDate: string | null
  nextBilling: string | null
  features: string[]
  productId: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
}

/** @deprecated Use BillingItem instead */
export type Subscription = {
  id: string
  plan: string
  price: number
  billingCycle: "monthly" | "quarterly" | "yearly"
  status: "active" | "cancelled" | "past_due"
  nextBilling: string
  features: string[]
  startDate: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
}

export type Document = {
  id: string
  name: string
  type: "contract" | "proposal" | "invoice" | "report" | "design"
  size: string
  uploadedAt: string
  projectId: string
  fileUrl: string | null
}

export type StripeInvoice = {
  id: string
  number: string | null
  status: string | null
  amountDue: number
  amountPaid: number
  currency: string
  created: string
  dueDate: string | null
  hostedUrl: string | null
  pdfUrl: string | null
  description: string | null
}

export type TimeSlot = {
  id: string
  date: string
  time: string
  available: boolean
}

export const currentUser = {
  name: "Sarah Mitchell",
  email: "sarah@mitchelldesigns.com",
  company: "Mitchell Designs",
  avatar: "SM",
}

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "E-Commerce Platform Redesign",
    description:
      "Complete redesign and rebuild of the online store with modern UX patterns, improved checkout flow, and mobile-first approach. We are focused on improving conversion rates and delivering a seamless shopping experience across all devices.",
    status: "in-progress",
    stage: "build_complete",
    startDate: "2025-11-01",
    estimatedEnd: "2026-03-15",
    technologies: ["Next.js", "Stripe", "Tailwind CSS", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    goals: [
      "Redesign product listing pages with improved filtering and search",
      "Rebuild checkout flow to reduce cart abandonment by 30%",
      "Implement mobile-first responsive design across all pages",
      "Integrate Stripe for seamless payment processing",
      "Set up automated email notifications for order updates",
      "Optimize page load times to under 2 seconds",
    ],
    notionUrl: "https://mitchelldesigns.notion.site/E-Commerce-Redesign-Project-Notes",
  },
  {
    id: "proj-2",
    name: "Brand Identity Website",
    description:
      "Portfolio and brand showcase website with CMS integration for easy content management. This project establishes a strong digital presence with a focus on storytelling, visual impact, and SEO optimization.",
    status: "active",
    stage: "review",
    startDate: "2026-01-10",
    estimatedEnd: "2026-04-20",
    technologies: ["React", "Sanity CMS", "Framer Motion"],
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop",
    goals: [
      "Design and develop a visually striking portfolio homepage",
      "Integrate Sanity CMS for self-service content updates",
      "Create smooth page transitions with Framer Motion",
      "Implement SEO best practices for organic traffic growth",
      "Build a blog section for thought leadership content",
    ],
    notionUrl: "https://mitchelldesigns.notion.site/Brand-Identity-Website-Notes",
  },
  {
    id: "proj-3",
    name: "Analytics Dashboard",
    description:
      "Custom analytics dashboard for tracking business KPIs and customer engagement metrics. This tool provides real-time insights into business performance with customizable reports and data visualization.",
    status: "completed",
    stage: "seo_ongoing",
    startDate: "2025-08-01",
    estimatedEnd: "2025-10-30",
    technologies: ["Next.js", "D3.js", "Supabase"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    goals: [
      "Build real-time KPI dashboard with live data feeds",
      "Implement customizable chart widgets using D3.js",
      "Create automated weekly and monthly report generation",
      "Set up role-based access control for team members",
      "Integrate with existing Supabase database for data queries",
    ],
    notionUrl: "https://mitchelldesigns.notion.site/Analytics-Dashboard-Notes",
  },
]

export const websites: Website[] = [
  {
    id: "web-1",
    name: "Main Website",
    url: "mitchelldesigns.com",
    status: "online",
    uptime: 99.98,
    lastChecked: "2 minutes ago",
    responseTime: 142,
    visitors: { total: 12480, change: 12.3 },
    bounceRate: 34.2,
    topReferrers: [
      { source: "Google Search", visits: 5620, percentage: 45 },
      { source: "Direct", visits: 3120, percentage: 25 },
      { source: "LinkedIn", visits: 1870, percentage: 15 },
      { source: "Twitter/X", visits: 1120, percentage: 9 },
      { source: "Other", visits: 750, percentage: 6 },
    ],
    trafficByCountry: [
      { country: "United States", visits: 7490, percentage: 60 },
      { country: "United Kingdom", visits: 1870, percentage: 15 },
      { country: "Canada", visits: 1250, percentage: 10 },
      { country: "Germany", visits: 870, percentage: 7 },
      { country: "Other", visits: 1000, percentage: 8 },
    ],
  },
  {
    id: "web-2",
    name: "E-Commerce Store",
    url: "shop.mitchelldesigns.com",
    status: "online",
    uptime: 99.95,
    lastChecked: "1 minute ago",
    responseTime: 238,
    visitors: { total: 8340, change: 8.7 },
    bounceRate: 42.1,
    topReferrers: [
      { source: "Google Search", visits: 3340, percentage: 40 },
      { source: "Google Ads", visits: 2500, percentage: 30 },
      { source: "Instagram", visits: 1250, percentage: 15 },
      { source: "Direct", visits: 830, percentage: 10 },
      { source: "Other", visits: 420, percentage: 5 },
    ],
    trafficByCountry: [
      { country: "United States", visits: 5840, percentage: 70 },
      { country: "Canada", visits: 1000, percentage: 12 },
      { country: "United Kingdom", visits: 670, percentage: 8 },
      { country: "Australia", visits: 500, percentage: 6 },
      { country: "Other", visits: 330, percentage: 4 },
    ],
  },
  {
    id: "web-3",
    name: "Blog",
    url: "blog.mitchelldesigns.com",
    status: "maintenance",
    uptime: 98.5,
    lastChecked: "5 minutes ago",
    responseTime: 890,
    visitors: { total: 3210, change: -2.1 },
    bounceRate: 56.8,
    topReferrers: [
      { source: "Google Search", visits: 1930, percentage: 60 },
      { source: "Direct", visits: 640, percentage: 20 },
      { source: "Twitter/X", visits: 320, percentage: 10 },
      { source: "Reddit", visits: 190, percentage: 6 },
      { source: "Other", visits: 130, percentage: 4 },
    ],
    trafficByCountry: [
      { country: "United States", visits: 1610, percentage: 50 },
      { country: "India", visits: 640, percentage: 20 },
      { country: "United Kingdom", visits: 480, percentage: 15 },
      { country: "Germany", visits: 320, percentage: 10 },
      { country: "Other", visits: 160, percentage: 5 },
    ],
  },
]

export const subscription: Subscription = {
  id: "sub-1",
  plan: "Professional",
  price: 299,
  billingCycle: "monthly",
  status: "active",
  nextBilling: "2026-03-01",
  startDate: "2025-06-01",
  features: [
    "Unlimited website hosting",
    "Priority support (4hr response)",
    "Weekly performance reports",
    "SSL certificates included",
    "Daily automated backups",
    "99.9% uptime guarantee",
    "Custom domain management",
    "CDN included",
  ],
}

export const documents: Document[] = [
  {
    id: "doc-1",
    name: "Project Proposal - E-Commerce Redesign.pdf",
    type: "proposal",
    size: "2.4 MB",
    uploadedAt: "2025-10-15",
    projectId: "proj-1",
    fileUrl: null,
  },
  {
    id: "doc-2",
    name: "Service Agreement 2025-2026.pdf",
    type: "contract",
    size: "890 KB",
    uploadedAt: "2025-06-01",
    projectId: "proj-1",
    fileUrl: null,
  },
  {
    id: "doc-3",
    name: "Invoice #1247 - January 2026.pdf",
    type: "invoice",
    size: "124 KB",
    uploadedAt: "2026-01-01",
    projectId: "proj-1",
    fileUrl: null,
  },
  {
    id: "doc-4",
    name: "Invoice #1248 - February 2026.pdf",
    type: "invoice",
    size: "124 KB",
    uploadedAt: "2026-02-01",
    projectId: "proj-1",
    fileUrl: null,
  },
  {
    id: "doc-5",
    name: "Brand Guidelines - Final.pdf",
    type: "design",
    size: "8.7 MB",
    uploadedAt: "2026-01-20",
    projectId: "proj-2",
    fileUrl: null,
  },
  {
    id: "doc-6",
    name: "Q4 Performance Report.pdf",
    type: "report",
    size: "1.2 MB",
    uploadedAt: "2025-12-31",
    projectId: "proj-3",
    fileUrl: null,
  },
  {
    id: "doc-7",
    name: "Analytics Dashboard - Design Specs.pdf",
    type: "design",
    size: "4.5 MB",
    uploadedAt: "2025-08-15",
    projectId: "proj-3",
    fileUrl: null,
  },
]

export const timeSlots: TimeSlot[] = [
  { id: "ts-1", date: "2026-02-18", time: "09:00 AM", available: true },
  { id: "ts-2", date: "2026-02-18", time: "10:00 AM", available: true },
  { id: "ts-3", date: "2026-02-18", time: "11:00 AM", available: false },
  { id: "ts-4", date: "2026-02-18", time: "02:00 PM", available: true },
  { id: "ts-5", date: "2026-02-18", time: "03:00 PM", available: true },
  { id: "ts-6", date: "2026-02-19", time: "09:00 AM", available: true },
  { id: "ts-7", date: "2026-02-19", time: "10:00 AM", available: false },
  { id: "ts-8", date: "2026-02-19", time: "11:00 AM", available: true },
  { id: "ts-9", date: "2026-02-19", time: "02:00 PM", available: true },
  { id: "ts-10", date: "2026-02-19", time: "03:00 PM", available: false },
  { id: "ts-11", date: "2026-02-20", time: "09:00 AM", available: true },
  { id: "ts-12", date: "2026-02-20", time: "10:00 AM", available: true },
  { id: "ts-13", date: "2026-02-20", time: "11:00 AM", available: true },
  { id: "ts-14", date: "2026-02-20", time: "02:00 PM", available: false },
  { id: "ts-15", date: "2026-02-20", time: "03:00 PM", available: true },
]
