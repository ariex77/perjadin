import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMaximizeContext } from '@/contexts/maximize-context';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2 } from 'lucide-react';

interface MaximizeButtonProps {
    className?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function MaximizeButton({ 
    className, 
    variant = 'ghost', 
    size = 'sm' 
}: MaximizeButtonProps) {
    const { isMaximized, toggleMaximize } = useMaximizeContext();

    const handleToggleMaximize = async () => {
        await toggleMaximize();
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        onClick={handleToggleMaximize}
                        className={cn(
                            'transition-all duration-200 hover:bg-sidebar-hover/50',
                            className
                        )}
                    >
                        {isMaximized ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isMaximized ? 'Maksimal' : 'Normal'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
