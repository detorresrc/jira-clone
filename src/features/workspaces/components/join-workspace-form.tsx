"use client";

import { DottedSeparator } from "@/components/custom/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string,
    inviteCode: string,
    workspaceId: string
  }
}

export const JoinWorkspaceForm = ({
  initialValues
} : JoinWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate({
      param: {
        workspaceId: initialValues.workspaceId
      },
      json: {
        inviteCode: initialValues.inviteCode
      }
    }, {
      onSuccess: ({ data }) => {
        router.push(`/workspaces/${data.$id}`);
      },
      onError: (error) => {
        console.error(error);
      }
    });
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">
          Join workspace
        </CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
        </CardDescription>
      </CardHeader>
      <div className="px-7"><DottedSeparator/></div>
      <CardContent className="p-7">
        <div className="flex flex-col gap-2 lg:flex-row items-center justify-between">
          <Button
            size={"lg"}
            className="w-full lg:w-fit"
            variant={"secondary"}
            type="button"
            asChild
            disabled={isPending}>
              <Link href="/">Cancel</Link>
            </Button>
          <Button
            onClick={onSubmit}
            size={"lg"}
            className="w-full lg:w-fit"
            variant={"primary"}
            type="button"
            disabled={isPending}>Join Workspace</Button>
        </div>
      </CardContent>
    </Card>
  );
};
