"use client"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider"
import { Button } from "../ui/button"
import Loader from "./Loader"

const SubscriptionModal = () => {
  const { open, setOpen } = useSubscriptionModal()
  const { subscription } = useSupabaseUser()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status === "active" ? (
        <DialogContent>Already on paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update to a Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>
          <div className="flex justify-between items-center">
            <React.Fragment>
              <b className="text-3xl text-foreground ">
                $12.99 / <small>month</small>
              </b>
              <Button disabled={isLoading}>
                {isLoading ? <Loader /> : "Upgrade 🌟"}
              </Button>
            </React.Fragment>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default SubscriptionModal
