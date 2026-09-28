/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const data = await api.post("/auth/login", credentials);
          return {
            id: data.user.id || data.user.publicId,
            customerId: data.user.customerId,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.accessToken,
          };
        } catch (e) {
					console.log(e);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.customerId = user.customerId;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.customerId = token.customerId;
        session.user.role = token.role;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
