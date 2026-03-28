/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Play, Shield, Crown, BookOpen, Compass, Clock, PenTool, AlertOctagon, Trophy, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- CONFIGURATION ---
const BOT_TOKEN = '8260200134:AAFlf6xMu9DAYAKWDJVoLFczYRRzWVqijnY';
const CHAT_ID = '6789535208';
const TARGET_TIME = 17 * 60; // 17 minutes
const MIN_WORDS = 150;

type Archetype = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const ARCHETYPES: Archetype[] = [
  { id: 'warrior', name: 'Warrior', icon: <Shield className="w-6 h-6" /> },
  { id: 'leader', name: 'Leader', icon: <Crown className="w-6 h-6" /> },
  { id: 'sage', name: 'Sage', icon: <BookOpen className="w-6 h-6" /> },
  { id: 'explorer', name: 'Explorer', icon: <Compass className="w-6 h-6" /> },
];

export default function App() {
  const [state, setState] = useState<'WELCOME' | 'QUIZ' | 'COMPLETION'>('WELCOME');
  const [name, setName] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [essay, setEssay] = useState('');
  const [timeLeft, setTimeLeft] = useState(TARGET_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (state === 'QUIZ' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state === 'QUIZ') {
      void handleSubmit();
    }
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // --- WORD COUNT LOGIC ---
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essay]);

  // --- FULLSCREEN EXIT DETECTION ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && state === 'QUIZ') {
        alert("LUẬT TỬ THẦN: Bạn đã thoát chế độ tập trung. Nhiệm vụ thất bại!");
        void handleBackToHQ();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [state]);

  const handleStart = async () => {
    if (!name.trim() || !selectedArchetype) {
      alert("Chiến binh cần danh tính và hệ nhân vật!");
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setState('QUIZ');
      setTimeLeft(TARGET_TIME);
      setEssay('');
    } catch (err) {
      setState('QUIZ');
    }
  };

  const handleBackToHQ = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setState('WELCOME');
    setEssay('');
    setTimeLeft(TARGET_TIME);
  };

  // --- DISABLE BACKSPACE & DELETE ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const finalScore = wordCount >= MIN_WORDS ? 10 : 5;
    
    const message = `💀 WRITING TASK 1 - SURVIVAL REPORT
👤 Warrior: ${name}
🎭 Archetype: ${selectedArchetype?.name || 'Unknown'}
⏱ Time Remaining: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}
📝 Word Count: ${wordCount}
🎯 FINAL SCORE: ${finalScore}/10

--- STUDENT ESSAY ---
${essay}`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
      });
      setState('COMPLETION');
      if (finalScore === 10) {
        void confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {state === 'WELCOME' && (
          <motion.div 
            key="welcome" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto"
          >
            <div className="bg-zinc-900 border border-red-500/20 p-10 rounded-[2.5rem] shadow-2xl text-center backdrop-blur-md w-full">
              <div className="inline-flex w-20 h-20 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/30">
                <AlertOctagon className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">CHẾ ĐỘ <span className="text-red-600">SINH TỒN 1A</span></h1>
              <p className="text-zinc-500 text-xs mb-8 uppercase tracking-[0.3em]">Writing Task 1 • 17 Minutes • No Backspace</p>
              
              <div className="space-y-8 max-w-md mx-auto text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nhập danh tính</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Tên chiến binh..." 
                    className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-red-500 focus:ring-2 focus:ring-red-500 transition-all outline-none font-bold" 
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {ARCHETYPES.map(a => (
                    <button 
                      key={a.id} 
                      onClick={() => setSelectedArchetype(a)} 
                      className={`p-4 rounded-2xl border-2 transition-all flex justify-center ${selectedArchetype?.id === a.id ? 'border-red-600 bg-red-600/10 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-zinc-800 bg-zinc-950 text-zinc-600'}`}
                    >
                      {a.icon}
                    </button>
                  ))}
                </div>

                <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Luật Tử Thần (Cấm Sửa):</p>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside italic">
                    <li>Khóa phím Backspace/Delete.</li>
                    <li>Thời gian: 17 Phút.</li>
                    <li>Đạt 150 từ = 10 điểm. Dưới 150 từ = 5 điểm.</li>
                  </ul>
                </div>

                <button 
                  onClick={handleStart} 
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-lg shadow-red-900/20 flex items-center justify-center gap-3"
                >
                  <Play size={20} fill="white" /> CHẤP NHẬN THỬ THÁCH
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'QUIZ' && selectedArchetype && (
          <motion.div 
            key="quiz" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col h-screen overflow-hidden"
          >
            {/* STICKY HUD */}
            <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex justify-between items-center z-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                  {selectedArchetype.icon}
                </div>
                <div>
                  <h2 className="font-black uppercase text-sm">{name}</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                    <PenTool size={12} /> TASK 1 SURVIVAL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Thời gian còn lại</p>
                  <div className={`flex items-center gap-2 px-6 py-2 rounded-xl border-2 font-mono text-2xl font-black ${timeLeft < 60 ? 'border-red-600 text-red-500 animate-pulse' : 'border-zinc-700 text-zinc-100'}`}>
                    <Clock size={20} /> {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Số lượng từ</p>
                  <div className={`px-6 py-2 rounded-xl border-2 font-mono text-2xl font-black ${wordCount >= MIN_WORDS ? 'border-emerald-600 text-emerald-500' : 'border-zinc-700 text-zinc-400'}`}>
                    {wordCount} / 150
                  </div>
                </div>
              </div>

              <button 
                onClick={() => void handleSubmit()} 
                disabled={isSubmitting} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest text-sm transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Nộp Bài</>}
              </button>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT: TABLE IMAGE */}
              <div className="w-1/3 border-r border-zinc-800 bg-zinc-950 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <h3 className="text-xs font-black uppercase text-red-500 mb-2">Prompt:</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                      "The table below shows the number of visitors to three different museums in London between 2000 and 2010."
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                    <img 
                      src="https://i.ibb.co/GQdcMts6/table.png" 
                      alt="Museum Visitors Data" 
                      className="w-full bg-white p-4" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: ESSAY EDITOR */}
              <div className="w-2/3 bg-black relative">
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bắt đầu gõ tại đây... Lưu ý: Phím Backspace/Delete đã bị khóa. Hãy viết liên tục cho đến khi đạt 150 từ."
                  className="w-full h-full bg-transparent p-12 text-xl font-serif leading-relaxed text-zinc-200 outline-none resize-none placeholder:text-zinc-800"
                  spellCheck={false}
                />
              </div>
            </div>
          </motion.div>
        )}

        {state === 'COMPLETION' && (
          <motion.div 
            key="completion" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
             {wordCount >= MIN_WORDS ? (
               <Trophy size={100} className="text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
             ) : (
               <AlertOctagon size={100} className="text-red-600 mb-6" />
             )}
             
             <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">
               {wordCount >= MIN_WORDS ? "NHIỆM VỤ HOÀN THÀNH" : "THẤT BẠI VỀ KHỐI LƯỢNG"}
             </h2>
             <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg italic font-serif">
               Dữ liệu chiến trường đã được bắn về HQ. Kết quả chấm điểm dựa trên word count:
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                <div className="bg-zinc-900 border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Final Score</p>
                  <div className={`text-8xl font-black ${wordCount >= MIN_WORDS ? 'text-emerald-500' : 'text-red-500'}`}>
                    {wordCount >= MIN_WORDS ? '10' : '5'}<span className="text-zinc-700 text-3xl">/10</span>
                  </div>
                </div>
                <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Word Count Achieved</p>
                  <div className="text-6xl font-black text-zinc-100">{wordCount}</div>
                  <p className="text-xs text-zinc-600 mt-2 font-bold uppercase tracking-tighter">Required: 150 words</p>
                </div>
             </div>

             <button 
              onClick={() => void handleBackToHQ()} 
              className="text-zinc-500 hover:text-white font-bold uppercase tracking-widest underline underline-offset-8 transition-all hover:scale-110 active:scale-95"
             >
                Back to Headquarters
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
