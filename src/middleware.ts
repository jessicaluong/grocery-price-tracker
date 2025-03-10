export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/groceries", "/groceries/:path*"],
};
