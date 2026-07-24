import React, { useState } from 'react';
import { Github, Twitter, ArrowRight, CornerRightDown, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    // ドットパターンの背景
    <div className="min-h-screen w-full bg-violet-300 bg-[radial-gradient(#00000033_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      {/* カードコンテナ：上に飛び出すタブのスペースを確保するため mt-16 を追加 */}
      <div 
        className="relative w-[340px] h-[210px] sm:w-[400px] sm:h-[240px] cursor-pointer group mt-16"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        
        {/* ======== カード2 (ENGINEER) ======== */}
        <div 
          className={`absolute inset-0 w-full h-full border-4 border-black bg-[#4ECDC4]
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between p-5 sm:p-6 select-none
            ${isFlipped 
              ? 'z-10 translate-x-0 translate-y-0 rotate-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]' 
              : 'z-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }
          `}
        >
          {/* ENGINEER タブ (右上に配置) */}
          <div className="absolute -top-12 sm:-top-14 right-4 sm:right-6 w-28 sm:w-32 h-14 sm:h-16 border-4 border-black bg-[#4ECDC4] flex items-start justify-center pt-2 sm:pt-2.5 font-black text-xs sm:text-sm z-[-1] rounded-t-xl">
            ENGINEER
          </div>

          <div className="flex flex-col h-full justify-between">
            <div>
              {/* ENGINEER向けのコンテンツ */}
              <div className="inline-block bg-black text-white px-3 py-1 mb-3 border-2 border-transparent transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={18} /> TECH STACK
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                <span className="px-2 py-0.5 bg-white border-2 border-black font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">React</span>
                <span className="px-2 py-0.5 bg-white border-2 border-black font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">TypeScript</span>
                <span className="px-2 py-0.5 bg-white border-2 border-black font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Tailwind</span>
              </div>

              <ul className="space-y-1.5 font-bold text-xs sm:text-sm text-black mt-2">
                <li className="flex items-center space-x-2 border-b-4 border-black/20 pb-1">
                  <Github size={16} strokeWidth={3} />
                  <span>github.com/taroyamada</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-end">
               <div className="font-black text-5xl tracking-tighter text-black/20 select-none">DEV</div>
               <div className="text-xs sm:text-sm font-black flex items-center gap-1 bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group-active:shadow-none group-active:translate-y-[2px] group-active:translate-x-[2px]">
                 <ArrowRight size={16} strokeWidth={3} /> BACK
               </div>
            </div>
          </div>
        </div>

        {/* ======== カード1 (GENERAL) ======== */}
        <div 
          className={`absolute inset-0 w-full h-full border-4 border-black bg-[#FFD166]
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between p-5 sm:p-6 select-none
            ${!isFlipped 
              ? 'z-10 translate-x-0 translate-y-0 rotate-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]' 
              : 'z-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }
          `}
        >
          {/* GENERAL タブ (左上に配置) */}
          <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 w-28 sm:w-32 h-14 sm:h-16 border-4 border-black bg-[#FFD166] flex items-start justify-center pt-2 sm:pt-2.5 font-black text-xs sm:text-sm z-[-1] rounded-t-xl">
            GENERAL
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="mb-2">
                <span className="text-xs sm:text-sm font-black bg-black text-white px-2 py-0.5 tracking-widest">
                  山田 太郎
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-black">
                Taro<br/>Yamada
              </h1>
              <p className="font-black border-2 border-black inline-block px-2 py-0.5 mt-3 bg-white text-xs sm:text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                UI/UX DEVELOPER
              </p>
            </div>
            {/* アバター風の装飾 */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FF6B6B] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-12">
              <span className="font-black text-2xl sm:text-3xl text-white">☻</span>
            </div>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div className="flex space-x-3">
              <span className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors group-hover:bg-[#4ECDC4]">
                 <Twitter size={20} strokeWidth={2.5} className="text-black" />
              </span>
              <span className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors group-hover:bg-[#FF6B6B]">
                 <Sparkles size={20} strokeWidth={2.5} className="text-black" />
              </span>
            </div>
            
            <div className="text-xs sm:text-sm font-black flex items-center gap-1 bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group-active:shadow-none group-active:translate-y-[2px] group-active:translate-x-[2px]">
               TAP TO FLIP <CornerRightDown size={16} strokeWidth={3} />
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}