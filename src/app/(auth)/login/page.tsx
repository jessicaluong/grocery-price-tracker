import { ShoppingBasket } from "lucide-react";
import LoginForm from "./components/login-form";
import GoogleLoginButton from "./components/google-login-button";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const allowCredentials = process.env.NEXT_PUBLIC_ALLOW_CREDENTIALS === "true";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4 border border-secondary p-6 rounded-xl shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <ShoppingBasket className="size-10 text-themed" />
          <h1 className="text-xl font-bold text-center">
            Welcome to Grocery Price Tracker
          </h1>
          <p className="text-center text-sm text-muted-foreground max-w-sm">
            Sign in with Google to track your grocery prices
          </p>
        </div>
        <GoogleLoginButton />
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>
        <Button variant="secondary">Try Demo</Button>
        {allowCredentials && (
          <>
            <span className="mt-4 font-bold">Form for e2e testing</span>
            <LoginForm />
          </>
        )}
      </div>
    </div>
  );
}
