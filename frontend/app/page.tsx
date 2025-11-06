import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
          Instagram Light
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Fast • SEO-Ready • Minimal
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="outline">
            Register
          </Button>
        </Link>
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-secondary/20">
        <h2 className="text-xl font-semibold mb-4">✨ Features</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ JWT Authentication</li>
          <li>✅ Protected Routes</li>
          <li>✅ Beautiful UI with Shadcn</li>
          <li>✅ Modern Next.js App Router</li>
          <li>✅ TypeScript</li>
        </ul>
      </div>
    </main>
  );
}
