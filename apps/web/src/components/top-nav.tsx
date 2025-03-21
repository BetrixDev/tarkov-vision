import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@daveyplate/better-auth-ui";

export function TopNav() {
  return (
    <header className="border-b bg-background/75 backdrop-blur-sm border-zinc-800 relative z-10">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold uppercase">Tarkov Vision</h1>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#"
              className="text-sm hover:text-zinc-300 transition-colors"
            >
              docs
            </Link>
            <a
              href="#"
              className="text-sm hover:text-zinc-300 transition-colors"
            >
              community
            </a>
            <a
              href="https://github.com/BetrixDev/tarkov-vision"
              className="text-primary hover:text-primary/65 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
          <UserButton
            classNames={{
              content: {
                base: "rounded-none",
                menuItem: "rounded-none",
              },
            }}
          />
        </nav>
      </div>
    </header>
  );
}
