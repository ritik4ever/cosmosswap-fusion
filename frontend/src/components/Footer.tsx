"use client"

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <span>© 2025 All Rights Reserved</span>
            <span>|</span>
            <span className="flex items-center space-x-1">
              <span>Designed with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>by</span>
              <span className="font-semibold text-white">Ritik</span>
            </span>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
