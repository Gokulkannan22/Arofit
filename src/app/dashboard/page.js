"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { MapPin, ArrowRight, Loader2, Star, TrendingUp, Filter, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [trainers, setTrainers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [latestProgress, setLatestProgress] = useState(null);

  // States for UX Feature Request
  const [selectedGoal, setSelectedGoal] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  const GOALS = ["Weight Loss", "Muscle Gain", "Yoga", "General Fitness"];

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && userData && userData.role === "trainer") router.push("/trainer-dashboard");
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Fetch Trainers
        const querySnapshot = await getDocs(collection(db, "trainers"));
        const tList = [];
        querySnapshot.forEach((doc) => tList.push(doc.data()));
        setTrainers(tList);

        // Fetch User's Latest Progress Widget Data
        const pQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid)
        );
        const pSnap = await getDocs(pQuery);
        let pList = [];
        pSnap.forEach(d => pList.push(d.data()));
        if (pList.length > 0) {
          pList.sort((a,b) => new Date(b.date) - new Date(a.date));
          setLatestProgress(pList[0]);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    if (user && userData?.role !== "trainer") fetchData();
  }, [user, userData]);

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  // Algorithms for Smart Suggestions & Filtering
  let recommendedTrainers = [];
  if (selectedGoal) {
     recommendedTrainers = trainers.filter(t => 
        t.specializations?.some(s => s.toLowerCase().includes(selectedGoal.toLowerCase().split(' ')[0]))
     ).slice(0, 3); // Top 3 recommendations
     // Give fake recommendations if empty just so UI doesn't look dead for MVP
     if (recommendedTrainers.length === 0 && trainers.length > 0) recommendedTrainers = [trainers[0]];
  }

  // Raw Filter
  let filteredTrainers = trainers.filter(t => {
     if (locationFilter && !t.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
     if (modeFilter) {
       if (modeFilter === 'home' && !t.modes?.home) return false;
       if (modeFilter === 'online' && !t.modes?.online) return false;
       if (modeFilter === 'gym' && !t.modes?.gym) return false;
     }
     return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-20">
        
        {/* Header Area with Progress Widget */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Your Fitness <br className="hidden md:block"/><span className="text-emerald-500">Journey Begins</span></h1>
            <p className="text-slate-400 text-lg">Discover and book verified personal trainers in Kerala.</p>
          </div>
          
          {/* Progress Widget (Top Right) */}
          <Link href="/progress" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center hover:border-emerald-500/50 transition-colors shadow-lg min-w-[280px]">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center mr-4">
              <Activity className="text-emerald-500" size={24}/>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Latest Log</p>
              {latestProgress ? (
                 <div className="flex items-end space-x-2">
                   <span className="text-2xl font-extrabold text-white">{latestProgress.weight} <span className="text-sm text-slate-500 font-medium">kg</span></span>
                   <span className="text-xs text-emerald-500 font-medium pb-1 flex items-center"><TrendingUp size={12} className="mr-1"/> Track</span>
                 </div>
              ) : (
                 <span className="text-sm text-emerald-500 font-bold underline">Record your first weight</span>
              )}
            </div>
            <ChevronRight className="ml-auto text-slate-600" size={20}/>
          </Link>
        </div>

        {/* Goal Section */}
        <div className="mb-12">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center">
             <CheckCircle2 className="mr-2 text-emerald-500" size={20}/> What is your goal?
           </h2>
           <div className="flex flex-wrap gap-3">
             {GOALS.map(goal => (
               <button 
                 key={goal}
                 onClick={() => setSelectedGoal(selectedGoal === goal ? "" : goal)}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm
                   ${selectedGoal === goal 
                     ? 'bg-emerald-500 text-zinc-950 border border-emerald-500' 
                     : 'bg-zinc-900 text-slate-300 border border-zinc-800 hover:border-emerald-500/50'}`}
               >
                 {goal}
               </button>
             ))}
           </div>
        </div>

        {fetching ? (
          <div className="flex items-center space-x-2 text-emerald-500 py-12"><Loader2 className="animate-spin" size={20}/> <span>Loading trainers...</span></div>
        ) : (
          <>
            {/* Smart Suggestions Section */}
            {selectedGoal && recommendedTrainers.length > 0 && (
              <div className="mb-16">
                 <h2 className="text-2xl font-extrabold mb-6">Recommended for You <span className="text-emerald-500">({selectedGoal})</span></h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {recommendedTrainers.map(t => <TrainerCard key={t.uid} trainer={t} recommended={true} />)}
                 </div>
              </div>
            )}

            <hr className="border-zinc-900 mb-10"/>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
               <h2 className="text-2xl font-bold flex items-center"><Filter className="mr-2 text-emerald-500" size={20}/> Explore Directory</h2>
               <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                   type="text" 
                   placeholder="Location (e.g. Kochi)" 
                   value={locationFilter}
                   onChange={e => setLocationFilter(e.target.value)}
                   className="bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                 />
                 <select 
                   value={modeFilter} 
                   onChange={e => setModeFilter(e.target.value)}
                   className="bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-emerald-500 outline-none"
                 >
                   <option value="">All Modes</option>
                   <option value="home">Home Training</option>
                   <option value="gym">Gym Training</option>
                   <option value="online">Online Training</option>
                 </select>
               </div>
            </div>
            
            {/* All Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((t, i) => (
                <TrainerCard key={t.uid} trainer={t} index={i} />
              ))}
              {filteredTrainers.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed">
                  No trainers found matching your filters.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------------------------- //
// Upgraded Trainer Card Component
// -------------------------------------------------------------------------------- //
function TrainerCard({ trainer, recommended = false, index = 0 }) {
  // Setup dummy data for MVP visual completeness
  const dummyRating = (4.5 + (index % 5) * 0.1).toFixed(1); 
  const isPopular = index === 0 || index === 2;
  const isNew = index === 1;

  // Extract avatar initial
  const initial = trainer.name ? trainer.name.charAt(0).toUpperCase() : "T";

  return (
    <div className={`bg-zinc-900 border rounded-2xl p-6 flex flex-col justify-between transition-all shadow-lg hover:-translate-y-1 hover:shadow-emerald-500/10 
      ${recommended ? 'border-emerald-500/50 relative overflow-hidden' : 'border-zinc-800'}`}>
      
      {/* Recommended background pulse */}
      {recommended && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-0"></div>}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
           <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-zinc-900 text-xl shadow-md border-2 border-emerald-400">
                {initial}
              </div>
              <div>
                 <h3 className="text-xl font-bold line-clamp-1">{trainer.name}</h3>
                 <div className="flex items-center text-slate-400 text-sm mt-0.5">
                   <MapPin size={14} className="mr-1 text-emerald-500" /> {trainer.location || 'Kerala'}
                 </div>
              </div>
           </div>
           
           {/* Tags */}
           {isPopular && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">🔥 Popular</span>}
           {isNew && !isPopular && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">🆕 New</span>}
        </div>

        {/* Top specialization highlight */}
        <div className="mb-3">
          <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded">
             {trainer.specializations && trainer.specializations.length > 0 ? trainer.specializations[0] : 'Fitness Coaching'}
          </span>
        </div>

        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {trainer.bio || "No bio available. Book a session to connect directly."}
        </p>
        
        {/* Rating & Modes */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-1 border border-yellow-500/30 bg-yellow-500/5 px-2 py-1 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-yellow-500"/>
              <span className="text-sm font-bold text-yellow-500">{dummyRating}</span>
           </div>
           
           <div className="flex space-x-1">
             {trainer.modes?.home && <span className="text-[10px] uppercase font-bold bg-zinc-800 px-2 py-1 rounded text-slate-300">Home</span>}
             {trainer.modes?.online && <span className="text-[10px] uppercase font-bold bg-zinc-800 px-2 py-1 rounded text-slate-300">Online</span>}
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800 relative z-10 w-full">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Per Session</span>
          <span className="font-extrabold text-xl text-white">₹{trainer.pricing_session || '500'}</span>
        </div>
        <Link href={`/trainer/${trainer.uid}`} className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-md">
          View Profile
        </Link>
      </div>
    </div>
  );
}
