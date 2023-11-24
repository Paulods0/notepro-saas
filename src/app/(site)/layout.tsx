import Header from "@/components/landing-page/header"
import React, { ReactNode } from "react"

const HomePageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <Header />
      {children}
    </main>
  )
}

export default HomePageLayout
