import NextAuth from "next-auth";

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string
        userId?: string
    refreshToken?: string
    idToken?: string
    }
}

declare module 'next-auth' {
    interface Session {
        accessToken?: string
        userId?: string
    refreshToken?: string
    idToken?: string
    }
}