"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useRef } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { useCreateProject } from "../api/use-create-project";
import { createProjectSchema, CreateProjectSchema } from "../schema";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface CreateProjectFormProps {
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateProject();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const onSubmit = (data: CreateProjectSchema) => {
    const finalValues = {
      ...data,
      workspaceId,
      image: data.imageUrl instanceof File ? data.imageUrl : undefined,
    };

    mutate(
      { form: finalValues },
      {
        onSuccess: () => {
          form.reset();
          if(onCancel) onCancel();
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

  return (
    <Card className='w-full h-full border-none shadow-none'>
      <CardHeader className='flex p-7'>
        <CardTitle className='text-2xl font-bold'>Create Project</CardTitle>
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
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter project name'
                        disabled={isPending}
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
                        <p className='text-sm'>Project Icon</p>
                        <p className='text-sm text-muted-foreground'>
                          JPG, PNG, SVG or JPEG and max 1mb
                        </p>
                        <input
                          type='file'
                          className='hidden'
                          accept='.jpg, .png, .jpeg, .svg'
                          ref={inputRef}
                          disabled={isPending}
                          onChange={handleImageChange}
                        />
                        {field.value ? (
                          <Button
                            type='button'
                            disabled={isPending}
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
                            disabled={isPending}
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
                disabled={isPending}
                type='button'
                size={"lg"}
                variant={"secondary"}
                onClick={onCancel}
                className={cn(onCancel ? "block" : "invisible")}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type='submit'
                size={"lg"}
                variant={"primary"}
              >
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
