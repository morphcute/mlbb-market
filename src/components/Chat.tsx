"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Loader2, X, ZoomIn } from "lucide-react";
import { sendMessage } from "@/actions/chat";

type ChatProps = {
  orderId: string;
  messages: any[];
  currentUserId: string;
};

export default function Chat({ orderId, messages: initialMessages, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`/api/chat/${orderId}`);
            if (res.ok) {
                const newMessages = await res.json();
                // Basic diff check could be optimized, but for now replace all to ensure consistency
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    setMessages(newMessages);
                }
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Optimistic update
      const tempMsg = {
        id: "temp-" + Date.now(),
        senderId: currentUserId,
        content: input,
        createdAt: new Date().toISOString(),
        sender: { name: "You" } // Partial mock
      };
      setMessages([...messages, tempMsg]);
      
      await sendMessage(orderId, input);
      setInput("");
      // Fetch immediately to sync
      const res = await fetch(`/api/chat/${orderId}`);
      if (res.ok) setMessages(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const { url } = await uploadRes.json();
        
        // Send message with image URL
        await sendMessage(orderId, "", url);
        
        // Fetch immediately
        const res = await fetch(`/api/chat/${orderId}`);
        if (res.ok) setMessages(await res.json());

    } catch (error) {
        console.error("File upload error:", error);
        alert("Failed to upload image.");
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold">Order Chat (Live)</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">No messages yet. Start chatting!</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${isMe ? "bg-cyan-600 text-white" : "bg-white/10 text-slate-200"}`}>
                <div className="text-xs opacity-50 mb-1">{isMe ? "You" : msg.sender.name}</div>
                
                {msg.imageUrl && (
                    <div className="mb-2 group relative inline-block cursor-pointer" onClick={() => setSelectedImage(msg.imageUrl)}>
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          className="rounded-lg max-h-48 object-cover border border-white/10 transition-opacity group-hover:opacity-90" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                    </div>
                )}
                
                {msg.content && <div>{msg.content}</div>}
                
                <div className="text-[10px] opacity-40 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
            />
            <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                className="border-white/10 hover:bg-white/10 text-slate-400"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading}
            >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </Button>

            <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type a message..." 
                className="bg-black border-white/10"
                disabled={loading || uploading}
            />
            <Button type="submit" size="icon" disabled={loading || uploading} className="bg-cyan-600 hover:bg-cyan-500">
                <Send className="w-4 h-4" />
            </Button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
