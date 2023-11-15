import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import React from "react"
import { cookies } from "next/headers"
import db from "@/lib/supabase/db"
import DashboardSetup from "@/components/dashboard-section/dashboard-section"
import { redirect } from "next/navigation"

const DashboardPage = async () => {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return
  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  })

  if (!workspace)
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup></DashboardSetup>
      </div>
    )

  redirect(`/dashboard/${workspace.id}`)
}

export default DashboardPage
