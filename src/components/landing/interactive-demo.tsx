"use client";

import React, { useState, useEffect } from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Radio, 
  Settings,
  Bell,
  Search,
  MoreVertical,
  Plus,
  Send,
  Workflow,
  Sparkles,
  Bot,
  Zap,
  Clock,
  Phone,
  GitMerge,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  ChevronDown,
  BarChart3,
  FileText
} from "lucide-react";




const dummyChats = [
    { id: 0, name: "Elena Rodriguez", time: "2m ago", text: "Is the API key rotational feature available?", tag: "Enterprise" },
    { id: 1, name: "Marcus Chen", time: "1h ago", text: "We're ready to proceed with the annual contract.", tag: "Closing" },
    { id: 2, name: "Sophia Sterling", time: "3h ago", text: "Can you walk me through the custom workflows?", tag: "VIP" },
  ];

const contacts = [
    { name: "Elena Rodriguez", phone: "+1 (415) 555-0198", company: "Nexus Dynamics", tags: ["Enterprise", "Decision Maker"], date: "Jul 21, 2026" },
    { name: "Marcus Chen", phone: "+1 (650) 555-0231", company: "NextGen Startups", tags: ["Closing", "Q3 Target"], date: "Jul 21, 2026" },
    { name: "Sophia Sterling", phone: "+44 20 7946 0958", company: "Luxe Global", tags: ["VIP", "Retainer"], date: "Jul 21, 2026" },
    { name: "David Kim", phone: "+1 (310) 555-0144", company: "Aurora Capital", tags: ["Investor", "Partner"], date: "Jul 20, 2026" },
    { name: "Isabella Rossi", phone: "+39 06 1234 5678", company: "Milano Design", tags: ["New Inbound"], date: "Jul 19, 2026" },
  ];

const columns = [
    { name: "Inbound", color: "bg-blue-500", cards: [{ name: "Nexus Enterprise Expansion", value: "$45,000", contact: "Elena R." }, { name: "Luxe Global Pilot", value: "$12,500", contact: "Sophia S." }] },
    { name: "Qualified", color: "bg-purple-500", cards: [{ name: "Aurora Capital Partnership", value: "$120,000", contact: "David K." }] },
    { name: "Negotiation", color: "bg-emerald-500", cards: [{ name: "NextGen Annual Contract", value: "$84,000", contact: "Marcus C." }, { name: "Milano Design Rollout", value: "$65,000", contact: "Isabella R." }] }
  ];

const broadcasts = [
    { name: "Q3 Enterprise Feature Update", template: "q3_update_ent", recipients: "4,250", del: 99, read: 82, date: "7/20/2026" },
    { name: "Webinar: Automation Masterclass", template: "webinar_invite", recipients: "12,500", del: 98, read: 54, date: "7/20/2026" },
    { name: "Dormant Lead Re-engagement", template: "winback_sequence", recipients: "8,420", del: 97, read: 41, date: "7/15/2026" },
  ];

