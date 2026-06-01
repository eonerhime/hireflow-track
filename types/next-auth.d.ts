import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      avatarUrl?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    };
  }

  interface User {
    avatarUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    avatarUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }
}
