import Link from 'next/link';
import { Home, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-slate-50">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-emerald-500 font-bold text-2xl tracking-tighter uppercase relative">
          AroFit
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Log In</Link>
          <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-5 py-2 rounded-full text-sm font-bold transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 md:px-8 mt-12 mb-24">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">Kerala’s Personal Trainer Marketplace</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          Find your trainer. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Train your way.</span> <br/>
          Stay healthy.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12">
          AroFit connects people with real trainers for real results. No more guessing—just personalized guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md mx-auto">
          <Link href="/signup?role=client" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 hover:scale-105 transition-all text-zinc-950 font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20">
            <span>Find Trainers</span>
            <ArrowRight size={20} />
          </Link>
          <Link href="/signup?role=trainer" className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 hover:scale-105 transition-all text-slate-200 font-bold px-8 py-4 rounded-xl flex items-center justify-center shadow-lg">
            <span>Become a Trainer</span>
          </Link>
        </div>
      </main>

      {/* USP Section */}
      <section className="bg-zinc-900 border-t border-zinc-800 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <Home className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Home Training</h3>
              <p className="text-slate-400 leading-relaxed">Trainers come directly to your home. Fitness at your doorstep designed for real-life schedules and optimal comfort.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <MapPin className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Kerala Focus</h3>
              <p className="text-slate-400 leading-relaxed">A marketplace built explicitly for Kerala, serving high-density areas like Kochi and Alleppey to ensure proximity.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <ShieldCheck className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Verified Trainers</h3>
              <p className="text-slate-400 leading-relaxed">Every trainer has a professional profile, showcasing real certifications, real results, and targeted specializations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-zinc-800 bg-zinc-950">
        <p>© 2026 AroFit. Kerala's Personal Trainer Marketplace.</p>
      </footer>

    </div>
  );
}
