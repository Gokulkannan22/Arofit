"use client";
import { use, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { MapPin, ArrowLeft, Loader2, CheckCircle, BadgeCheck, Star, Users, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function TrainerProfile({ params }) {
  const unwrappedParams = use(params);
  const trainerId = unwrappedParams.uid;

  const { user } = useAuth();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function fetchTrainer() {
      try {
        const docRef = doc(db, "trainers", trainerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTrainer(docSnap.data());
          if (docSnap.data().modes?.home) setMode("home");
          else if (docSnap.data().modes?.online) setMode("online");
          else if (docSnap.data().modes?.gym) setMode("gym");
        } else {
          setError("Trainer not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading trainer profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrainer();
  }, [trainerId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to book a session.");
      return;
    }
    setBookingLoading(true);
    try {
       await addDoc(collection(db, "bookings"), {
         trainerId,
         trainerName: trainer.name || "Trainer",
         clientId: user.uid,
         clientName: user.displayName || "Client",
         clientEmail: user.email,
         date,
         time,
         mode,
         status: "pending",
         createdAt: new Date().toISOString()
       });
       setBookingSuccess(true);
       setDate(""); setTime("");
    } catch(err) {
       console.error("Booking failed", err);
       alert("Failed to book session.");
    } finally {
       setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;
  if (error) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center text-red-500 font-bold">{error}</div>;

  const initial = trainer?.name ? trainer.name.charAt(0).toUpperCase() : "T";
  const bioFallback = "Experienced fitness coach specializing in delivering personalized, high-impact routines tailored exactly to your body. Dedicated to helping you reach your maximum potential.";

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-24">
        <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 flex items-center mb-8 font-bold w-max transition-colors">
          <ArrowLeft size={16} className="mr-2"/> Back to Find Your Trainer
        </Link>

        {trainer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative items-start">
            
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Header Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:space-x-8">
                  
                  {/* Large Avatar */}
                  <div className="relative group mb-6 md:mb-0 w-max mx-auto md:mx-0">
                    {trainer.imageBase64 ? (
                      <img src={trainer.imageBase64} alt={trainer.name} className="h-28 w-28 rounded-full object-cover shadow-lg border-4 border-emerald-400" />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-zinc-900 text-5xl shadow-lg border-4 border-emerald-400">
                        {initial}
                      </div>
                    )}
                    {/* Verified Badge Big */}
                    <div className="absolute bottom-0 right-0 bg-zinc-900 rounded-full p-1 shadow-md">
                       <BadgeCheck size={28} className="text-blue-400 fill-blue-400/20" />
                    </div>
                  </div>

                  {/* Title & Trust */}
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">{trainer.name}</h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                       <span className="flex items-center text-slate-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <MapPin size={14} className="mr-1.5 text-emerald-500"/> {trainer.location}
                       </span>
                       <span className="flex items-center text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                          <Star size={14} className="mr-1.5 fill-yellow-500"/> 4.8 Rating
                       </span>
                       <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                          <Users size={14} className="mr-1.5 text-emerald-500"/> 10+ Clients
                       </span>
                    </div>

                    {(trainer.introVideoUrl || "").includes("http") ? (
                      <a href={trainer.introVideoUrl} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold text-emerald-500 mb-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 transition-colors mx-auto md:mx-0 w-max">
                         <PlayCircle size={16} className="mr-2"/> Watch Intro Video
                      </a>
                    ) : (
                      <button className="flex items-center text-xs font-bold text-emerald-500 mb-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 transition-colors mx-auto md:mx-0">
                         <PlayCircle size={16} className="mr-2"/> View 10 sec intro video
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & Certs Card */}
              <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center"><CheckCircle className="mr-2 text-emerald-500" size={20}/> About Me</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium mb-6">
                  {trainer.bio || bioFallback}
                </p>
                
                {trainer.certifications && (
                   <>
                     <h3 className="text-sm uppercase tracking-widest font-extrabold text-emerald-500 mb-3 border-t border-zinc-800 pt-6">Credentials</h3>
                     <p className="text-slate-400 text-sm font-medium whitespace-pre-wrap leading-relaxed">{trainer.certifications}</p>
                   </>
                )}
              </div>

              {/* Reviews Card (Trust System) */}
              <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-md">
                <h2 className="text-xl font-bold mb-6 flex items-center"><Star className="mr-2 text-emerald-500 fill-emerald-500/20" size={20}/> Client Reviews</h2>
                
                <div className="space-y-4">
                   <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                     <div className="flex items-center mb-2">
                        <div className="flex bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded mr-3">
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                        </div>
                        <span className="font-bold text-sm text-slate-300">Rahul M.</span>
                     </div>
                     <p className="text-slate-400 text-sm leading-relaxed italic">"Absolutely phenomenal trainer. Pushed me past my limits while keeping me safe. Highly recommend for anyone looking to seriously level up in Kerala!"</p>
                   </div>
                   
                   <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                     <div className="flex items-center mb-2">
                        <div className="flex bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded mr-3">
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                          <Star size={12} className="text-yellow-500 fill-slate-700"/>
                        </div>
                        <span className="font-bold text-sm text-slate-300">Sneha K.</span>
                     </div>
                     <p className="text-slate-400 text-sm leading-relaxed italic">"Great experience. Very punctual for home workouts and tailors the diet plan perfectly."</p>
                   </div>
                </div>
              </div>

            </div>

            {/* Right: Booking Form STICKY */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-zinc-900 border-2 border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                 {/* Booking Guarantee UI Element */}
                 <div className="absolute top-0 left-0 w-full bg-emerald-500/10 border-b border-emerald-500/20 p-2 flex justify-center items-center">
                    <ShieldCheck size={14} className="text-emerald-500 mr-2"/>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AroFit Protected Booking</span>
                 </div>

                 <h2 className="text-2xl font-extrabold mb-2 mt-6">Book a Session</h2>
                 <p className="text-emerald-500 font-extrabold text-3xl mb-1">₹{trainer.pricing_session} <span className="text-slate-500 text-sm font-medium">/ session</span></p>
                 {trainer.pricing_monthly > 0 && <p className="text-slate-400 font-bold text-sm mb-6">Or ₹{trainer.pricing_monthly} monthly package</p>}
                 {!trainer.pricing_monthly && <div className="mb-6"></div>}

                 {trainer.packageIncludes && trainer.packageIncludes.length > 0 && (
                    <div className="mb-8 border border-zinc-800 bg-zinc-950 rounded-2xl p-4">
                       <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Package Includes</p>
                       <ul className="space-y-2">
                         {trainer.packageIncludes.map(pkg => (
                           <li key={pkg} className="flex items-center text-sm text-slate-300 font-medium whitespace-nowrap"><CheckCircle size={14} className="text-emerald-500 mr-2 shrink-0"/> {pkg}</li>
                         ))}
                       </ul>
                    </div>
                 )}
                 
                 {bookingSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-inner">
                       <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48}/>
                       <h3 className="font-extrabold text-2xl text-white mb-2">Booking Requested!</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">The trainer has been notified. You can check the status and chat with them in your <Link href="/dashboard" className="text-emerald-500 underline font-bold">Dashboard</Link>.</p>
                    </div>
                 ) : (
                    <form onSubmit={handleBooking} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Pick a Date</label>
                        <input type="date" required value={date} onChange={(e)=>setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"/>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Pick a Time</label>
                        <input type="time" required value={time} onChange={(e)=>setTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"/>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Select Training Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                           {trainer.modes?.home && (
                             <button type="button" onClick={()=>setMode("home")} className={`py-2.5 rounded-xl text-sm font-extrabold border shadow-sm transition-all ${mode==='home'?'bg-emerald-500 border-emerald-500 text-zinc-950 scale-105':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Home</button>
                           )}
                           {trainer.modes?.online && (
                             <button type="button" onClick={()=>setMode("online")} className={`py-2.5 rounded-xl text-sm font-extrabold border shadow-sm transition-all ${mode==='online'?'bg-emerald-500 border-emerald-500 text-zinc-950 scale-105':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Online</button>
                           )}
                           {trainer.modes?.gym && (
                             <button type="button" onClick={()=>setMode("gym")} className={`py-2.5 rounded-xl text-sm font-extrabold border shadow-sm transition-all ${mode==='gym'?'bg-emerald-500 border-emerald-500 text-zinc-950 scale-105':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Gym</button>
                           )}
                        </div>
                        {mode === 'home' && trainer.travelRadius && (
                           <p className="text-xs text-yellow-500 mt-2 font-medium bg-yellow-500/10 px-2 py-1.5 rounded border border-yellow-500/20">Trainer travels up to {trainer.travelRadius} km from their base location.</p>
                        )}
                      </div>
                      
                      <button type="submit" disabled={bookingLoading || !mode} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-extrabold px-6 py-4 rounded-xl flex items-center justify-center transition-all mt-6 shadow-xl shadow-emerald-500/20 text-lg">
                        {bookingLoading ? <Loader2 className="animate-spin" size={24}/> : "Book Now"}
                      </button>
                      {!user && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-bold text-center mt-4">You must be logged in to book a trainer.</div>}
                    </form>
                 )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
