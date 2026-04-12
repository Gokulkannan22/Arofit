"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [trainers, setTrainers] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (userData?.role === "trainer") router.push("/trainer-dashboard");
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const querySnapshot = await getDocs(collection(db, "trainers"));
        const tList = [];
        querySnapshot.forEach((doc) => tList.push(doc.data()));
        setTrainers(tList);
      } catch(e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    if (user && userData?.role !== "trainer") fetchTrainers();
  }, [user, userData]);

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Your Fitness Journey Begins</h1>
          <p className="text-slate-400">Discover and book verified personal trainers in Kerala.</p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Discover Trainers</h2>
        
        {fetching ? (
          <div className="flex items-center space-x-2 text-emerald-500"><Loader2 className="animate-spin" size={20}/> <span>Loading trainers...</span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((t) => (
              <div key={t.uid} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <div className="flex items-center text-slate-400 text-sm bg-zinc-950 px-2 py-1 rounded-md">
                      <MapPin size={14} className="mr-1 text-emerald-500" /> {t.location}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {t.bio || "This trainer hasn't added a bio yet."}
                  </p>
                  
                  {/* Modes */}
                  <div className="flex space-x-2 mb-4">
                    {t.modes?.home && <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-slate-300">Home</span>}
                    {t.modes?.online && <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-slate-300">Online</span>}
                    {t.modes?.gym && <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-slate-300">Gym</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Per Session</span>
                    <span className="font-bold text-lg text-emerald-500">₹{t.pricing_session}</span>
                  </div>
                  <Link href={`/trainer/${t.uid}`} className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all shadow-md">
                    View Profile <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
            {trainers.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed">
                No trainers are registered on the platform yet. Check back soon!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
