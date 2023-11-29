"use client"
import React, { useEffect, useRef, useState } from "react"
import { useToast } from "../ui/use-toast"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAppState } from "@/lib/providers/state-provider"
import { User, workspace } from "@/lib/supabase/supabase.types"
import {
  Briefcase,
  CreditCardIcon,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  SeparatorHorizontal,
  Share,
  User as UserIcon,
} from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  addCollaborator,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateWorkspace,
} from "@/lib/supabase/queries"
import { v4 } from "uuid"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import CollaboratorSearch from "../global/collaborator-search"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ScrollArea } from "../ui/scroll-area"
import { Alert, AlertDescription } from "../ui/alert"
import { Separator } from "@radix-ui/react-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import CypressProfileIcon from "../icons/ProfileIcon"
import LogoutButton from "../global/logout-button"
import Link from "next/link"
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider"
import { postData } from "@/lib/utils"

const SettingsForm = () => {
  const { toast } = useToast()
  const { user, subscription } = useSupabaseUser()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { state, workspaceId, dispatch } = useAppState()
  const { open, setOpen } = useSubscriptionModal()

  const [permissions, setPermissions] = useState("Private")
  const [collaborators, setCollaborators] = useState<User[] | []>([])
  const [openAlertMessage, setOpenAlertMessage] = useState(false)
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>()
  const titleTimeRef = useRef<ReturnType<typeof setTimeout>>()
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  //WIP PAYMENT PORTAL
  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true)
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      })
      window.location.assign(url)
    } catch (error) {
      console.log(error)
      setLoadingPortal(false)
    }
    setLoadingPortal(false)
  }

  //add collaborators
  const addCollaborators = async (profile: User) => {
    if (!workspaceId) return
    if (subscription?.status !== "active" && collaborators.length >= 2) {
      setOpen(true)
      return
    }
    await addCollaborator([profile], workspaceId)
    setCollaborators([...collaborators, profile])
    //To refresh our workspace categories
    // router.refresh()
  }
  //remove collaborators
  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return
    if (collaborators.length === 1) {
      setPermissions("Private")
    }
    await removeCollaborators([user], workspaceId)
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    )
    router.refresh()
  }
  //on change
  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    })
    if (titleTimeRef.current) clearTimeout(titleTimeRef.current)
    titleTimeRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId)
    }, 500)
  }

  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return
    const file = e.target.files?.[0]
    if (!file) return
    const uuid = v4()
    setUploadingLogo(true)
    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      })
    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: {
            logo: data.path,
          },
          workspaceId,
        },
      })
      await updateWorkspace({ logo: data.path }, workspaceId)
      setUploadingLogo(false)
    }
  }
  //onClicks
  const onClickAlertConfirm = async () => {
    if (!workspaceId) return
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId)
    }
    setPermissions("private")
    setOpenAlertMessage(false)
  }

  const onPermissionsChange = async (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true)
    } else {
      setPermissions(val)
    }
  }
  //fetching avatar details
  //get workspace details
  //get all the collaborators
  //WIP Payment Portal redirect
  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    )
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace)
  }, [workspaceId, state])

  useEffect(() => {
    if (!workspaceId) return
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId)
      if (response.length) {
        setPermissions("shared")
        setCollaborators(response)
      }
    }
    fetchCollaborators()
  }, [])

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        Workspace
      </p>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Name
        </Label>
        <Input
          name="workspaceName"
          value={workspaceDetails ? workspaceDetails.title : ""}
          placeholder="Workspace Name"
          onChange={workspaceNameChange}
        />
        <Label
          htmlFor="workspaceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={onChangeWorkspaceLogo}
          disabled={uploadingLogo || subscription?.status !== "active"}
        />
        {subscription?.status !== "active" && (
          <small className="text-muted-foreground ">
            To customize your workspace, you need to be on a Pro Plan.
          </small>
        )}
      </div>
      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Select onValueChange={onPermissionsChange} value={permissions}>
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>
                      Your workspace is private to you. You can choose to share
                      it later.
                    </p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share />
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>Your can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {permissions === "shared" && (
          <div>
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={(user) => {
                addCollaborators(user)
              }}
            >
              <Button type="button" className="text-sm mt-4">
                <Plus />
                Add collaborators
              </Button>
            </CollaboratorSearch>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                Collaborators {collaborators.length || ""}
              </span>
              <ScrollArea className="h-[120px] w-full rounded-md border border-muted-foreground-/20 ">
                {collaborators.length ? (
                  collaborators.map((c) => (
                    <div
                      className="p-2 flex justify-between items-center"
                      key={c.id}
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarImage src={"/avatars/7.png"} />
                          <AvatarFallback>PJ</AvatarFallback>
                        </Avatar>
                        <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[120px]">
                          {c.email}
                        </div>
                      </div>
                      <Button
                        variant={"secondary"}
                        onClick={() => removeCollaborator(c)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                    <span className="text-muted-foreground text-sm ">
                      You have no collaborators
                    </span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
        <Alert variant={"destructive"}>
          <AlertDescription>
            Warning deleting you workspace will permanently delete all data
            related to this workspace
          </AlertDescription>
          <Button
            type="submit"
            size={"sm"}
            variant={"destructive"}
            className="mt-4 text-sm bg-destructive/40 border-2 border-destructive"
            onClick={async () => {
              if (!workspaceId) return
              await deleteWorkspace(workspaceId)
              toast({ title: "Successfully deleted your workspace" })
              dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId })
              router.replace("/dashboard")
            }}
          >
            Delete workspace
          </Button>
        </Alert>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={""} />
            <AvatarFallback>
              <CypressProfileIcon />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ""}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              // onChange={onChangeProfilePicture}
              disabled={uploadingProfilePicture}
            />
          </div>
        </div>
        <LogoutButton>
          <div className="flex items-center ">
            <LogOut />
          </div>
        </LogoutButton>
        <p className="flex items-center gap-2 mt-6">
          <CreditCardIcon size={20} /> Billing & Plan
        </p>
        <p className="text-muted-foreground">
          You are currently on a {""}
          {subscription?.status === "active" ? "Pro" : "Free"} Plan
        </p>
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground flex flex-row items-center gap-2"
        >
          View Plans <ExternalLink size={16} />
        </Link>
        {subscription?.status === "active" ? (
          <div>
            <Button
              type="button"
              size="sm"
              variant={"secondary"}
              className="text-sm"
              disabled={loadingPortal}
              onClick={redirectToCustomerPortal}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="text-sm"
              onClick={() => setOpen(true)}
            >
              Start Plan
            </Button>
          </div>
        )}
      </>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SettingsForm
