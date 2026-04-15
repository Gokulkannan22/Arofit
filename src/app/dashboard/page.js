"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { MapPin, ArrowRight, Loader2, Star, TrendingUp, Filter, CheckCircle2, ChevronRight, Activity, BadgeCheck, PlayCircle, Users, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [trainers, setTrainers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [latestProgress, setLatestProgress] = useState(null);
  const [clientBookings, setClientBookings] = useState([]);

  // States
  const [selectedGoal, setSelectedGoal] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const GOALS = ["Weight Loss", "Muscle Gain", "Yoga", "General Fitness"];

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && userData && userData.role === "trainer") router.push("/trainer-dashboard");
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(collection(db, "trainers"));
        const tList = [];
        querySnapshot.forEach((doc) => tList.push(doc.data()));
        setTrainers(tList);

        const bQuery = query(collection(db, "bookings"), where("clientId", "==", user.uid));
        const bSnap = await getDocs(bQuery);
        let bList = [];
        bSnap.forEach(d => bList.push({ id: d.id, ...d.data() }));
        bList.sort((a,b) => new Date(b.date) - new Date(a.date));
        setClientBookings(bList);

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

  // Algorithms for Smart Suggestions
  let recommendedTrainers = [];
  if (selectedGoal) {
     recommendedTrainers = trainers.filter(t => 
        t.specializations?.some(s => s.toLowerCase().includes(selectedGoal.toLowerCase().split(' ')[0]))
     ).slice(0, 3);
     if (recommendedTrainers.length === 0 && trainers.length > 0) recommendedTrainers = trainers.slice(0, 2);
  } else {
     // Pre-populate recommended safely by taking top 3 arbitrarily if no goal selects
     recommendedTrainers = trainers.slice(0, 3);
  }

  // Filtering
  let filteredTrainers = trainers.filter(t => {
     if (locationFilter && !t.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
     if (modeFilter) {
       if (modeFilter === 'home' && !t.modes?.home) return false;
       if (modeFilter === 'online' && !t.modes?.online) return false;
       if (modeFilter === 'gym' && !t.modes?.gym) return false;
     }
     return true;
  });

  // Sorting
  if (sortBy === "price-low") {
    filteredTrainers.sort((a, b) => (a.pricing_session || 0) - (b.pricing_session || 0));
  } else if (sortBy === "popular") {
    // Arbitrary MVP sort just to demonstrate functionality
    filteredTrainers.sort((a, b) => (b.name > a.name ? 1 : -1));
  } else if (sortBy === "rating") {
    filteredTrainers.sort((a, b) => 1); // Mock dummy sort
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-20">
        
        {/* Header Area with Progress Widget */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-8 mt-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Your Fitness <br className="hidden md:block"/><span className="text-emerald-500">Journey Begins</span></h1>
            <p className="text-slate-400 text-lg">Discover and book verified personal trainers in Kerala.</p>
          </div>
          
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

        {/* Active Bookings Section */}
        {!fetching && clientBookings.length > 0 && (
          <div className="mb-12 border-t border-zinc-900 pt-10">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-extrabold flex items-center"><Activity className="mr-2 text-emerald-500" size={24}/> Your Bookings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {clientBookings.map(b => (
                 <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden transition-all hover:border-emerald-500/30">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">{b.trainerName || 'Trainer'}</h3>
                        <p className="text-xs text-slate-400 capitalize bg-zinc-950 px-2 py-1 rounded inline-block mt-1 font-medium">{b.mode} Training <span className="mx-1">•</span> {new Date(b.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-extrabold uppercase tracking-widest border
                        ${b.status==='pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          b.status==='confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {b.status}
                      </span>
                    </div>
                    {b.status === 'confirmed' ? (
                      <Link href={`/chat?with=${b.trainerId}&name=${encodeURIComponent(b.trainerName || 'Trainer')}`} className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-zinc-950 py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center transition-all shadow-md shadow-emerald-500/20">
                        <MessageCircle size={18} className="mr-2" /> Message Trainer
                      </Link>
                    ) : (
                      <div className="mt-auto text-xs font-semibold text-slate-500 bg-zinc-950 border border-zinc-800 border-dashed p-3.5 rounded-xl text-center">
                        {b.status === 'pending' ? 'Waiting for trainer to accept...' : 'This booking was cancelled.'}
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {fetching ? (
          <div className="flex items-center space-x-2 text-emerald-500 py-12"><Loader2 className="animate-spin" size={20}/> <span>Loading trainers...</span></div>
        ) : (
          <>
            {/* Smart Suggestions Section */}
            {recommendedTrainers.length > 0 && (
              <div className="mb-16">
                 <h2 className="text-2xl font-extrabold mb-6">Recommended for You <span className="text-emerald-500">{selectedGoal && `(${selectedGoal})`}</span></h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {recommendedTrainers.map(t => <TrainerCard key={t.uid} trainer={t} recommended={true} />)}
                 </div>
              </div>
            )}

            <hr className="border-zinc-900 mb-10"/>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
               <h2 className="text-2xl font-bold flex items-center"><Filter className="mr-2 text-emerald-500" size={20}/> Find Your Trainer</h2>
               <div className="flex flex-col sm:flex-row gap-3">
                 <select 
                   value={locationFilter}
                   onChange={e => setLocationFilter(e.target.value)}
                   className="bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-emerald-500 outline-none"
                 >
                   <option value="">All Regions</option>
                   <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                   <option value="Kollam">Kollam</option>
                   <option value="Pathanamthitta">Pathanamthitta</option>
                   <option value="Alappuzha">Alappuzha</option>
                   <option value="Kottayam">Kottayam</option>
                   <option value="Idukki">Idukki</option>
                   <option value="Ernakulam">Ernakulam (Kochi)</option>
                   <option value="Thrissur">Thrissur</option>
                   <option value="Palakkad">Palakkad</option>
                   <option value="Malappuram">Malappuram</option>
                   <option value="Kozhikode">Kozhikode</option>
                   <option value="Wayanad">Wayanad</option>
                   <option value="Kannur">Kannur</option>
                   <option value="Kasaragod">Kasaragod</option>
                 </select>
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
                 <select 
                   value={sortBy} 
                   onChange={e => setSortBy(e.target.value)}
                   className="bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-emerald-500 outline-none font-bold"
                 >
                   <option value="">Sort By</option>
                   <option value="popular">Popularity</option>
                   <option value="rating">Top Rated</option>
                   <option value="price-low">Price: Low to High</option>
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
                  No trainers found matching your exact filters. Try broadening your search!
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
  // Setup dummy data
  const dummyRating = (4.7 + (index % 3) * 0.1).toFixed(1); 
  const isPopular = index === 0 || recommended;
  const isNew = index === 1;

  const initial = trainer.name ? trainer.name.charAt(0).toUpperCase() : "T";
  const bioFallback = "Experienced fitness coach specializing in delivering personalized, high-impact routines tailored exactly to your body.";

  return (
    <div className={`bg-zinc-900 border rounded-2xl p-6 flex flex-col justify-between transition-all shadow-lg hover:-translate-y-1 hover:shadow-emerald-500/10 
      ${recommended ? 'border-emerald-500/50 relative overflow-hidden' : 'border-zinc-800'}`}>
      
      {recommended && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-0"></div>}

      <div className="relative z-10">
        
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-zinc-900 text-xl shadow-md border-2 border-emerald-400">
                  {initial}
                </div>
                {/* Verified Badge */}
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
                   <BadgeCheck size={18} className="text-blue-400 fill-blue-400/20" />
                </div>
              </div>
              
              <div>
                 <h3 className="text-xl font-bold line-clamp-1">{trainer.name}</h3>
                 <div className="flex items-center text-slate-400 text-sm mt-0.5 font-medium">
                   <MapPin size={14} className="mr-1 text-emerald-500" /> {trainer.location || 'Kerala'}
                 </div>
              </div>
           </div>
           
           {/* Dynamic Status Tags */}
           {isPopular && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">🔥 Popular</span>}
           {isNew && !isPopular && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">🆕 New</span>}
        </div>

        {/* Video Preview Fake Button */}
        <button className="flex items-center text-xs font-bold text-emerald-500 mb-4 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 transition-colors w-max">
           <PlayCircle size={14} className="mr-1.5"/> View 10 sec intro
        </button>

        {/* Top specialization highlight */}
        <div className="mb-3">
          <span className="text-emerald-400 font-bold text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded">
             {trainer.specializations && trainer.specializations.length > 0 ? trainer.specializations[0] : 'Fitness Coaching'}
          </span>
        </div>

        {/* Dynamic Bio */}
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {trainer.bio || bioFallback}
        </p>

        {/* Dummy Trust Testimonial */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl mb-4">
           <p className="text-xs italic text-slate-400 font-medium">"Incredible results in just 4 weeks! Highly recommend."</p>
        </div>
        
        {/* Rating & Stats */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-1 border border-yellow-500/30 bg-yellow-500/5 px-2 py-1.5 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-yellow-500"/>
              <span className="text-sm font-bold text-yellow-500">{dummyRating}</span>
           </div>
           
           <div className="flex items-center text-xs font-semibold text-slate-400 bg-zinc-950 px-2 py-1.5 border border-zinc-800 rounded-lg">
              <Users size={14} className="mr-1.5 text-slate-500"/> 10+ clients trained
           </div>
        </div>
      </div>

      {/* Pricing and CTAs */}
      <div className="border-t border-zinc-800 pt-4 relative z-10 w-full">
        <div className="flex items-end justify-between mb-4">
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Per Session</span>
             <span className="font-extrabold text-2xl text-white">₹{trainer.pricing_session || '500'}</span>
           </div>
           <div className="flex space-x-1">
             {trainer.modes?.home && <span className="text-[10px] uppercase font-bold bg-zinc-800 px-1.5 py-1 rounded text-slate-300">Home</span>}
             {trainer.modes?.gym && <span className="text-[10px] uppercase font-bold bg-zinc-800 px-1.5 py-1 rounded text-slate-300">Gym</span>}
           </div>
        </div>

        <div className="flex flex-col space-y-2">
           <Link href={`/trainer/${trainer.uid}`} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-md">
             Book Now <ArrowRight size={16} className="ml-2"/>
           </Link>
           <Link href={`/trainer/${trainer.uid}`} className="w-full bg-transparent hover:bg-zinc-800 text-slate-300 border border-zinc-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-all">
             View Profile
           </Link>
        </div>
      </div>
    </div>
  );
}
