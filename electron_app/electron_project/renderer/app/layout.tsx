import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Metadata } from 'next'
import './globals.css'
import { TanstackProvider } from './_providers/TanstackProvider'

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
                    <Head>
                        <meta charSet="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                    </Head>
                    <header>
                    </header>
                    <div className='h-full' >
                    <TanstackProvider>
                        {children}
                    </TanstackProvider>
                    </div>
                    <footer>
                    </footer>
            </body>
        </html>
    )
}