import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
    title: string
    value: string | number
    icon: React.ReactNode
    containerClassName?: string
    titleClassName?: string
    valueClassName?: string
}

export function StatCard({
    title,
    value,
    icon,
    containerClassName,
    titleClassName,
    valueClassName,
}: StatCardProps) {
    return (
        <Card className={cn(containerClassName)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className={cn("font-medium text-sm", titleClassName)}>
                        {title}
                    </CardTitle>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
            </CardContent>
        </Card>
    )
}


