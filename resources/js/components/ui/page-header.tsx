import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
    return (
        <div className={cn("", className)}>
            <h2 className="text-lg md:text-xl font-medium">{title}</h2>
            {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
            )}
        </div>
    );
}
