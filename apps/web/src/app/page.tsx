import TerminalText from "../components/ui-effects/terminal-text";
import ExampleImages from "../components/example-images";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { UploadSection } from "@/components/upload-section";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-black/30 backdrop-blur-[4px] text-white relative overflow-hidden z-10">
        <TopNav />
        <section className="container px-4 py-12 mx-auto flex-grow relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col">
              <div className="inline-flex items-center px-3 py-1 mb-4 text-xs border border-zinc-700 text-zinc-400 w-fit relative overflow-hidden">
                <span className="mr-2 relative z-10">v1.0</span>
                <span className="text-zinc-500 relative z-10 uppercase">
                  beta
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/0 via-zinc-800/10 to-zinc-900/0 animate-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold mb-4 md:text-4xl relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                  Tarkov Item Identifier
                </span>
                <div className="absolute -left-4 top-1/2 w-2 h-8 bg-zinc-700 transform -translate-y-1/2"></div>
              </h1>
              <div className="text-zinc-400 mb-6 font-mono border-l-2 border-zinc-700 pl-4">
                <TerminalText
                  text="Upload screenshots of your Escape from Tarkov inventory, stash, or loot containers and instantly identify all items."
                  typingSpeed={15}
                />
              </div>
            </div>
            <div className="relative">
              <UploadSection />
            </div>
          </div>
        </section>
        <section className="container px-4 pb-16 mx-auto relative z-10">
          <div className="border-t border-zinc-800 pt-12 pb-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="w-6 h-1 bg-zinc-700 mr-3"></div>
              Try with Examples
              <div className="w-6 h-1 bg-zinc-700 ml-3"></div>
            </h2>
            <p className="text-zinc-400 mb-8 max-w-3xl">
              Don't have a Tarkov screenshot handy? Click on any of these
              inventory examples to test Tarkov Vision.
            </p>
            <ExampleImages />
          </div>
        </section>
        <Footer />
      </div>
      <Image
        className="inset-0 w-full h-[700px] object-cover opacity-50 absolute [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0))] [-webkit-mask-image:-webkit-gradient(linear,left_top,left_bottom,from(rgba(0,0,0,1)),to(rgba(0,0,0,0)))]"
        src="/hero.png"
        quality={100}
        alt="Hero background image"
        width={1920}
        height={700}
        priority
      />
    </>
  );
}
