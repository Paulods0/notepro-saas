import {
  appFoldersType,
  appWorkspacesType,
} from "@/lib/providers/state-provider"
import { File, Folder, workspace } from "@/lib/supabase/supabase.types"
import React from "react"
import CustomDialogTrigger from "../global/custom-dialog-trigger"
import BannerUploadForm from "./banner-upload-form"

interface BannerUploadProps {
  children: React.ReactNode
  className?: string
  dirType: "workspace" | "folder" | "file"
  id: string
  details: appWorkspacesType | appFoldersType | File | workspace | Folder
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  children,
  details,
  dirType,
  id,
  className,
}) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={<BannerUploadForm id={id} dirType={dirType} />}
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  )
}

export default BannerUpload
