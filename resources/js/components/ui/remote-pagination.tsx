import * as React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface RemotePaginationProps {
    current: number;
    last: number;
    onChange: (page: number) => void;
    className?: string;
    from?: number;
    to?: number;
    total?: number;
    search?: string;
}

export function RemotePagination({ current, last, onChange, className, from, to, total, search }: RemotePaginationProps) {
    const pages = React.useMemo<(number | '...')[]>(() => {
        if (!last || last <= 1) return [1];
        if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
        if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
        return [1, '...', current - 1, current, current + 1, '...', last];
    }, [current, last]);

    const summary = React.useMemo(() => {
        if (typeof total !== 'number') return null;
        if (search) return `Ditemukan ${total} hasil untuk "${search}"`;
        if (typeof from === 'number' && typeof to === 'number') return `Menampilkan ${from} - ${to} dari ${total} hasil`;
        return null;
    }, [from, to, total, search]);

    return (
        <div className={`flex items-center justify-between w-full ${className ?? ''}`}>
            <div className="text-sm w-full">
                {summary}
            </div>
            <Pagination className="w-full flex justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            size="icon"
                            aria-label="Sebelumnya"
                            className={current === 1 ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(e) => {
                                e.preventDefault();
                                if (current > 1) onChange(current - 1);
                            }}
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                    {pages.map((p, idx) => (
                        <PaginationItem key={`${p}-${idx}`}>
                            {p === '...' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={p === current}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onChange(Number(p));
                                    }}
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            size="icon"
                            aria-label="Berikutnya"
                            className={current === last ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(e) => {
                                e.preventDefault();
                                if (current < last) onChange(current + 1);
                            }}
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}


