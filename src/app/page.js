import Link from 'next/link';
import { Home, MapPin, ShieldCheck, ArrowRight, UserCheck, CalendarCheck, Search } from 'lucide-react';

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
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-400">100+ Trainers joining soon • Built for Kerala</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          Find your trainer. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Train your way.</span> <br/>
          Stay healthy.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-4">
          AroFit connects people with real trainers for real results. No more guessing—just personalized guidance.
        </p>

        <p className="text-lg md:text-xl font-bold text-emerald-500 max-w-2xl mb-12">
          👉 Book real trainers to your home — not just online workouts.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-xl mx-auto">
          <Link href="/signup?role=client" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 hover:scale-105 transition-all text-zinc-950 font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20">
            <span>🔥 Find Trainers Near You</span>
            <ArrowRight size={20} />
          </Link>
          <Link href="/signup?role=trainer" className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 hover:scale-105 transition-all text-slate-200 font-bold px-8 py-4 rounded-xl flex items-center justify-center shadow-lg">
            <span>🔥 Join as a Trainer</span>
          </Link>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="bg-zinc-950 py-20 px-6 md:px-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-white tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
            
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] border-t-2 border-zinc-800 border-dashed z-0"></div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="h-20 w-20 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-extrabold text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Create a Profile</h3>
              <p className="text-slate-400 px-4">Sign up and tell us about your fitness goals and preferences.</p>
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="h-20 w-20 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-extrabold text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Discover Trainers</h3>
              <p className="text-slate-400 px-4">Browse verified trainers in your city who match your specific needs.</p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="h-20 w-20 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-extrabold text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Book a Session</h3>
              <p className="text-slate-400 px-4">Schedule your trainer to come to your home, a local gym, or train online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="bg-zinc-900 border-t border-zinc-800 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-sm">
                <Home className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Home Training</h3>
              <p className="text-slate-400 leading-relaxed">Trainers come directly to your home. Fitness at your doorstep designed for real-life schedules and optimal comfort.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-sm">
                <MapPin className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Kerala Focus</h3>
              <p className="text-slate-400 leading-relaxed">A marketplace built explicitly for Kerala, serving high-density areas like Kochi and Alleppey to ensure proximity.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-sm">
                <ShieldCheck className="text-emerald-500 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Verified Trainers</h3>
              <p className="text-slate-400 leading-relaxed">Every trainer has a professional profile, showcasing real certifications, real results, and targeted specializations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Senior Angle Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-400 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mb-3 tracking-tight">
            👵🏻 Fitness for all ages
          </h2>
          <p className="text-zinc-900 font-bold text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Including specialized home-based training designed purely for seniors.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm bg-zinc-950">
        <p>© 2026 AroFit. Kerala's Personal Trainer Marketplace.</p>
      </footer>

    </div>
  );
}
