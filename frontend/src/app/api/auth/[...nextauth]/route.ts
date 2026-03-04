import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@nexthome.ai" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // This is a simple mock authorization. 
                // In production, you would fetch the user from a database.
                if (credentials?.email === "admin@nexthome.ai" && credentials?.password === "admin123") {
                    return { id: "1", name: "Admin User", email: "admin@nexthome.ai" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key-12345",
});

export { handler as GET, handler as POST };
