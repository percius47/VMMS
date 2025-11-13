import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Redirect authenticated users to their dashboard
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user.email}!
          </h1>
          <p className="text-gray-600 mb-6">
            Redirecting you to your dashboard...
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-gray-900">
          Vendor Master Management System
        </h1>
  
      </div>

      <div className="mt-16 max-w-3xl text-center">
        <p className="mt-3 text-xl text-gray-600">
          Centralized platform for vendor data management
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Vendor Onboarding
            </h2>
            <p className="mt-2 text-gray-600">
              Streamline the vendor registration and approval process.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Compliance Management
            </h2>
            <p className="mt-2 text-gray-600">
              Track and maintain vendor compliance documentation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Reporting & Analytics
            </h2>
            <p className="mt-2 text-gray-600">
              Generate insights on vendor performance and risk.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
