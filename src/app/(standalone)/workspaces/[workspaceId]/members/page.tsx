import { getCurrentUser } from '@/features/auth/server/queries';
import { MembersList } from '@/features/workspaces/components/members-list';
import { redirect } from 'next/navigation';

interface WorkspaceIdMembersPageProps {
  params: Promise<{ 
    workspaceId: string
  }>
}

const WorkspaceIdMembersPage = async ({
  params
}: WorkspaceIdMembersPageProps) => {
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

export default WorkspaceIdMembersPage