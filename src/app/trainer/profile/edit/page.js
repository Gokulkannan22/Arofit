"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, ArrowLeft, Save, CheckCircle2, UploadCloud, Eye, Award, ExternalLink, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfile() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    experience: "",
    pricing_session: "",
    pricing_monthly: "",
    specializations: [],
    modes: { home: false, online: false, gym: false },
    imageBase64: "",
    packageIncludes: [],
    travelRadius: "",
    introVideoUrl: "",
    certifications: ""
  });
  
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const OPTIONS_SPECS = ["Weight Loss", "Muscle Gain", "Yoga", "General Fitness", "Strength Training", "Rehab", "HIIT"];
  const OPTIONS_PKG = ["Weekly Check-ins", "Diet Plan", "24/7 Chat Support", "Supplement Guidance", "Form Review"];

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
             modes: d.modes || { home: false, online: false, gym: false },
             imageBase64: d.imageBase64 || "",
             packageIncludes: d.packageIncludes || [],
             travelRadius: d.travelRadius || "",
             introVideoUrl: d.introVideoUrl || "",
             certifications: d.certifications || ""
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

  const togglePkg = (p) => {
    setFormData(prev => {
       const pkgs = prev.packageIncludes || [];
       if (pkgs.includes(p)) return { ...prev, packageIncludes: pkgs.filter(x => x !== p) };
       return { ...prev, packageIncludes: [...pkgs, p] };
    });
  };

  const toggleMode = (m) => {
    setFormData(prev => ({
      ...prev,
      modes: { ...prev.modes, [m]: !prev.modes[m] }
    }));
  };

  const handleImageUpload = (e) => {
     const file = e.target.files[0];
     if(file) {
        if(file.size > 1048576) { 
           alert("File too large. Max 1MB limit for MVP profile images."); 
           return; 
        }
        const reader = new FileReader();
        reader.onloadend = () => { 
           setFormData({...formData, imageBase64: reader.result});
        };
        reader.readAsDataURL(file);
     }
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
         modes: formData.modes,
         imageBase64: formData.imageBase64,
         packageIncludes: formData.packageIncludes,
         travelRadius: formData.travelRadius,
         introVideoUrl: formData.introVideoUrl,
         certifications: formData.certifications
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch(err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col relative">
      <AppNavbar />
      
      {/* Success Toast */}
      {showToast && (
         <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center animate-bounce">
            <CheckCircle2 size={20} className="mr-2"/> Profile updated successfully!
         </div>
      )}

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full pb-24">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
           <Link href="/trainer-dashboard" className="text-emerald-500 hover:text-emerald-400 flex items-center font-bold transition-colors w-max">
             <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
           </Link>
           <Link href={`/trainer/${user.uid}`} target="_blank" className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-slate-200 px-4 py-2 rounded-lg font-bold flex items-center transition-all text-sm w-max">
             <Eye size={16} className="mr-2 text-emerald-500"/> Preview Public Profile
           </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-10">
           
           {/* Image Upload Area */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                 {formData.imageBase64 ? (
                    <img src={formData.imageBase64} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
                 ) : (
                    <div className="w-32 h-32 rounded-full bg-zinc-950 border-4 border-dashed border-zinc-700 flex flex-col items-center justify-center text-slate-500">
                       <UploadCloud size={32} className="mb-2" />
                       <span className="text-[10px] font-bold uppercase tracking-widest leading-tight text-center px-2">No Photo</span>
                    </div>
                 )}
              </div>
              <div className="flex-1 text-center md:text-left">
                 <h2 className="text-xl font-bold mb-2">Upload Profile Photo <span className="text-red-500 text-sm ml-1">*Critical*</span></h2>
                 <p className="text-slate-400 text-sm mb-4">Profiles with real photos get 3x more bookings. Building trust starts here.</p>
                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold px-6 py-2 rounded-xl transition-colors shadow-sm">
                    {formData.imageBase64 ? "Change Photo" : "Upload Photo"}
                 </button>
              </div>
           </div>

           {/* Basic Info */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium"/>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Location (District)</label>
                    <select required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium">
                       <option value="">Select District</option>
                       <option value="Alappuzha">Alappuzha</option>
                       <option value="Ernakulam">Ernakulam (Kochi)</option>
                       <option value="Idukki">Idukki</option>
                       <option value="Kannur">Kannur</option>
                       <option value="Kasaragod">Kasaragod</option>
                       <option value="Kollam">Kollam</option>
                       <option value="Kottayam">Kottayam</option>
                       <option value="Kozhikode">Kozhikode</option>
                       <option value="Malappuram">Malappuram</option>
                       <option value="Palakkad">Palakkad</option>
                       <option value="Pathanamthitta">Pathanamthitta</option>
                       <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                       <option value="Thrissur">Thrissur</option>
                       <option value="Wayanad">Wayanad</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Years of Experience</label>
                    <input type="number" required value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} placeholder="e.g., 5" className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium"/>
                 </div>
              </div>
           </div>

           {/* Professional Info */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Professional Details & Trust</h2>
              <div className="mb-6">
                 <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                    Your True Bio <span className="text-xs text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">🔥 Very Important</span>
                 </label>
                 <textarea required rows={4} value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} placeholder="Experienced fitness coach specializing in..." className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium leading-relaxed"/>
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center"><Award size={16} className="mr-2 text-emerald-500"/> Certifications & Achievements</label>
                 <textarea rows={2} value={formData.certifications} onChange={e=>setFormData({...formData, certifications: e.target.value})} placeholder="e.g., ACE Certified Personal Trainer, 1st Place Kerala Bodybuilding 2022" className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium leading-relaxed"/>
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center"><Video size={16} className="mr-2 text-emerald-500"/> Intro Video Link (Optional)</label>
                 <input type="url" value={formData.introVideoUrl} onChange={e=>setFormData({...formData, introVideoUrl: e.target.value})} placeholder="Paste YouTube or Vimeo URL here" className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium text-sm"/>
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
              <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-zinc-800 pb-3">Packages & Logistics</h2>
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

              <div className="mb-8">
                 <label className="block text-sm font-bold text-slate-300 mb-3">Package Includes (Value Adds)</label>
                 <div className="flex flex-wrap gap-3">
                    {OPTIONS_PKG.map(pkg => {
                       const isSelected = formData.packageIncludes?.includes(pkg);
                       return (
                          <button type="button" key={pkg} onClick={() => togglePkg(pkg)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'bg-zinc-950 border-zinc-700 text-slate-300 hover:border-emerald-500/50'}`}>
                             {pkg}
                          </button>
                       )
                    })}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3">Training Modes I Offer</label>
                    <div className="flex flex-col space-y-3 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                       <label className="flex items-center cursor-pointer">
                          <div onClick={() => toggleMode('home')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.home ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                             {formData.modes.home && <CheckCircle2 size={16} className="text-zinc-950"/>}
                          </div>
                          <span className="font-bold text-slate-200">Home Training</span>
                       </label>
                       <label className="flex items-center cursor-pointer">
                          <div onClick={() => toggleMode('online')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.online ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                             {formData.modes.online && <CheckCircle2 size={16} className="text-zinc-950"/>}
                          </div>
                          <span className="font-bold text-slate-200">Online Training</span>
                       </label>
                       <label className="flex items-center cursor-pointer">
                          <div onClick={() => toggleMode('gym')} className={`w-6 h-6 rounded flex items-center justify-center mr-3 transition-colors ${formData.modes.gym ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                             {formData.modes.gym && <CheckCircle2 size={16} className="text-zinc-950"/>}
                          </div>
                          <span className="font-bold text-slate-200">Gym Training</span>
                       </label>
                    </div>
                 </div>

                 {formData.modes.home && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <label className="block text-sm font-bold text-emerald-400 mb-2 flex items-center">Travel Radius (Home Training)</label>
                       <select value={formData.travelRadius} onChange={e=>setFormData({...formData, travelRadius: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-slate-200 focus:border-emerald-500 outline-none font-medium">
                          <option value="">Select distance limit</option>
                          <option value="5">Up to 5 km</option>
                          <option value="10">Up to 10 km</option>
                          <option value="20">Up to 20 km</option>
                          <option value="50">Anywhere in City</option>
                       </select>
                       <p className="text-xs text-slate-500 mt-2 font-medium">Clients outside this radius won't be able to book home sessions.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Submit */}
           <div className="pt-6 border-t border-zinc-800 flex justify-end">
              <button type="submit" disabled={saving} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 px-10 py-5 rounded-xl font-extrabold flex items-center justify-center shadow-2xl shadow-emerald-500/20 transition-all hover:-translate-y-1 text-lg">
                 {saving ? <Loader2 className="animate-spin mr-2" size={24}/> : <Save className="mr-2" size={24}/>}
                 {saving ? "Publishing Updates..." : "Save & Publish Profile"}
                 {!saving && <CheckCircle2 size={24} className="ml-2 absolute right-6 md:relative md:right-auto md:ml-3" />}
              </button>
           </div>
        </form>
      </main>
    </div>
  );
}
