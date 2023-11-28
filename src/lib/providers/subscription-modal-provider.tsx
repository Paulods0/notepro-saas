"use client"
import SubscriptionModal from "@/components/global/subscription-modal"
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react"

type SubscriptionModalContextType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const SubscriptionModalContext = createContext<SubscriptionModalContextType>({
  open: false,
  setOpen: () => {},
})

export const useSubscriptionModal = () => {
  return useContext(SubscriptionModalContext)
}

export const SubscriptionModalProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  return (
    <SubscriptionModalContext.Provider value={{ open, setOpen }}>
      {children}
      <SubscriptionModal />
    </SubscriptionModalContext.Provider>
  )
}
