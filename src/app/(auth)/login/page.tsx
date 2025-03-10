import { ShoppingCart } from "lucide-react";
import LoginForm from "./components/login-form";
import GoogleLoginButton from "./components/google-login-button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md">
            <ShoppingCart className="size-6" />
          </div>
          <h1 className="text-xl font-bold">
            Welcome to Grocery Price Tracker
          </h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Sign up
            </Link>{" "}
            or{" "}
            <Link href="#" className="underline underline-offset-4">
              Try Demo
            </Link>
          </div>
        </div>

        <LoginForm className="flex flex-col gap-4" />

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>

        <GoogleLoginButton />
      </div>
    </div>
  );
}
