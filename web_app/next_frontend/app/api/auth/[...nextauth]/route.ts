import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"


async function refreshToken(token: JWT): Promise<JWT> {
    const res = await fetch(`http://nginx:${process.env.NEXT_PUBLIC_NGINX_PORT}/back_api/auth/refresh`, {
      method: "POST",
      headers: {
        authorization: `Refresh ${token.backendTokens.refreshToken}`,
      },
    });
    console.log("refreshed");
  
    const response = await res.json();
  
    return {
        ...token,
        backendTokens: {
            accessToken: response.backendTokens.accessToken,
            refreshToken: response.backendTokens.refreshToken,
            expiresIn: response.backendTokens.expiresIn
        },
      };
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
        async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const secretKey = process.env.NEXTAUTH_SECRET;
                console.log('secretKey\n', secretKey);
                console.log('${process.env.NEXT_PUBLIC_NGINX_PORT}\n', `${process.env.NEXT_PUBLIC_NGINX_PORT}`);

                const url = `http://nginx:${process.env.NEXT_PUBLIC_NGINX_PORT}/back_api/auth/login`;
                const { username, password } = credentials;
                try {
                    
                    const res = await fetch(url, {
                        method: "POST",
                        body: JSON.stringify({ username, password }),
                        headers: { 'Content-Type': 'application/json' },
                    });

                    if (res.status === 401) {
                        // For production, consider a more secure error handling strategy
                        console.log("Authentication failed");
                        return null;
                    }

                    const user = await res.json();
                    console.log('user\n', user);
                    
                    return user;
                } catch (error) {
                    console.error("Authentication request failed", error);
                    return null;
                }
            },
        }),
    ],
    callbacks : {
        async jwt({ token, user }) {
            if (user) return { ...token, ...user };
      
            if (new Date().getTime() < token.backendTokens.expiresIn)
              return token;
      
            return await refreshToken(token);
          },
        async session({token, session}) {
            session.user = token.user
            session.backendTokens = token.backendTokens
            return session
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST}

// https://www.youtube.com/watch?v=khNwrFJ-Xqs 1h
// https://next-auth.js.org/configuration/callbacks