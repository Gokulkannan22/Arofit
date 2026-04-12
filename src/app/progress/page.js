"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "progress"), 
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const logList = [];
        querySnapshot.forEach((doc) => logList.push({ id: doc.id, ...doc.data() }));
        logList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(logList);
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    fetchLogs();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    try {
      const newLog = {
        userId: user.uid,
        weight: parseFloat(weight),
        notes: notes,
        date: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "progress"), newLog);
      setLogs([{ id: docRef.id, ...newLog }, ...logs]);
      setWeight("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Failed to save progress.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-6 shadow-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><TrendingUp className="mr-2 text-emerald-500"/> Log Progress</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Weight (kg)</label>
                <input type="number" step="0.1" required value={weight} onChange={(e)=>setWeight(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="e.g. 75.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Journal / Notes</label>
                <textarea rows="3" value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none placeholder-zinc-600" placeholder="Felt great today..." />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-4 py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2">
                {saving ? "Saving..." : "Log Entry"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Progress History</h2>
          {fetching ? <Loader2 className="animate-spin text-emerald-500" size={24}/> : (
            <div className="space-y-4">
              {logs.length === 0 ? <p className="text-slate-400">No logs yet. Start tracking your journey today!</p> :
                logs.map(log => (
                  <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-start shadow-sm">
                     <div>
                       <div className="text-2xl font-extrabold text-emerald-500 mb-2">{log.weight} <span className="text-sm font-medium text-slate-500">kg</span></div>
                       {log.notes && <p className="text-slate-300">{log.notes}</p>}
                     </div>
                     <span className="text-sm text-slate-500 font-medium">{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
