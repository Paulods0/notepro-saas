import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import clsx from "clsx"

interface CustomDialogTriggerProps {
  header?: string
  content?: React.ReactNode
  children: React.ReactNode
  description?: string
  className?: string
}

const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
  children,
  className,
  content,
  description,
  header,
}) => {
  return (
    <Dialog>
      <DialogTrigger className={clsx("", className)}>{children}</DialogTrigger>
      <DialogContent className="h-screen block sm:h-[440px] overflow-auto w-full">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialogTrigger
