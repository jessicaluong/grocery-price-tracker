import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const verifySession = cache(async (options = { redirect: true }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    if (options.redirect) redirect("/login");
    return null;
  }
  return { userId: session.user.id };
});
