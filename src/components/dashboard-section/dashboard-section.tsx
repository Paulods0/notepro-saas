import { AuthUser } from "@supabase/supabase-js"
import React from "react"

interface DashboardProps {
  user: AuthUser
  subscription: {} | null
}

const DashboardSetup: React.FC<DashboardProps> = ({ user, subscription }) => {
  return <div>DashboardSetup</div>
}

export default DashboardSetup
