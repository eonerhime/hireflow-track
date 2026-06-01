import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          avatarUrl: user.avatarUrl ?? null,
          firstName: user.firstName ?? null, // Pulls updated profile data on login
          lastName: user.lastName ?? null, // Pulls updated profile data on login
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email: user.email,
              password: "",
              avatarUrl: user.image ?? null,
              // firstName and lastName naturally default to null/empty here
            },
          });
          user.id = created.id;
          user.avatarUrl = created.avatarUrl;
        } else {
          user.id = existing.id;

          // 🔥 FIX: Pull the user's updated profile details from the DB
          // and attach them to the 'user' object so the 'jwt' callback can see them!
          (user as any).firstName = existing.firstName ?? null;
          (user as any).lastName = existing.lastName ?? null;

          if (user.image && user.image !== existing.avatarUrl) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { avatarUrl: user.image },
            });
          }
          user.avatarUrl = user.image ?? existing.avatarUrl ?? null;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // Runs on initial sign in
      if (user) {
        token.userId = user.id;
        token.avatarUrl = user.avatarUrl ?? null;
        token.firstName = (user as any).firstName ?? null;
        token.lastName = (user as any).lastName ?? null;
      }

      // Automatically updates the client side session without requiring a logout/login!
      if (trigger === "update" && token.userId) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { avatarUrl: true, firstName: true, lastName: true },
        });
        if (fresh) {
          token.avatarUrl = fresh.avatarUrl ?? null;
          token.firstName = fresh.firstName ?? null;
          token.lastName = fresh.lastName ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.avatarUrl = token.avatarUrl ?? null;
        session.user.firstName = token.firstName ?? null;
        session.user.lastName = token.lastName ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
