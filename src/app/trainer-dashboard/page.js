"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, Calendar, CheckCircle, XCircle, Share2, TrendingUp, Users, Wallet, AlertCircle, Copy, MessageCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrainerDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  // Trainer specific state
  const [isAvailable, setIsAvailable] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && userData && userData.role !== "trainer") router.push("/dashboard");
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;
      try {
        const q = query(collection(db, "bookings"), where("trainerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const bList = [];
        querySnapshot.forEach((doc) => bList.push({ id: doc.id, ...doc.data() }));
        bList.sort((a,b) => new Date(b.date) - new Date(a.date));
        setBookings(bList);

        const tDoc = await getDoc(doc(db, "trainers", user.uid));
        if (tDoc.exists() && tDoc.data().isAvailable !== undefined) {
           setIsAvailable(tDoc.data().isAvailable);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    fetchDashboard();
  }, [user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch(e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const toggleAvailability = async () => {
    if(!user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "trainers", user.uid), { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch(e) {
       console.error("Failed to update availability");
    } finally {
      setUpdating(false);
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/trainer/${user.uid}`;
    navigator.clipboard.writeText(link);
    alert("Profile link copied! Share it on Instagram or WhatsApp to get clients.");
  };

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-24">
        
        {/* Priority 1: Get Clients Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
           <div>
             <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-950 mb-2 flex items-center tracking-tight"><Share2 className="mr-3" size={28}/> Share your profile to get clients!</h2>
             <p className="text-zinc-900 font-bold text-sm md:text-base opacity-90 max-w-xl">Your booking page is live. Drop your unique link on Instagram or WhatsApp to start getting clients right now.</p>
           </div>
           <button onClick={copyProfileLink} className="mt-6 md:mt-0 w-full md:w-auto bg-zinc-950 hover:bg-zinc-900 hover:scale-105 text-emerald-400 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all shadow-xl whitespace-nowrap">
             <Copy size={20} className="mr-2"/> Copy Profile Link
           </button>
        </div>

        {/* Priority 2: Profile Completion Alert & Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           
           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center shadow-md">
                 <div className="flex items-center text-slate-400 mb-2 font-medium text-sm"><TrendingUp size={16} className="mr-2"/> Total Bookings</div>
                 <div className="text-4xl font-extrabold text-white">{bookings.length}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shadow-md">
                 <div className="absolute -right-4 -bottom-4 opacity-5"><Users size={80}/></div>
                 <div className="flex items-center text-slate-400 mb-2 font-medium text-sm"><Users size={16} className="mr-2"/> Active Clients</div>
                 <div className="text-4xl font-extrabold text-white relative z-10">12 <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md ml-1 tracking-wider">↑ 2 NEW</span></div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center shadow-md">
                 <div className="flex items-center text-slate-400 mb-2 font-medium text-sm"><Wallet size={16} className="mr-2"/> Earnings (Est)</div>
                 <div className="text-4xl font-extrabold text-emerald-500">₹25,000</div>
              </div>
           </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="font-bold flex items-center text-lg mb-2"><AlertCircle size={18} className="mr-2 text-yellow-500"/> Profile Completion</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">Complete your profile to rank higher and get more clients on the directory.</p>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-emerald-500">70%</span>
                  <span className="text-slate-500 uppercase tracking-widest">Missing Bio</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-3 outline outline-1 outline-zinc-800/50">
                  <div className="bg-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '70%' }}></div>
                </div>
              </div>
           </div>
        </div>

        {/* Priority 3: Availability & Recent Chats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Calendar className="text-emerald-500 mr-2" size={20}/> Availability Editor</h2>
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-4 shadow-inner">
                  <div>
                    <h3 className="font-bold text-white mb-0.5">Accepting New Clients</h3>
                    <p className="text-xs text-slate-400">Toggle off to hide from search directory.</p>
                  </div>
                  <button onClick={toggleAvailability} disabled={updating} className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 ${isAvailable ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                     <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
                <p className="text-sm text-slate-500 italic flex items-center"><Loader2 size={12} className="mr-1.5"/> Advanced time-slot scheduling coming in V2.</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center"><MessageCircle className="text-emerald-500 mr-2" size={20}/> Recent Conversations</h2>
                <div className="space-y-3">
                   {bookings.filter(b => b.status === "confirmed").slice(0,2).map(b => (
                      <Link key={b.id} href={`/chat?with=${b.clientId}&name=${encodeURIComponent(b.clientName)}`} className="flex items-center justify-between bg-zinc-950 hover:bg-zinc-800 hover:scale-[1.02] border border-zinc-800 p-3 rounded-xl transition-all shadow-md">
                        <div className="flex items-center">
                           <div className="w-10 h-10 bg-emerald-500 text-zinc-900 font-extrabold rounded-full flex items-center justify-center mr-3 shadow-sm border border-emerald-400">
                              {b.clientName.charAt(0)}
                           </div>
                           <span className="font-bold text-sm text-slate-200">{b.clientName}</span>
                        </div>
                        <ChevronRight className="text-emerald-500" size={18}/>
                      </Link>
                   ))}
                   {bookings.filter(b => b.status === "confirmed").length === 0 && (
                      <div className="text-sm text-slate-500 bg-zinc-950 p-4 rounded-xl border border-zinc-800 border-dashed text-center">Accept a booking to start chatting instantly.</div>
                   )}
                </div>
            </div>
        </div>

        <h2 className="text-2xl font-extrabold mb-6 flex items-center tracking-tight"><CheckCircle className="mr-2 text-emerald-500"/> Incoming Bookings</h2>
        
        {fetching ? (
           <Loader2 className="animate-spin text-emerald-500" size={24}/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed">
                 No bookings yet. Remember to copy and share your profile link above!
               </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col hover:border-emerald-500/20 transition-all">
                   <div className="flex justify-between items-start mb-5">
                     <div>
                       <h3 className="font-extrabold text-xl flex items-center tracking-tight">{b.clientName}</h3>
                       <p className="text-xs text-slate-400 mt-1">{b.clientEmail}</p>
                     </div>
                     <span className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest border
                        ${b.status==='pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 
                          b.status==='confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                         {b.status}
                     </span>
                   </div>
                   <div className="grid grid-cols-2 gap-3 text-sm mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex-1 shadow-inner">
                     <div><span className="text-slate-500 text-[10px] block uppercase font-bold tracking-widest mb-0.5">Date</span><span className="font-bold text-slate-200">{new Date(b.date).toLocaleDateString()}</span></div>
                     <div><span className="text-slate-500 text-[10px] block uppercase font-bold tracking-widest mb-0.5">Time</span><span className="font-bold text-slate-200">{b.time}</span></div>
                     <div className="col-span-2 pt-2 border-t border-zinc-800/50 mt-1"><span className="text-slate-500 text-[10px] block uppercase font-bold tracking-widest mb-0.5">Mode</span><span className="font-extrabold text-emerald-400 capitalize">{b.mode} Training</span></div>
                   </div>
                   
                   {b.status === 'confirmed' && (
                     <button onClick={() => router.push(`/chat?with=${b.clientId}&name=${encodeURIComponent(b.clientName)}`)} className="w-full mt-auto bg-zinc-800 hover:bg-zinc-700 text-slate-200 py-3.5 rounded-xl font-bold flex justify-center items-center transition-all shadow-md">
                       <MessageCircle size={18} className="mr-2"/> Message Client
                     </button>
                   )}

                   {b.status === 'pending' && (
                     <div className="flex space-x-3 mt-auto">
                        <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-3.5 rounded-xl font-extrabold flex justify-center items-center shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1">
                          <CheckCircle size={18} className="mr-2"/> Accept
                        </button>
                        <button onClick={() => handleUpdateStatus(b.id, 'rejected')} className="flex-1 bg-zinc-950 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/50 text-slate-300 hover:text-red-400 py-3.5 rounded-xl font-bold flex justify-center items-center transition-all">
                          Reject
                        </button>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
