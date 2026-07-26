import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/app/login/login-form";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center py-section-sm">
      <Container size="narrow" className="max-w-md">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/kmoia-logo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="size-14 w-auto object-contain dark:hidden"
          />
          <Image
            src="/brand/kmoia-logo-white.png"
            alt=""
            width={56}
            height={56}
            priority
            className="hidden size-14 w-auto object-contain dark:block"
          />
          <h1 className="text-h2 mt-6">Administration</h1>
          <p className="mt-3 text-muted">
            Sign in to manage {siteConfig.name} content.
          </p>
        </div>

        <div className="mt-10 rounded-lg border border-line bg-surface p-7 shadow-soft">
          <LoginForm next={next} />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Accounts are created by invitation only.{" "}
          <Link
            href="/"
            className="text-brand-600 underline-offset-4 hover:underline dark:text-brand-500"
          >
            Return to the website
          </Link>
        </p>
      </Container>
    </main>
  );
}
