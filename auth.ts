import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !passwordHash) {
          console.error("Admin login environment variables are missing.");
          return null;
        }

        if (email !== adminEmail) {
          console.error("Admin email does not match.");
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          passwordHash
        );

        if (!passwordMatches) {
          console.error("Admin password does not match.");
          return null;
        }

        return {
          id: "admin",
          name: "Aurvino Admin",
          email: adminEmail,
        };
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
  },
});