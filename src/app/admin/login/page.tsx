import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <div className="pattern-girih pointer-events-none fixed inset-0 opacity-[0.04]" aria-hidden />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
