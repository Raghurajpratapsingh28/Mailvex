"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WorkspaceContextType {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  clearWorkspaceId: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selected-workspace-id');
    if (stored) setWorkspaceIdState(stored);
  }, []);

  const setWorkspaceId = (id: string | null) => {
    setWorkspaceIdState(id);
    if (id) {
      localStorage.setItem('selected-workspace-id', id);
    } else {
      localStorage.removeItem('selected-workspace-id');
    }
  };

  const clearWorkspaceId = () => {
    setWorkspaceIdState(null);
    localStorage.removeItem('selected-workspace-id');
  };

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId, clearWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
