export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/leads/:path*",
        "/settings/:path*",
        "/pipeline/:path*",
        "/market/:path*",
        "/alerts/:path*",
    ],
};
