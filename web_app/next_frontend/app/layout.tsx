import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Metadata } from 'next'
import './globals.css'
import { TanstackProvider } from './_providers/TanstackProvider'
import Providers from './_components/Providers'
import SigninButton from './_components/SigninButton'

type Props = {
    children: ReactNode
}

export const metadata: Metadata = {
    title: {
        template: '%s | Acme',
        default: 'Acme', // a default is required when creating a template
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className='h-full'>
            <body className='h-full' >
                <Providers>
                    <Head>
                        <meta charSet="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                    </Head>
                    <header className='bg-[#2c2c2c] h-[50px] z-15 border-t border-[#515151]'>
                    <SigninButton/>
                    </header>
                    <div className='relative flex h-[calc(100%-50px)]'>
                    <TanstackProvider>
                        {children}
                    </TanstackProvider>
                    </div>
                    <footer>
                    </footer>
                </Providers>
            </body>
        </html>
    )
}