const navItems: Array<{ id: string; icon: React.ReactNode; label: string; badge?: string }> = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "inbox", icon: <WhatsAppIcon size={18} />, label: "Inbox" },
    { id: "contacts", icon: <Users size={18} />, label: "Contacts" },
    { id: "pipelines", icon: <Workflow size={18} />, label: "Pipelines" },
    { id: "quotations", icon: <FileText size={18} />, label: "Quotations", badge: "HOT" },
    { id: "broadcasts", icon: <Radio size={18} />, label: "Broadcasts" },
    { id: "automations", icon: <Zap size={18} />, label: "Automations" },
    { id: "flows", icon: <GitMerge size={18} />, label: "Flows" },
    { id: "ai-agents", icon: <Bot size={18} />, label: "AI Agents" },
  ];

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeChat, setActiveChat] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, we are evaluating RenderAura CRM for our global support team of 50 agents. How does the routing work?", sender: "user", time: "10:30 AM" },
    { id: 2, text: "Hello! RenderAura CRM is perfectly suited for large teams. We offer shared inboxes with collision detection and advanced skill-based routing rules. Would you like to schedule a technical deep-dive?", sender: "agent", time: "10:32 AM" },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), text: chatInput, sender: "agent", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput("");
    
    // Simulate user reply
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text: "That sounds exactly like what we need. Let's get that scheduled for tomorrow.", sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  

  return (
    <div className="flex h-full w-full bg-[#0a0f1e]/95 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 sm:w-64 border-r border-white/10 bg-[#050814] flex flex-col relative z-10 transition-all duration-300">
        <div className="h-16 flex items-center justify-center sm:justify-start sm:px-6 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_15px_rgba(var(--primary),0.5)] flex items-center justify-center shrink-0">
             <WhatsAppIcon className="h-4 w-4 text-white" />
          </div>
          <span className="ml-3 font-bold text-lg hidden sm:block truncate">RenderAura CRM</span>
        </div>
        
        <div className="flex-1 py-4 px-2 sm:px-4 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 sm:px-3 sm:py-2.5 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <div className={`flex items-center justify-center ${activeTab === item.id ? 'text-primary' : 'text-white/60 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className={`ml-3 text-sm font-medium hidden sm:block flex-1 text-left ${activeTab === item.id ? 'text-primary' : ''}`}>{item.label}</span>
              {item.badge && (
                <span className="hidden sm:block ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider border border-orange-500/30 text-orange-400">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/20 shrink-0 flex items-center justify-center text-sm font-bold">R</div>
            <div className="hidden sm:block truncate">
              <p className="text-sm font-medium truncate">Rohan Biswas</p>
              <p className="text-xs text-white/40 truncate">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#0a0f1e] relative overflow-hidden">
        {/* Subtle grid background for the whole app area */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        {/* Content routing based on activeTab */}
        <div className="relative h-full w-full z-10 overflow-hidden flex flex-col">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "inbox" && <InboxView messages={messages} chatInput={chatInput} setChatInput={setChatInput} handleSendMessage={handleSendMessage} activeChat={activeChat} setActiveChat={setActiveChat} />}
          {activeTab === "contacts" && <ContactsView />}
          {activeTab === "pipelines" && <PipelinesView />}
          {activeTab === "quotations" && <QuotationsView />}
          {activeTab === "broadcasts" && <BroadcastsView />}
          {activeTab === "automations" && <AutomationsView />}
          {activeTab === "flows" && <FlowsView />}
          {activeTab === "ai-agents" && <AIAgentsView />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// View Components
// ---------------------------------------------------------

function DashboardView() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 scroll-smooth animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-white/50 mt-1">Live analytics across conversations, contacts, and deals.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
           <button className="h-9 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors">7 days</button>
           <button className="h-9 px-4 bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm transition-colors">30 days</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Conversations", value: "1,242", trend: "+142 today", trendUp: true, icon: <WhatsAppIcon size={16} /> },
          { label: "New Contacts", value: "389", trend: "+24 vs yesterday", trendUp: true, icon: <Users size={16} /> },
          { label: "Open Deals Value", value: "$1.2M", trend: "18 open deals", trendUp: true, icon: <span className="font-serif">$</span> },
          { label: "Messages Sent", value: "12.4k", trend: "+1.2k vs yesterday", trendUp: true, icon: <Send size={16} /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-sm font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
            <div className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['New Contact', 'New Deal', 'New Broadcast', 'New Automation'].map((action, i) => (
          <button key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-medium hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all text-center flex items-center justify-center gap-2">
            <Plus size={16} />
            <span className="truncate">{action}</span>
          </button>
        ))}
      </div>

      {/* Charts row (Fake CSS charts for speed) */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-semibold text-white">Conversations Over Time</h3>
          </div>
          <div className="h-48 w-full relative flex items-end justify-between px-2">
            {/* Horizontal lines */}
            <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none border-t border-b border-white/5 py-1">
               <div className="w-full h-px bg-white/5"></div>
               <div className="w-full h-px bg-white/5"></div>
               <div className="w-full h-px bg-white/5"></div>
            </div>
            {/* Fake line chart using a polygon */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M0 90 Q 20 80, 40 50 T 70 30 T 100 10 L 100 100 L 0 100 Z" fill="url(#grad)" opacity="0.2" />
               <path d="M0 90 Q 20 80, 40 50 T 70 30 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
               <defs>
                 <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="currentColor" stopOpacity="1" className="text-primary" />
                   <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
                 </linearGradient>
               </defs>
            </svg>
            <div className="absolute bottom-[-20px] inset-x-0 flex justify-between text-[10px] text-white/40">
              <span>Jul 1</span>
              <span>Jul 7</span>
              <span>Jul 14</span>
              <span>Jul 21</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-white mb-6">Pipeline Value</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-32 h-32 rounded-full border-[12px] border-white/5 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[12px] border-primary" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 80%)' }}></div>
              <div className="absolute inset-0 rounded-full border-[12px] border-blue-500" style={{ clipPath: 'polygon(50% 50%, 0% 80%, 0% 0%, 50% 0%)' }}></div>
              <div className="text-center">
                <div className="text-xs text-white/50">Total</div>
                <div className="text-lg font-bold">$1.2M</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div>Qualified</div>
            <div className="text-white/50">18 deals</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxView({ messages, chatInput, setChatInput, handleSendMessage, activeChat, setActiveChat }: any) {
  

  return (
    <div className="flex h-full w-full animate-in fade-in duration-300">
      {/* Inbox Sidebar */}
      <div className="w-72 border-r border-white/10 bg-[#050814]/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-white/10">
          <div className="bg-white/5 rounded-lg flex items-center px-3 py-2 border border-white/10 focus-within:border-primary/50 transition-colors">
            <Search size={16} className="text-white/40" />
            <input type="text" placeholder="Search conversations..." className="bg-transparent border-none outline-none ml-2 text-sm w-full text-white placeholder:text-white/40" />
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-white/60">
            <button className="text-white hover:text-white">All</button>
            <button className="hover:text-white">Tags</button>
            <button className="hover:text-white">Company</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden p-2 space-y-1">
          {dummyChats.map(chat => (
            <button 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${activeChat === chat.id ? 'bg-primary/20 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
                  <span className="text-[10px] text-white/40">{chat.time}</span>
                </div>
                <p className="text-xs text-white/60 truncate mb-2">{chat.text}</p>
                <div className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/70">
                  {chat.tag}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-transparent relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
              {dummyChats[activeChat].name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm">{dummyChats[activeChat].name}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Bot size={14} className="text-purple-400" />
              AI Copilot
            </button>
            <button className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
              <MoreVertical size={16} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6 relative z-10">
          <div className="text-center text-xs text-white/40 my-2">Today</div>
          {messages.map((msg: any) => (
            <div key={msg.id} className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'self-start' : 'self-end'}`}>
              <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-white/10 rounded-tl-sm border border-white/5' : 'bg-primary/20 text-white rounded-tr-sm border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.1)]'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className={`text-[10px] text-white/40 mt-1.5 ${msg.sender === 'user' ? 'self-start' : 'self-end'}`}>{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md z-10">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 focus-within:bg-white/10 transition-colors">
            <button type="button" className="h-10 w-10 shrink-0 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Plus size={20} />
            </button>
            <textarea 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              placeholder="Type a message or use AI to draft..." 
              className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 text-sm text-white placeholder:text-white/40 max-h-32 min-h-[44px]"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${chatInput.trim() ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.4)]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
            >
              <Send size={16} className={chatInput.trim() ? 'translate-x-[1px] translate-y-[-1px]' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactsView() {
  

  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Contacts</h2>
          <p className="text-sm text-white/50 mt-1">Manage your contact list. 79 total contacts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors hidden sm:block">Export</button>
          <button className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors hidden sm:block">Import</button>
          <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)] flex items-center gap-2">
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white/5 rounded-lg flex items-center px-3 py-2 border border-white/10 focus-within:border-primary/50 w-full max-w-sm">
          <Search size={16} className="text-white/40" />
          <input type="text" placeholder="Search by name, phone, or email..." className="bg-transparent border-none outline-none ml-2 text-sm w-full text-white placeholder:text-white/40" />
        </div>
        <button className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2 text-white/70">
          Filter by tags
        </button>
      </div>

      <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Company</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Tags</th>
              <th className="px-6 py-4 font-medium text-right sm:text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contacts.map((c, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium text-white group-hover:text-primary transition-colors">{c.name}</td>
                <td className="px-6 py-4 text-white/70">{c.phone}</td>
                <td className="px-6 py-4 text-white/70 hidden md:table-cell">{c.company}</td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {c.tags.length > 0 ? (
                    <div className="flex gap-2">
                      {c.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/80">{t}</span>
                      ))}
                    </div>
                  ) : <span className="text-white/20">-</span>}
                </td>
                <td className="px-6 py-4 text-white/50 text-right sm:text-left">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PipelinesView() {
  

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipelines</h2>
          <p className="text-sm text-white/50 mt-1">Manage your deals and sales process.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">Default Pipeline</button>
          <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] flex items-center gap-2">
            <Plus size={16} /> New Deal
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-x-auto no-scrollbar overflow-y-hidden flex gap-6">
        {columns.map((col, i) => (
          <div key={i} className="flex-shrink-0 w-72 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
              <h3 className="font-semibold text-white">{col.name}</h3>
              <span className="ml-auto text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full text-white/60">{col.cards.length}</span>
            </div>
            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-3 min-h-[200px] overflow-y-auto no-scrollbar">
              {col.cards.map((card, j) => (
                <div key={j} className="bg-[#0a0f1e] border border-white/10 rounded-lg p-4 cursor-grab hover:border-primary/50 transition-colors">
                  <h4 className="font-medium text-white text-sm mb-1">{card.name}</h4>
                  <div className="text-primary font-bold text-lg mb-3">{card.value}</div>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-1.5"><Users size={12}/> {card.contact}</div>
                    <MoreVertical size={14}/>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 flex items-center justify-center gap-1 text-xs font-medium text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors mt-1">
                <Plus size={14}/> Add deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BroadcastsView() {
  

  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Broadcasts</h2>
          <p className="text-sm text-white/50 mt-1">Send bulk messages to your contacts using approved templates.</p>
        </div>
        <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] flex items-center gap-2">
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Template</th>
              <th className="px-6 py-4 font-medium text-center">Recipients</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Delivery / Read</th>
              <th className="px-6 py-4 font-medium text-right sm:text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {broadcasts.map((b, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{b.name}</td>
                <td className="px-6 py-4 text-white/60 hidden sm:table-cell">{b.template}</td>
                <td className="px-6 py-4 text-white/80 text-center">{b.recipients}</td>
                <td className="px-6 py-4 hidden md:table-cell w-64">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                       <div className="w-10 text-white/60">Del</div>
                       <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${b.del}%`}}></div></div>
                       <div className="w-8 text-right font-medium">{b.del}%</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                       <div className="w-10 text-white/60">Read</div>
                       <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.read}%`}}></div></div>
                       <div className="w-8 text-right font-medium">{b.read}%</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right sm:text-left">
                  <span className="px-2 py-1 bg-white/10 border border-white/10 rounded-md text-xs font-medium text-white/80">Sent</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AutomationsView() {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Automations</h2>
          <p className="text-sm text-white/50 mt-1">Build workflows that react to WhatsApp® events automatically.</p>
        </div>
        <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Plus size={16} /> Create Automation
        </button>
      </div>
      
      <h3 className="text-sm font-semibold text-white/70 mb-4">Quick-start templates</h3>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Welcome Message", desc: "Auto-reply to first-time contacts with a greeting.", icon: <WhatsAppIcon size={16}/> },
          { title: "Out of Office", desc: "Auto-reply during off-hours so nobody is left waiting.", icon: <Clock size={16}/> },
          { title: "Lead Qualifier", desc: "Ask qualification questions to filter inbound leads.", icon: <Users size={16}/> },
          { title: "Follow-up Reminder", desc: "Send a nudge if a contact has not replied within 24 hours.", icon: <Phone size={16}/> }
        ].map((t, i) => (
           <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer">
             <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-4">{t.icon}</div>
             <h4 className="font-semibold text-white mb-2">{t.title}</h4>
             <p className="text-xs text-white/50">{t.desc}</p>
           </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between group">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mt-0.5"><Zap size={20}/></div>
          <div>
            <h4 className="font-semibold text-white">Enterprise Lead Routing</h4>
            <p className="text-xs text-white/50 mb-2">Routes leads &gt;$50k directly to Account Executives based on region.</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">High Value Lead</span>
              <span className="text-white/40">1,432 runs</span>
              <span className="text-white/40">&middot;</span>
              <span className="text-white/40">last 2m ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-5 rounded-full bg-white/10 relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white/40"></div></div>
          <MoreVertical size={16} className="text-white/40 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

function FlowsView() {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Flows</h2>
          <p className="text-sm text-white/50 mt-1">Build branching, button-driven WhatsApp conversations. Useful for menus, FAQs, and triage before a human steps in.</p>
        </div>
        <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] flex items-center gap-2">
          <Plus size={16} /> New flow
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-md hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <GitMerge size={16} className="text-primary" />
            Global Support Triage
          </div>
          <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] text-primary flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> Active</span>
        </div>
        <p className="text-xs text-white/50 mb-4 leading-relaxed">Qualifies support tickets based on customer tier and sentiment before transferring to human agents.</p>
        <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
           <WhatsAppIcon size={12} /> 45,210 runs
        </div>
        <div className="flex items-center justify-center gap-6 border-t border-white/10 pt-4">
           <button className="text-xs font-medium text-white hover:text-primary flex items-center gap-2 transition-colors"><Edit2 size={12}/> Edit</button>
           <button className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"><Trash2 size={12}/> Delete</button>
        </div>
      </div>
    </div>
  );
}

function AIAgentsView() {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Bot className="text-primary"/> AI Agents</h2>
        <p className="text-sm text-white/50 mt-1">Your bring-your-own-key AI agent — set it up, then test it in the playground before it replies to customers in the inbox.</p>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 mb-8 pb-3 text-sm">
         <button className="text-white/50 hover:text-white transition-colors flex items-center gap-2"><Sparkles size={16}/> Playground</button>
         <button className="text-white font-medium border-b-2 border-white pb-3 -mb-[13px] flex items-center gap-2"><Settings size={16}/> Setup</button>
         <button className="text-white/50 hover:text-white transition-colors flex items-center gap-2"><BarChart3 size={16}/> Usage</button>
      </div>

      <div className="max-w-3xl">
        <h3 className="text-lg font-bold text-white mb-2">Agent setup</h3>
        <p className="text-sm text-white/50 mb-6">Bring your own OpenAI or Anthropic key. wacrm calls the provider directly with your key — no per-seat AI fees, and your data stays yours. This powers AI-drafted replies in the inbox, the auto-reply bot, and the Playground.</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 text-white font-semibold mb-2">
            <Sparkles size={16} className="text-primary"/> Provider & key
          </div>
          <p className="text-xs text-white/50 mb-6">Your key is encrypted at rest (AES-256-GCM) and never shown again after saving.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">Provider</label>
              <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-sm text-white">openai</span>
                <ChevronDown size={16} className="text-white/40"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">Model</label>
              <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5">
                <span className="text-sm text-white">gpt-4o</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-white/70 mb-2">API key</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 flex items-center justify-between focus-within:border-primary/50">
                <span className="text-sm text-white/50">sk-proj-7x9qL...</span>
                <Eye size={16} className="text-white/40"/>
              </div>
              <button className="h-10 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-white whitespace-nowrap">
                <CheckCircle2 size={16}/> Test key
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Embeddings key <span className="text-white/40 font-normal">(optional — enables semantic knowledge-base search)</span></label>
            <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 mb-2">
              <span className="text-sm text-white/50">sk-... (OpenAI)</span>
            </div>
            <p className="text-[10px] text-white/40">An OpenAI key used only to embed your knowledge base (text-embedding-3-small) — can be the same key as above. Leave blank to use keyword search instead. Clear it to turn semantic search off.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const dummyQuotations = [
  { id: "QT-2026-089", client: "Nexus Dynamics (Elena R.)", amount: "$1,450", tax: "$261 (18% Tax)", total: "$1,711", status: "Sent", date: "Jul 22, 2026" },
  { id: "QT-2026-088", client: "NextGen Startups (Marcus C.)", amount: "$840", tax: "$151 (18% Tax)", total: "$991", status: "Approved", date: "Jul 21, 2026" },
  { id: "QT-2026-087", client: "Aurora Capital (David K.)", amount: "$3,200", tax: "$576 (18% Tax)", total: "$3,776", status: "Paid", date: "Jul 20, 2026" },
];

function QuotationsView() {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-primary" /> Quotations & Estimates
          </h2>
          <p className="text-sm text-white/50 mt-1">Create, download PDF, and send official GST quotations over WhatsApp with 1-click.</p>
        </div>
        <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Quote #</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">GST (18%)</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dummyQuotations.map((q, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-primary">{q.id}</td>
                <td className="px-6 py-4 text-white font-medium">{q.client}</td>
                <td className="px-6 py-4 text-white/80">{q.amount}</td>
                <td className="px-6 py-4 text-white/60 text-xs hidden md:table-cell">{q.tax}</td>
                <td className="px-6 py-4 font-bold text-white">{q.total}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    q.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    q.status === "Approved" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="h-8 px-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ml-auto">
                    <WhatsAppIcon size={14} /> Send Quote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
