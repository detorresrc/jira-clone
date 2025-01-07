import { getCurrentUser } from '@/features/auth/server/queries';
import { MembersList } from '@/features/workspaces/components/members-list';
import { redirect } from 'next/navigation';

interface WorkdspaceIdMembersPageProps {
  params: Promise<{ 
    workspaceId: string
  }>
}

const WorkdspaceIdMembersPage = async ({
  params
}: WorkdspaceIdMembersPageProps) => {
  const user = await getCurrentUser();
  if(!user) redirect("/sign-in");

  const { workspaceId } = await params;
    
  return (
    <div className='w-full lg:max-w-xl m-auto'>
      <MembersList
        workspaceId={workspaceId}
        currentUser={user}/>
    </div>
  )
}

export default WorkdspaceIdMembersPage