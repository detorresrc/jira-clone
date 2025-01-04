"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { useForm } from "react-hook-form";
import React, { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, CopyIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { DottedSeparator } from "@/components/custom/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useResetInviteCodeWorkspace } from "../api/use-reset-invite-code-workspace";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: deleteMutate, isPending: deleteIsPending } =
    useDeleteWorkspace();
  const { mutate: resetInviteCodeMutate, isPending: resetInviteCodeIsPending } = useResetInviteCodeWorkspace();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "Are you sure you want to delete this workspace? This action is irreversible.",
    "destructive"
  );

  const [ResetInviteCodeDialog, confirmResetInviteCode] = useConfirm(
    "Reset Invite Code",
    "Are you sure you want to reset the invite code for this workspace?",
    "destructive"
  );

  const isPendingAny = isPending || deleteIsPending || resetInviteCodeIsPending;

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateWorkspaceSchema>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      imageUrl: initialValues.imageUrl ?? "",
    },
  });

  const onSubmit = (data: UpdateWorkspaceSchema) => {
    const finalValues = {
      ...data,
      image: data.imageUrl instanceof File ? data.imageUrl : undefined,
    };

    mutate(
      {
        form: finalValues,
        param: { workspaceId: initialValues.$id },
      },
      {
        onSuccess: ({ data }) => {
          form.reset();
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("imageUrl", file);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if(!ok) return;

    deleteMutate({ param: { workspaceId: initialValues.$id } }, {
      onSuccess: () => {
        router.push("/");
      },
    });
  }

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink)
      .then(() => {
        toast.success("Invite link copied to clipboard");
      });
  };

  const handleResetInviteLink = async () => {
    const ok = await confirmResetInviteCode();
    if(!ok) return;

    resetInviteCodeMutate({ param: { workspaceId: initialValues.$id } }, {
      onSuccess: () => {
        toast.success("Invite link reset successfully");
        router.refresh();
      },
    });
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  return (
    <div className='flex flex-col gap-y-4'>
      <DeleteDialog/>
      <ResetInviteCodeDialog/>
      <Card className='w-full h-full border-none shadow-none'>
        <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
          <Button
            size={"xs"}
            variant={"secondary"}
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/workspaces/${initialValues.$id}`)
            }
          >
            <ArrowLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='text-2xl font-bold'>
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className='px-7'>
          <DottedSeparator />
        </div>
        <CardContent className='p-7'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter workspace name'
                          disabled={isPendingAny}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field }) => (
                    <div className='flex flex-col gap-y-2'>
                      <div className='flex items-center gap-x-5'>
                        {field.value ? (
                          <div className='size-[72px] relative rounded-md overflow-hidden'>
                            <Image
                              alt='Workspace Image'
                              fill
                              className='object-cover'
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className='size-[72px]'>
                            <AvatarFallback>
                              <ImageIcon className='size-[36px] text-neutral-400' />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className='flex flex-col'>
                          <p className='text-sm'>Workspace Icon</p>
                          <p className='text-sm text-muted-foreground'>
                            JPG, PNG, SVG or JPEG and max 1mb
                          </p>
                          <input
                            type='file'
                            className='hidden'
                            accept='.jpg, .png, .jpeg, .svg'
                            ref={inputRef}
                            disabled={isPendingAny}
                            onChange={handleImageChange}
                          />
                          {field.value ? (
                            <Button
                              type='button'
                              disabled={isPendingAny}
                              variant={"destructive"}
                              size={"xs"}
                              className='w-fit mt-2'
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          ) : (
                            <Button
                              type='button'
                              disabled={isPendingAny}
                              variant={"teritary"}
                              size={"xs"}
                              className='w-fit mt-2'
                              onClick={() => inputRef.current?.click()}
                            >
                              Upload Image
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              <DottedSeparator className='py-7' />

              <div className='flex items-center justify-between'>
                <Button
                  disabled={isPendingAny}
                  type='button'
                  size={"lg"}
                  variant={"secondary"}
                  onClick={onCancel}
                  className={cn(onCancel ? "block" : "invisible")}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isPendingAny}
                  type='submit'
                  size={"lg"}
                  variant={"primary"}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className='w-full h-full border-none shadow-none'>
        <CardContent className='p-7'>
          <div className='flex flex-col'>
            <h3 className='font-bold'>Invite Members</h3>
            <p className='text-sm text-muted-foreground'>
              Use the invite link to add members to your workspace.
            </p>
            <div className="mt-4">
              <div className="flex items-center gal-x-2">
                <Input disabled value={fullInviteLink}/>
                <Button variant={"secondary"} className="size-12" onClick={handleCopyInviteLink}>
                  <CopyIcon className="size-5"/>
                </Button>
              </div>
            </div>
            <DottedSeparator className='py-7' />
            <Button
              disabled={isPendingAny}
              type='button'
              className='w-fit ml-auto'
              size={"sm"}
              variant={"destructive"}
              onClick={handleResetInviteLink}
            >
              Reset Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className='w-full h-full border-none shadow-none'>
        <CardContent className='p-7'>
          <div className='flex flex-col'>
            <h3 className='font-bold'>Danger Zone</h3>
            <p className='text-sm text-muted-foreground'>
              Deleting worspace is irreversible and will remove associated data.
            </p>
            <DottedSeparator className='py-7' />
            <Button
              disabled={isPendingAny}
              type='button'
              className='w-fit ml-auto'
              size={"sm"}
              variant={"destructive"}
              onClick={handleDelete}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
