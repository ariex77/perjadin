import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-start gap-2 text-left">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
            <div className="hidden lg:flex h-full flex-col bg-background p-10 flex-1 justify-center items-center">
                <div className='flex flex-col items-center gap-2'>
                    <Link href={route('home')} className="flex items-center text-lg font-medium">
                        <img src="/logo.png" className='w-48' alt="" />
                       
                    </Link>
                    <h1 className='text-4xl font-bold'>{name}</h1>
                    <p className='text-muted-foreground'>Elektronik Pelaporan Perjalanan Dinas</p>
                </div>

            </div>
        </div>
    );
}
