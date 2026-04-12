"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, addDoc, onSnapshot } from "firebase/firestore";
import AppNavbar from "@/components/AppNavbar";
import { Loader2, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function ChatRoom() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const otherUserId = searchParams.get("with");
  const otherUserName = searchParams.get("name") || "User";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !otherUserId) return;
    
    const roomId = [user.uid, otherUserId].sort().join("_");
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", roomId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [user, otherUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !otherUserId) return;
    
    try {
      const roomId = [user.uid, otherUserId].sort().join("_");
      await addDoc(collection(db, "messages"), {
        roomId,
        senderId: user.uid,
        text: newMessage,
        timestamp: new Date().toISOString()
      });
      setNewMessage("");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>;

  if (!otherUserId) return (
     <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
       <AppNavbar/>
       <div className="flex-1 flex items-center justify-center text-slate-400">Select a user to chat.</div>
     </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full flex flex-col h-[calc(100vh-80px)]">
        <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl p-4 flex items-center shadow-md z-10">
           <h2 className="font-bold text-lg">Chat with {otherUserName}</h2>
        </div>
        
        <div className="flex-1 bg-zinc-950 border-x border-zinc-800 overflow-y-auto p-4 space-y-4">
           {messages.length === 0 && <p className="text-center text-slate-500 mt-10 text-sm">Send a message to start chatting.</p>}
           {messages.map(msg => {
             const isMe = msg.senderId === user.uid;
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-emerald-500 text-zinc-950 rounded-br-none font-medium' : 'bg-zinc-800 text-slate-200 rounded-bl-none'}`}>
                   {msg.text}
                 </div>
               </div>
             )
           })}
           <div ref={messagesEndRef} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-b-2xl p-4 shadow-md">
           <form onSubmit={sendMessage} className="flex space-x-2">
             <input type="text" value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
             <button type="submit" disabled={!newMessage.trim()} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 p-3 rounded-xl transition-all">
               <Send size={20} />
             </button>
           </form>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>}><ChatRoom/></Suspense>;
}
