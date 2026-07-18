import 'server-only'
import type { NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, userProfiles } from "@/db/schema";
import {compare} from "bcryptjs";
import { type UserRole, type User as DbUser, type UserProfile } from "@/db/types";
import { checkRateLimit } from "@/lib/rate-limit";

const authSecret = process.env['NEXTAUTH_SECRET'] || process.env['JWT_SECRET'];
if (!authSecret) {
    throw new Error("Missing NEXTAUTH_SECRET (or JWT_SECRET). Refusing to start with an insecure auth secret.");
}
if (authSecret.length < 32 || authSecret === 'super_secret_key') {
    console.warn("[Auth] WARNING: NEXTAUTH_SECRET is weak or too short. Generate a strong secret with: openssl rand -base64 32");
}

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: DbUser['id'];
            role: UserRole;
        } & DefaultSession["user"];
    }

    interface User {
        id: DbUser['id'];
        role: UserRole;
        email: DbUser['email'];
        name: UserProfile['fullName'];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: DbUser['id'];
        role: UserRole;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                // Rate limit: 5 attempts per 15 minutes per email
                const rateCheck = await checkRateLimit({
                    key: `login:${credentials.email.toLowerCase().trim()}`,
                    max: 5,
                    windowMs: 15 * 60 * 1000,
                });
                if (!rateCheck.allowed) {
                    throw new Error(`Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`);
                }

                let user;
                try {
                    const result = await db.select({
                        id: users.id,
                        email: users.email,
                        passwordHash: users.passwordHash,
                        role: users.role,
                        fullName: userProfiles.fullName,
                        isActive: users.isActive
                    })
                    .from(users)
                    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                    .where(eq(users.email, credentials.email))
                    .limit(1);

                    user = result[0];
                } catch (dbError) {
                    console.error("Auth database error:", dbError);
                    throw new Error("Authentication service currently unavailable");
                }

                if (!user || !user.isActive) {
                    throw new Error("Invalid email or password or account deactivated");
                }

                if (!user.passwordHash) {
                    throw new Error("Please set up your account password first.");
                }

                const isPasswordValid = await compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName || "User",
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }): Promise<JWT> {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: authSecret,
};
