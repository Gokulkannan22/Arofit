"use client";
import { useState, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "trainer" ? "trainer" : "client";

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Generate Unique Username
      let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!baseUsername) baseUsername = "user";
      
      let finalUsername = baseUsername;
      let isUnique = false;
      
      while (!isUnique) {
        const usernameQuery = query(collection(db, "users"), where("username", "==", finalUsername));
        const usernameSnap = await getDocs(usernameQuery);
        
        if (usernameSnap.empty) {
           isUnique = true;
        } else {
           finalUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }

      const userDoc = {
        uid: user.uid,
        name: name,
        username: finalUsername,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      if (role === "trainer") {
        await setDoc(doc(db, "trainers", user.uid), {
          uid: user.uid,
          name: name,
          username: finalUsername,
          bio: "",
          specializations: [],
          pricing_session: 500,
          pricing_monthly: 5000,
          modes: { home: true, online: false, gym: false },
          location: "Kochi",
          travel_radius: 5,
        });
      }

      router.push(role === "trainer" ? "/trainer-dashboard" : "/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
        <p className="text-slate-400">Join AroFit and transform your journey.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "client" ? "bg-zinc-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            I'm a Client
          </button>
          <button
            type="button"
            onClick={() => setRole("trainer")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "trainer" ? "bg-zinc-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            I'm a Trainer
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            type="text"
            required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold px-4 py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign Up</span>}
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald-500 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center hover:scale-105 transition-transform focus:outline-none">
        <img src="/symbol_transparent.png" alt="AroFit Symbol" className="h-9 w-auto mr-2 object-contain" />
        <span className="text-emerald-500 font-extrabold text-2xl tracking-tighter uppercase">AroFit</span>
      </Link>
      <Suspense fallback={<Loader2 className="animate-spin text-emerald-500" size={32} />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
