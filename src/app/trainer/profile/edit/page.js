"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfile() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    experience: "",
    pricing_session: "",
    pricing_monthly: "",
    specializations: [],
    modes: { home: false, online: false, gym: false }
  });
  
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  const OPTIONS_SPECS = ["Weight Loss", "Muscle Gain", "Yoga", "General Fitness", "Strength Training", "Rehab", "HIIT"];

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "trainer")) {
       router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    async function loadData() {
      if(!user) return;
      try {
        const docRef = await getDoc(doc(db, "trainers", user.uid));
        if (docRef.exists()) {
           const d = docRef.data();
           setFormData({
             name: d.name || "",
             location: d.location || "",
             bio: d.bio || "",
             experience: d.experience || "",
             pricing_session: d.pricing_session || "",
             pricing_monthly: d.pricing_monthly || "",
             specializations: d.specializations || [],
             modes: d.modes || { home: false, online: false, gym: false }
           });
        }
      } catch(e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [user]);

  const toggleSpec = (s) => {
    setFormData(prev => {
       const specs = prev.specializations || [];
       if (specs.includes(s)) return { ...prev, specializations: specs.filter(x => x !== s) };
       return { ...prev, specializations: [...specs, s] };
    });
  };

  const toggleMode = (m) => {
    setFormData(prev => ({
      ...prev,
      modes: { ...prev.modes, [m]: !prev.modes[m] }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "trainers", user.uid), {
         name: formData.name,
         location: formData.location,
         bio: formData.bio,
         experience: formData.experience,
         pricing_session: Number(formData.pricing_session) || 0,
         pricing_monthly: Number(formData.pricing_monthly) || 0,
         specializations: formData.specializations,
         modes: formData.modes
      });
      alert("Profile updated successfully!");
      router.push("/trainer-dashboard");
    } catch(err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full pb-24">
        <Link href="/trainer-dashboard" className="text-emerald-500 hover:text-emerald-400 flex items-center mb-8 font-bold w-max transition-colors">
          <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-10">
           
           {/* Basic Info */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium"/>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Location (City)</label>
                    <input type="text" required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="e.g., Kochi" className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium"/>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Years of Experience</label>
                    <input type="number" required value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} placeholder="e.g., 5" className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium"/>
                 </div>
              </div>
           </div>

           {/* Professional Info */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Professional Details</h2>
              <div className="mb-6">
                 <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                    Your True Bio <span className="text-xs text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">🔥 Very Important</span>
                 </label>
                 <textarea required rows={5} value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} placeholder="Experienced fitness coach specializing in..." className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium leading-relaxed"/>
                 <p className="text-xs text-slate-500 mt-2 font-medium">This replaces the default &quot;No bio available&quot; message and massively builds client trust.</p>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-300 mb-3">Specializations (Select all that apply)</label>
                 <div className="flex flex-wrap gap-3">
                    {OPTIONS_SPECS.map(spec => {
                       const isSelected = formData.specializations?.includes(spec);
                       return (
                          <button type="button" key={spec} onClick={() => toggleSpec(spec)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'bg-zinc-950 border-zinc-700 text-slate-300 hover:border-emerald-500/50'}`}>
                             {spec}
                          </button>
                       )
                    })}
                 </div>
              </div>
           </div>

           {/* Pricing & Services */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Pricing & Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Price Per Session (₹)</label>
                    <input type="number" required value={formData.pricing_session} onChange={e=>setFormData({...formData, pricing_session: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium text-lg"/>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Monthly Package Estimate (₹)</label>
                    <input type="number" required value={formData.pricing_monthly} onChange={e=>setFormData({...formData, pricing_monthly: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium text-lg"/>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-300 mb-3">Training Modes I Offer</label>
                 <div className="flex flex-col space-y-3 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                    <label className="flex items-center cursor-pointer">
                       <div onClick={() => toggleMode('home')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.home ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                          {formData.modes.home && <CheckCircle2 size={16} className="text-zinc-950"/>}
                       </div>
                       <span className="font-bold text-slate-200">Home Training (Client's Place)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                       <div onClick={() => toggleMode('online')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.online ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                          {formData.modes.online && <CheckCircle2 size={16} className="text-zinc-950"/>}
                       </div>
                       <span className="font-bold text-slate-200">Online Training (Zoom/Meet)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                       <div onClick={() => toggleMode('gym')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.gym ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                          {formData.modes.gym && <CheckCircle2 size={16} className="text-zinc-950"/>}
                       </div>
                       <span className="font-bold text-slate-200">Gym Training (Your facility)</span>
                    </label>
                 </div>
              </div>
           </div>

           {/* Submit */}
           <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 px-10 py-4 rounded-xl font-extrabold flex items-center shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 text-lg">
                 {saving ? <Loader2 className="animate-spin mr-2" size={20}/> : <Save className="mr-2" size={20}/>}
                 {saving ? "Saving Profile..." : "Save Public Profile"}
              </button>
           </div>
        </form>
      </main>
    </div>
  );
}
