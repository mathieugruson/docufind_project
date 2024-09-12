'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link';
import React from 'react'

const SigninButton = () => {
    const {data : session } = useSession();

  if (session && session.user) {

      return (
        <Link href={"/api/auth/signout"}>
            Sign out
        </Link>
      
        )
        }

    return (
        <>
        <Link href={"/api/auth/signin"}>
            Sign in
        </Link>
        <Link href={"/sign-up"}>
            Sign up
        </Link>
        </>
    )
}

export default SigninButton