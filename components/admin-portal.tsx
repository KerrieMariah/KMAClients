"use client"

import { useState, useCallback } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientTable } from "@/components/admin/client-table"
import { ClientDetail } from "@/components/admin/client-detail"
import { ProductsManager } from "@/components/admin/products-manager"
import { AllProjects } from "@/components/admin/all-projects"
import { AllWebsites } from "@/components/admin/all-websites"
import { AllBilling } from "@/components/admin/all-billing"
import { AllDocuments } from "@/components/admin/all-documents"

interface AdminPortalProps {
  initialClients: any[]
  currentUser: { name: string; email: string }
}

export function AdminPortal({ initialClients, currentUser }: AdminPortalProps) {
  const [activeSection, setActiveSection] = useState("clients")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [clients, setClients] = useState(initialClients)
  const [clientDetail, setClientDetail] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/admin/data?type=clients")
    if (res.ok) {
      const data = await res.json()
      setClients(data)
    }
  }, [])

  const fetchClientDetail = useCallback(async (id: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/data?type=client&id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setClientDetail(data)
    }
    setLoading(false)
  }, [])

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id)
    setActiveSection("client-detail")
    fetchClientDetail(id)
  }

  const handleBackToClients = () => {
    setSelectedClientId(null)
    setClientDetail(null)
    setActiveSection("clients")
    fetchClients()
  }

  const handleRefreshClient = () => {
    if (selectedClientId) {
      fetchClientDetail(selectedClientId)
    }
  }

  const handleNavigate = (section: string) => {
    if (section !== "client-detail") {
      setSelectedClientId(null)
      setClientDetail(null)
    }
    setActiveSection(section)
  }

  const renderContent = () => {
    if (activeSection === "client-detail" && clientDetail) {
      return (
        <ClientDetail
          client={clientDetail}
          onBack={handleBackToClients}
          onRefresh={handleRefreshClient}
        />
      )
    }

    if (activeSection === "client-detail" && loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )
    }

    if (activeSection === "products") {
      return <ProductsManager />
    }

    if (activeSection === "projects") {
      return <AllProjects onSelectClient={handleSelectClient} />
    }

    if (activeSection === "websites") {
      return <AllWebsites onSelectClient={handleSelectClient} />
    }

    if (activeSection === "billing") {
      return <AllBilling onSelectClient={handleSelectClient} />
    }

    if (activeSection === "documents") {
      return <AllDocuments onSelectClient={handleSelectClient} />
    }

    return (
      <ClientTable
        clients={clients}
        onSelectClient={handleSelectClient}
        onRefresh={fetchClients}
      />
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentUser={currentUser}
      />
      <SidebarInset>
        <header className="flex h-14 items-center border-b border-border px-6">
          <SidebarTrigger className="-ml-2" />
          <div className="ml-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Admin</span>
            {selectedClientId && clientDetail && (
              <>
                <span>/</span>
                <span>{clientDetail.profile.fullName}</span>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
