"use client";

import { ArrowLeft, LoaderCircle, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

import { DottedSeparator } from "@/components/custom/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberBadge } from "@/features/members/components/member-badge";
import { User } from "@/features/auth/types";

interface MembersListProps {
  workspaceId: string;
  currentUser: User
}

export const MembersList = ({ workspaceId, currentUser }: MembersListProps) => {
  const { data: members, isLoading: isGettingMembers } = useGetMembers({
    workspaceId,
  });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?",
    "destructive"
  );

  const [ConfirmLeaveDialog, confirmLeave] = useConfirm(
    "Leave",
    "Are you sure you want to leave from this workspace?",
    "destructive"
  );

  const isLoadingAny = isGettingMembers || isDeletingMember || isUpdatingMember;

  const handleUpdateMember = async (memberId: string, role: MemberRole) => {
    updateMember({
      json: {
        role,
      },
      param: {
        memberId,
      },
    });
  };

  const handleDeleteMember = async (memberid: string, isLeave: boolean = false) => {
    let ok: unknown;
    
    if(!isLeave) ok = await confirmDelete();
    else ok = await confirmLeave();

    if (ok) {
      deleteMember({
        param: {
          memberId: memberid,
        },
      });
    }
  };

  return (
    <>
      <ConfirmDialog />
      <ConfirmLeaveDialog/>
      <Card className='w-full h-full border-none shadow-none'>
        <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
          <Button
            variant={"secondary"}
            size={"sm"}
            asChild
            disabled={isLoadingAny}
          >
            <Link href={`/workspaces/${workspaceId}`}>
              <ArrowLeft className='size-4 mr-2' />
              Back
            </Link>
          </Button>
          <CardTitle className='text-xl font-bold'>Members List</CardTitle>
          <div className="flex-1 flex flex-row items-center justify-end">
            {isLoadingAny && <LoaderCircle className="animate-spin"/>}
          </div>
        </CardHeader>
        <div>
          <DottedSeparator />
        </div>
        <CardContent className='py-7'>
          {isGettingMembers ? (
            <div className='flex flex-col w-full gap-2'>
              <div className='flex items-center gap-2'>
                <Skeleton className='size-10' />
                <div className='flex-1 flex flex-col gap-y-2'>
                  <Skeleton className='w-full h-4' />
                  <Skeleton className='w-1/4 h-3' />
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='size-10' />
                <div className='flex-1 flex flex-col gap-y-2'>
                  <Skeleton className='w-full h-4' />
                  <Skeleton className='w-1/4 h-3' />
                </div>
              </div>
            </div>
          ) : (
            members?.documents.map((member, index) => (
              <Fragment key={member.$id}>
                <div className='flex items-center gap-2'>
                  <MemberAvatar
                    name={member.name}
                    className='size-10'
                    fallbackClassName='text-lg'
                  />
                  <div className='flex flex-col'>
                    <p className='text-sm font-medium'>{member.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {member.email}
                    </p>

                    <MemberBadge role={member.role}/>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className='ml-auto'
                        variant={"secondary"}
                        size={"sm"}
                        disabled={isLoadingAny}
                      >
                        <MoreVerticalIcon className='size-4 text-muted-foreground' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side='bottom' align='end'>
                      <DropdownMenuItem
                        className='font-medium'
                        onClick={() => { handleUpdateMember(member.$id, MemberRole.ADMIN); }}
                        disabled={isLoadingAny}
                      >
                        Set as Administrator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='font-medium'
                        onClick={() => { handleUpdateMember(member.$id, MemberRole.MEMBER); }}
                        disabled={isLoadingAny}
                      >
                        Set as Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='font-medium text-amber-700'
                        onClick={() => {
                          handleDeleteMember(member.$id, (currentUser?.$id == member.userId ? true : false));
                        }}
                        disabled={isLoadingAny}
                      >
                        {currentUser?.$id == member.userId ? "Leave" : "Remove as Member" }
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {index < members.documents.length - 1 && (
                  <Separator className='my-2.5' />
                )}
              </Fragment>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
};
