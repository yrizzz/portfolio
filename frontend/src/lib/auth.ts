import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Don't import prisma here - it will be imported only in API routes
// This file is used by middleware which runs in Edge runtime

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Set default role for new users
        token.role = "USER"
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as "ADMIN" | "USER") || "USER"
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
})

