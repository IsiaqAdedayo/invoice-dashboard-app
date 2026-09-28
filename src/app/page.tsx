"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = session.user?.role;
    router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Invoice Dashboard
        </h1>
        <p className="text-sm text-slate-300">Redirecting...</p>
      </div>
    </div>
  );
}
