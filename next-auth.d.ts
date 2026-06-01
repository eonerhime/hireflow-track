import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatarUrl: string | null;
      firstName: string | null;
      lastName: string | null;
    } & DefaultSession["user"];
  }

  // This fixes the errors inside the callbacks and authorize methods
  interface User extends DefaultUser {
    avatarUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    avatarUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }
}
