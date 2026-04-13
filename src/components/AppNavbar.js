"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AppNavbar() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={userData?.role === 'trainer' ? '/trainer-dashboard' : '/dashboard'} className="flex items-center hover:scale-105 transition-transform focus:outline-none">
          <img src="/symbol_transparent.png" alt="AroFit Symbol" className="h-10 w-auto mr-2 object-contain" />
          <span className="font-extrabold text-2xl tracking-tighter uppercase"><span className="text-white">ARO</span><span className="text-emerald-500">FIT</span></span>
        </Link>
        <div className="flex items-center space-x-6">
          {userData?.role !== 'trainer' ? (
             <Link href="/progress" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
               Progress
             </Link>
          ) : (
             <Link href="/trainer/profile/edit" className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
               Edit Profile
             </Link>
          )}
          <span className="text-sm text-slate-400 font-medium hidden sm:block">Hello, {userData?.name || 'User'}</span>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-300 hover:text-white bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 transition-colors">
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
