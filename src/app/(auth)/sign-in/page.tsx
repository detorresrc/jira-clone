import { getCurrentUser } from '@/features/auth/server/queries';
import { SignInCard } from '@/features/auth/components/sign-in-card'
import { redirect } from 'next/navigation';
import React from 'react'

export const dynamic = 'force-dynamic';

const SignInPage = async() => {
  const user = await getCurrentUser();

  if(user) redirect("/");

  return (
    <SignInCard/>
  )
}

export default SignInPage