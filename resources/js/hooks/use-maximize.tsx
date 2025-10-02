import { useEffect, useState } from 'react';

export function useMaximize() {
    const [isMaximized, setIsMaximized] = useState(false);

    // Sinkronkan state dengan Fullscreen API
    useEffect(() => {
        const updateState = () => setIsMaximized(Boolean(document.fullscreenElement));

        updateState();
        document.addEventListener('fullscreenchange', updateState);
        return () => document.removeEventListener('fullscreenchange', updateState);
    }, []);

    // Shortcut ringkas: F11 untuk toggle, Escape untuk exit
    useEffect(() => {
        const onKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                await toggleMaximize();
            }
            if (e.key === 'Escape' && document.fullscreenElement) {
                await restore();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const maximize = async () => {
        try {
            await document.documentElement.requestFullscreen?.();
        } catch {
            // noop
        }
    };

    const restore = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen?.();
            }
        } catch {
            // noop
        }
    };

    const toggleMaximize = async () => {
        if (document.fullscreenElement) {
            await restore();
        } else {
            await maximize();
        }
    };

    return { isMaximized, toggleMaximize, maximize, restore };
}
