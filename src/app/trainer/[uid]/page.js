"use client";
import { use, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { MapPin, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
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
          // default mode
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

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 flex items-center mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2"/> Back to Discover
        </Link>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>
        ) : error ? (
           <div className="text-red-500 text-center py-20">{error}</div>
        ) : trainer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">{trainer.name}</h1>
                <div className="flex items-center text-slate-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg w-max">
                   <MapPin size={16} className="mr-2 text-emerald-500"/> {trainer.location}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-md">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {trainer.bio || "No bio provided."}
                </p>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-md">
                <h2 className="text-xl font-bold mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-3">
                  {(trainer.specializations?.length ? trainer.specializations : ["Weight Loss", "General Fitness"]).map(s => (
                     <span key={s} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl sticky top-6">
                 <h2 className="text-2xl font-bold mb-2">Book a Session</h2>
                 <p className="text-emerald-500 font-bold text-lg mb-6">₹{trainer.pricing_session} <span className="text-slate-500 text-sm font-normal">/ session</span></p>
                 
                 {bookingSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center">
                       <CheckCircle className="text-emerald-500 mx-auto mb-3" size={32}/>
                       <h3 className="font-bold text-white mb-2">Booking Requested!</h3>
                       <p className="text-slate-400 text-sm">The trainer will be notified to confirm your session.</p>
                       <button onClick={()=>setBookingSuccess(false)} className="mt-4 text-emerald-500 text-sm underline">Book another</button>
                    </div>
                 ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                        <input type="date" required value={date} onChange={(e)=>setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Time</label>
                        <input type="time" required value={time} onChange={(e)=>setTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Training Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                           {trainer.modes?.home && (
                             <button type="button" onClick={()=>setMode("home")} className={`py-2 rounded-lg text-sm font-medium border ${mode==='home'?'bg-emerald-500 border-emerald-500 text-zinc-950':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Home</button>
                           )}
                           {trainer.modes?.online && (
                             <button type="button" onClick={()=>setMode("online")} className={`py-2 rounded-lg text-sm font-medium border ${mode==='online'?'bg-emerald-500 border-emerald-500 text-zinc-950':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Online</button>
                           )}
                           {trainer.modes?.gym && (
                             <button type="button" onClick={()=>setMode("gym")} className={`py-2 rounded-lg text-sm font-medium border ${mode==='gym'?'bg-emerald-500 border-emerald-500 text-zinc-950':'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-600'}`}>Gym</button>
                           )}
                        </div>
                      </div>
                      
                      <button type="submit" disabled={bookingLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-bold px-4 py-4 rounded-xl flex items-center justify-center transition-all mt-4">
                        {bookingLoading ? <Loader2 className="animate-spin" size={20}/> : "Request Booking"}
                      </button>
                      {!user && <p className="text-xs text-red-400 mt-2 text-center">You must be logged in to book.</p>}
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
