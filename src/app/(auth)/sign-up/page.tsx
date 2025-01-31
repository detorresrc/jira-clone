import { getCurrentUser } from '@/features/auth/server/queries';
import { SignUpCard } from '@/features/auth/components/sign-up-card'
import { redirect } from 'next/navigation';
import React from 'react'

export const dynamic = 'force-dynamic';

const SignUpPage = async () => {
  const user = await getCurrentUser();

  if(user) redirect("/");

  return (
    <div>
      <SignUpCard/>
    </div>
  )
}

export default SignUpPage