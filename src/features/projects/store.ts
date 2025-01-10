import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProjectState {
  isCreating: boolean;
  createPayload: { name: string; workspaceId: string; imageUrl?: string | File | undefined } | null;

  setIsCreating: (data: { name: string; workspaceId: string; imageUrl?: string | File | undefined } | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      isCreating: false,

      setIsCreating: (data) => {
        if(data)
          set({createPayload: data, isCreating: true});
        else
          set({createPayload: null, isCreating: false});
      },
    })
  )
);