import DeployButton from "@/components/deploy-button"
import { EnvVarWarning } from "@/components/env-var-warning"
import HeaderAuth from "@/components/header-auth"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { ThemeProvider } from "next-themes"
import Link from "next/link"
import "./globals.css"
import { GeistSans } from "geist/font/sans"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Flashcards",
  description: "MäluSõbrad/KaardiKlubi Flashcard application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
            <nav className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16">
              <div className="flex items-center gap-5 p-3 px-5">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-14 w-auto"
                />
                <Link href="/homepage" className="text-2xl hover:underline">
                  Flashcards
                </Link>
              </div>
              <div className="flex gap-5 items-center p-3 px-5">
                {!hasEnvVars ? (
                  <EnvVarWarning />
                ) : (
                  <>
                    <Link href="/flashcards/create-set">
                      <button className="hover:underline text-3xl">+</button>
                    </Link>
                    <Link href="/my-profile">
                      <button className="hover:underline text-xl">Profile</button>
                    </Link>
                    <HeaderAuth />
                  </>
                )}
              </div>
            </nav>

              <div className="flex flex-col gap-20 max-w-5xl p-5">{children}</div>

              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
