import React, { createContext, useContext, ReactNode } from 'react';
import { useMaximize } from '@/hooks/use-maximize';

interface MaximizeContextType {
    isMaximized: boolean;
    toggleMaximize: () => Promise<void>;
    maximize: () => Promise<void>;
    restore: () => Promise<void>;
}

const MaximizeContext = createContext<MaximizeContextType | undefined>(undefined);

interface MaximizeProviderProps {
    children: ReactNode;
}

export function MaximizeProvider({ children }: MaximizeProviderProps) {
    const maximizeState = useMaximize();

    return (
        <MaximizeContext.Provider value={maximizeState}>
            {children}
        </MaximizeContext.Provider>
    );
}

export function useMaximizeContext() {
    const context = useContext(MaximizeContext);
    if (context === undefined) {
        throw new Error('useMaximizeContext must be used within a MaximizeProvider');
    }
    return context;
}
