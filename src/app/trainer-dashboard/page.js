"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrainerDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && userData && userData.role !== "trainer") router.push("/dashboard");
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      try {
        const q = query(collection(db, "bookings"), where("trainerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const bList = [];
        querySnapshot.forEach((doc) => bList.push({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        bList.sort((a,b) => new Date(b.date) - new Date(a.date));
        setBookings(bList);
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    fetchBookings();
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

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Trainer Dashboard</h1>
        <p className="text-slate-400 mb-8">Manage your bookings and clients.</p>

        <h2 className="text-2xl font-bold mb-6 flex items-center"><Calendar className="mr-2 text-emerald-500"/> Recent Bookings</h2>
        
        {fetching ? (
           <Loader2 className="animate-spin text-emerald-500" size={24}/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed">
                 No bookings yet. Share your profile link to get clients!
               </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-bold text-lg">{b.clientName}</h3>
                       <p className="text-sm text-slate-400">{b.clientEmail}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${b.status==='pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                          b.status==='confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                         {b.status}
                     </span>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                     <div><span className="text-slate-500 block">Date</span><span className="font-medium">{new Date(b.date).toLocaleDateString()}</span></div>
                     <div><span className="text-slate-500 block">Time</span><span className="font-medium">{b.time}</span></div>
                     <div><span className="text-slate-500 block">Mode</span><span className="font-medium capitalize">{b.mode}</span></div>
                   </div>
                   
                   {b.status === 'confirmed' && (
                     <button onClick={() => router.push(`/chat?with=${b.clientId}&name=${encodeURIComponent(b.clientName)}`)} className="w-full mb-4 bg-zinc-800 hover:bg-zinc-700 text-slate-200 py-2.5 rounded-lg font-bold flex justify-center items-center transition-colors">
                       Message Client
                     </button>
                   )}

                   {b.status === 'pending' && (
                     <div className="flex space-x-3">
                        <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2.5 rounded-lg font-bold flex justify-center items-center">
                          <CheckCircle size={18} className="mr-2"/> Accept
                        </button>
                        <button onClick={() => handleUpdateStatus(b.id, 'rejected')} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-red-400 py-2.5 rounded-lg flex justify-center items-center">
                          <XCircle size={18} className="mr-2"/> Reject
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
