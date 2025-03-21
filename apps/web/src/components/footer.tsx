import Link from "next/link";
import { Github, DiscIcon as Discord, FileText, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 py-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-3">TARKOV VISION</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Advanced item recognition for Escape from Tarkov. Identify items,
              check prices, and make better looting decisions.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/BetrixDev/tarkov-vision"
                className="text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={20} />
              </Link>
              <Link
                href="https://discord.com"
                className="text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Discord size={20} />
              </Link>
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-400 mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-400 mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors"
                >
                  Discord Server
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors"
                >
                  GitHub Discussions
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-sm font-medium uppercase tracking-wider text-zinc-400 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors flex items-center"
                >
                  <FileText size={14} className="mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-zinc-300 hover:text-white text-sm transition-colors flex items-center"
                >
                  <Shield size={14} className="mr-2" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center px-8">
        <div className="text-zinc-500 text-sm mb-4 md:mb-0">
          © 2025 Tarkov Vision.
        </div>
        <div className="text-zinc-500 text-sm">
          Tarkov Vision is not affiliated with Battlestate Games
        </div>
      </div>
    </footer>
  );
}
