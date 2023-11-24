"use client"
import { useAppState } from "@/lib/providers/state-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import { Accordion, AccordionItem, AccordionTrigger } from "../ui/accordion"
import EmojiPicker from "../global/emoji-picker"
import { createFile, updateFile, updateFolder } from "@/lib/supabase/queries"
import { toast } from "../ui/use-toast"
import TooltipComponent from "../global/tooltip-component"
import { PlusIcon, Trash } from "lucide-react"
import { File } from "@/lib/supabase/supabase.types"
import { v4 } from "uuid"

interface DropdownProps {
  title: string
  id: string
  listType: "folder" | "file"
  iconId: string
  children?: React.ReactNode
  disabled?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
  iconId,
  id,
  listType,
  title,
  children,
  disabled,
  ...props
}) => {
  const supabase = createClientComponentClient()
  const { dispatch, workspaceId, state, folderId } = useAppState()
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  //folder Title synced with server data and local
  const folderTitle: string | undefined = useMemo(() => {
    if (listType === "folder") {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title
      if (title === stateTitle || !stateTitle) return title
      return stateTitle
    }
  }, [state, listType, workspaceId, id, title])

  //fileItitle

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === "file") {
      const fileAndFolderId = id.split("folder")
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title
      if (title === stateTitle || !stateTitle) return title
      return stateTitle
    }
  }, [state, listType, workspaceId, id, title])

  //Navigate the user to a different page
  const navigatePage = (accordionId: string, type: string) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordionId}`)
    }
    if (type === "file") {
      router.push(
        `/dashboard/${workspaceId}/${folderId}/${
          accordionId.split("folder")[1]
        }`
      )
    }
  }

  //double click handler
  const handleDoubleClick = () => {
    setIsEditing(true)
  }
  //blur

  const handleBlur = async () => {
    if (!isEditing) return
    setIsEditing(false)
    const fId = id.split("folder")
    if (fId?.length === 1) {
      if (!folderTitle) return
      toast({
        title: "Success",
        description: "Folder title changed.",
      })
      await updateFolder({ title }, fId[0])
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return
      const { data, error } = await updateFile({ title: fileTitle }, fId[1])
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the title for this file",
        })
      } else
        toast({
          title: "Success",
          description: "File title changed.",
        })
    }
  }

  //onchanges
  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: id,
          folder: { iconId: selectedEmoji },
        },
      })
      const { data, error } = await updateFolder({ iconId: selectedEmoji }, id)
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Could not update the emoji for this folder",
        })
      } else {
        toast({
          title: "Success",
          description: "Update emoji for the folder",
        })
      }
    }
  }
  const folderTitleChange = (e: any) => {
    if (!workspaceId) return
    const fid = id.split("folder")
    if (fid.length === 1) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { title: e.target.value },
          folderId: fid[0],
          workspaceId,
        },
      })
    }
  }
  const fileTitleChange = (e: any) => {
    if (!workspaceId || !folderId) return
    const fid = id.split("folder")
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { title: e.target.value },
          folderId,
          workspaceId,
          fileId: fid[1],
        },
      })
    }
  }
  //move to trash
  const isFolder = listType === "folder"
  const groupIdentifies = clsx(
    "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
    {
      "group/folder": isFolder,
      "group/file": !isFolder,
    }
  )

  const listStyles = useMemo(
    () =>
      clsx("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      }),
    [isFolder]
  )

  const hoverStyles = useMemo(
    () =>
      clsx(
        "h-full hidden rounded-sm absolute right-0 items-center justify-center",
        {
          "group-hover/file:block": listType === "file",
          "group-hover/folder:block": listType === "folder",
        }
      ),
    [isFolder]
  )

  const addNewFile = async () => {
    if (!workspaceId) return
    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: "Untitled",
      iconId: "📃",
      id: v4(),
      workspaceId,
      bannerUrl: "",
    }
    dispatch({
      type: "ADD_FILE",
      payload: { file: newFile, folderId: id, workspaceId },
    })
    const { data, error } = await createFile(newFile)
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create file",
      })
    }
  }

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation()
        navigatePage(id, listType)
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline 
        p-2 
        dark:text-muted-foreground 
        text-sm"
        disabled={listType === "file"}
      >
        <div className={groupIdentifies}>
          <div
            className="flex 
          gap-4 
          items-center 
          justify-center 
          overflow-hidden"
          >
            <div className="relative">
              <EmojiPicker getvalue={onChangeEmoji}>{iconId}</EmojiPicker>
            </div>
            <input
              type="text"
              value={listType === "folder" ? folderTitle : fileTitle}
              className={clsx(
                "outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7",
                {
                  "bg-muted cursor-text": isEditing,
                  "bg-transparent cursor-pointer": !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === "folder" ? folderTitleChange : fileTitleChange
              }
            />
          </div>
          <div className={hoverStyles}>
            <TooltipComponent message="Delete Folder">
              <Trash
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </TooltipComponent>
            {listType === "folder" && !isEditing && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  // onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
    </AccordionItem>
  )
}

export default Dropdown
