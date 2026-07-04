import Image from "next/image"

export default function ShowcaseSidebar() {
  return (
    <div className="hidden md:flex md:w-[45%] lg:w-[40%] p-2 flex-col justify-stretch relative h-[calc(100vh-2rem)] min-h-[600px] select-none">
      <div className="relative w-full h-full rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-8 lg:p-12 border border-white/5 shadow-2xl bg-[#0a0a0a]">
        
        {/* Background Image */}
        <Image
          src="/login_left_bg.png"
          alt="Abstract Background"
          fill
          priority
          className="object-cover object-center z-0 opacity-95"
        />
        
        {/* Subtle Dark Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0" />

        {/* Top Branding Logo */}
        <div className="z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10 shadow-lg p-1.5 backdrop-blur-md">
            <Image 
              src="/logos/logo.png" 
              alt="Mailvex Logo" 
              width={24} 
              height={24} 
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans drop-shadow-md">
            Mailvex
          </span>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10 space-y-1 text-white pr-4">
          <h2 className="text-3xl lg:text-[40px] xl:text-[44px] font-extralight leading-[1.2] tracking-tight">
            Be a Part of
          </h2>
          <h2 className="text-3xl lg:text-[40px] xl:text-[44px] font-extralight leading-[1.2] tracking-tight">
            Something <span className="font-bold text-white">Beautiful</span>
          </h2>
        </div>
      </div>
    </div>
  )
}

