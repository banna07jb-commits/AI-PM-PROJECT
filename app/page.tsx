"use client";

import { useEffect, useState, useRef } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

// Hook for scroll fade-in animation
function useReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkVisibility = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // If the top of the element enters the viewport + 100px buffer to preload slightly
      if (rect.top <= window.innerHeight + 100) {
        setIsVisible(true);
        window.removeEventListener("scroll", checkVisibility);
        window.removeEventListener("resize", checkVisibility);
      }
    };

    // Initial check right after mount
    checkVisibility();
    // Extra safety measure: Check again after brief delay to allow layout/images to settle
    const timer = setTimeout(checkVisibility, 300);

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  return { ref, isVisible };
}

// Global section IDs for Scroll Spy
const SECTIONS = ["about", "ability", "works", "contact"];

function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const checkScroll = () => {
      let currentId = "";
      // Loop backward to find the deepest visible section
      for (let i = ids.length - 1; i >= 0; i--) {
        const element = document.getElementById(ids[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Active if top is near top viewport edge or it's currently occupying the screen Center
          if (rect.top <= 200) {
            currentId = ids[i];
            break;
          }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    checkScroll();
    
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [ids]);

  return activeId;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  
  const aboutReveal = useReveal();
  const abilityReveal = useReveal();
  const worksReveal = useReveal();
  const contactReveal = useReveal();

  const activeSection = useScrollSpy(SECTIONS);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="font-bold text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 select-none">
            Mr Si
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
            <a href="#about" className={`transition-colors relative pb-1 ${activeSection === 'about' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              About
              {activeSection === 'about' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full animate-in fade-in zoom-in w-full"></span>}
            </a>
            <a href="#ability" className={`transition-colors relative pb-1 ${activeSection === 'ability' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              Ability
              {activeSection === 'ability' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-in fade-in zoom-in w-full"></span>}
            </a>
            <a href="#works" className={`transition-colors relative pb-1 ${activeSection === 'works' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              Works
              {activeSection === 'works' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full animate-in fade-in zoom-in w-full"></span>}
            </a>
            <a href="#contact" className={`transition-colors relative pb-1 ${activeSection === 'contact' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              Contact
              {activeSection === 'contact' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full animate-in fade-in zoom-in w-full"></span>}
            </a>
          </div>
          <button className="md:hidden text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full">
        {/* --- Hero Section --- */}
        <section id="hero" className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-5xl mx-auto pt-20">
          <div className="mb-10 relative group cursor-pointer animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-32 h-32 bg-[#0a0a0f] rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
              <div className="text-4xl select-none">🧑‍🚀</div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.2)] select-none">
              探索 AI 与教育的边界
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300 tracking-wide font-light">
              AI <span className="text-purple-400 mx-1">×</span> Product <span className="text-gray-600 mx-2">|</span> 产品经理
            </h2>
          </div>

          <div className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400/90 mb-14 leading-relaxed font-light flex justify-center h-8">
            <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-transparent pr-1 animate-typing">
              做有温度、有逻辑、有结果的产品人
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full max-w-md mx-auto">
            <a href="#about" className="relative group px-8 py-4 w-full sm:w-auto rounded-full bg-white text-black font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] border border-transparent overflow-hidden text-center">
              <span className="relative z-10">了解我</span>
            </a>
            <a href="#contact" className="relative group px-8 py-4 w-full sm:w-auto rounded-full bg-black/40 text-white font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-white/30 hover:border-purple-400/50 backdrop-blur-md overflow-hidden text-center">
              <span className="relative z-10">联系我</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </a>
          </div>
        </section>

        {/* --- About Section --- */}
        <section id="about" className="py-24 md:py-32 px-6 max-w-6xl mx-auto relative scroll-mt-20">
          <div ref={aboutReveal.ref} className={`transition-all duration-1000 ease-out transform opacity-0 translate-y-16 max-md:opacity-100 max-md:translate-y-0 ${aboutReveal.isVisible ? '!opacity-100 !translate-y-0' : ''}`}>
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">About</h2>
              <p className="text-purple-400 font-medium tracking-widest text-sm uppercase">自我独白</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-stretch">
              {/* Left: Intro Text Card */}
              <div className="flex-[3] p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col justify-center transition hover:bg-white/[0.07] hover:border-white/20">
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed font-light tracking-wide">
                  <p>
                    我专注于<span className="text-white font-medium">教育科技与 AI 产品设计</span>，擅长从 0 到 1 搭建产品框架，梳理业务逻辑与用户路径。
                  </p>
                  <p>
                    习惯用<span className="text-purple-300 font-medium">结构化思维</span>解决复杂问题，注重数据驱动与体验平衡。
                  </p>
                  <p>
                    追求简洁、高效、可复用的设计体系，让<span className="text-blue-300 font-medium">技术与人文更好融合</span>。
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-3 mt-10">
                  <span className="px-5 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">教育科技</span>
                  <span className="px-5 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">AI 产品</span>
                  <span className="px-5 py-2 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">数据驱动</span>
                  <span className="px-5 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">用户体验</span>
                </div>
              </div>
              
              {/* Right: Virtual Avatar */}
              <div className="flex-[2] aspect-square md:aspect-[4/5] rounded-3xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 p-2 relative group overflow-hidden">
                <div className="w-full h-full bg-[#0a0a0f]/80 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-purple-500/30 transition-all duration-500 border border-white/5">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-70 transition-opacity duration-700 animate-pulse-slow"></div>
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10"></div>
                  
                  <div className="relative z-20 text-8xl mb-4 animate-float">👨‍💻</div>
                  <div className="relative z-20 text-xs md:text-sm font-light text-purple-300/60 tracking-widest uppercase">Digital Avatar</div>
                  
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full group-hover:scale-125 transition-transform duration-1000 delay-75"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Ability Section --- */}
        <section id="ability" className="py-24 md:py-32 px-6 max-w-6xl mx-auto relative scroll-mt-20">
          <div ref={abilityReveal.ref} className={`transition-all duration-1000 ease-out transform delay-100 opacity-0 translate-y-16 max-md:opacity-100 max-md:translate-y-0 ${abilityReveal.isVisible ? '!opacity-100 !translate-y-0' : ''}`}>
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">Ability</h2>
              <p className="text-blue-400 font-medium tracking-widest text-sm uppercase">能力矩阵</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Product Design */}
              <div className="group p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.25)] flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-8 border border-blue-500/30 text-3xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    🎯
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors">产品设计</h3>
                  <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">需求分析 → 流程拆解 → 原型输出 → 迭代优化</p>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden shadow-inner flex items-center">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-[1.5s] ease-out delay-100 relative w-0 max-md:w-[90%]" style={abilityReveal.isVisible ? { width: '90%' } : {}}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Ability */}
              <div className="group p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.25)] flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-8 border border-purple-500/30 text-3xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    🤖
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-purple-400 transition-colors">AI 能力应用</h3>
                  <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">大模型场景落地、智能交互设计、提示工程与效果优化</p>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden shadow-inner flex items-center">
                    <div className="bg-purple-500 h-full rounded-full transition-all duration-[1.5s] ease-out delay-[250ms] relative w-0 max-md:w-[85%]" style={abilityReveal.isVisible ? { width: '85%' } : {}}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* UX */}
              <div className="group p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.25)] flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-8 border border-cyan-500/30 text-3xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    💡
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors">用户体验</h3>
                  <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">信息架构设计、交互逻辑梳理、页面流程优化</p>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden shadow-inner flex items-center">
                    <div className="bg-cyan-400 h-full rounded-full transition-all duration-[1.5s] ease-out delay-[400ms] relative w-0 max-md:w-[80%]" style={abilityReveal.isVisible ? { width: '80%' } : {}}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools & Efficiency */}
              <div className="group p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)] flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-8 border border-emerald-500/30 text-3xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    ⚡
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-emerald-400 transition-colors">工具与效率</h3>
                  <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">原型设计、文档输出、项目管理、数据复盘</p>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden shadow-inner flex items-center">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-[1.5s] ease-out delay-[550ms] relative w-0 max-md:w-[90%]" style={abilityReveal.isVisible ? { width: '90%' } : {}}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Works Section --- */}
        <section id="works" className="py-24 md:py-32 px-6 max-w-6xl mx-auto relative scroll-mt-20">
          <div ref={worksReveal.ref} className={`transition-all duration-1000 ease-out transform delay-100 opacity-0 translate-y-16 max-md:opacity-100 max-md:translate-y-0 ${worksReveal.isVisible ? '!opacity-100 !translate-y-0' : ''}`}>
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">Works</h2>
              <p className="text-cyan-400 font-medium tracking-widest text-sm uppercase">项目案例</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Project 1 */}
              <div className="group rounded-3xl bg-[#0d0d14] border border-white/5 hover:border-blue-500/30 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] flex flex-col relative h-full cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-full h-64 bg-gradient-to-br from-blue-600/30 to-purple-800/30 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700 blur-[2px] group-hover:blur-0">🎓</div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full w-fit mb-5">AI 产品设计</span>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">专业建设 AI 助手</h3>
                  <p className="text-lg text-gray-400 font-light mb-10 flex-1 leading-relaxed">
                    基于教育大模型的系统化建设辅导工具。提供标准解读、专业体系搭建与高质量认证报告生成的全链路闭环，助力高校专业的高阶成长与教改突破。
                  </p>
                  <div className="flex items-center text-white/50 group-hover:text-blue-400 font-medium transition-colors text-lg w-fit">
                    <span className="relative overflow-hidden">
                      查看详情 
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </span>
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>

              {/* Project 2 */}
              <a href="http://localhost:3000/achievement-engine-v2/index.html" className="group rounded-3xl bg-[#0d0d14] border border-white/5 hover:border-cyan-500/30 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] flex flex-col relative h-full cursor-pointer block">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-full h-64 bg-gradient-to-br from-cyan-600/30 to-emerald-800/30 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#ffffff15_0%,transparent_70%)]"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700 blur-[2px] group-hover:blur-0">⚙️</div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full w-fit mb-5">教育数据架构</span>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors">达成度评估引擎 V2</h3>
                  <p className="text-lg text-gray-400 font-light mb-10 flex-1 leading-relaxed">
                    极其强大且灵活的多级业务算力中枢。支持打通多数据源体系与拖拽式公式流转，秒级试算处理复杂节点算法逻辑，彻底重塑一线教学评价体验。
                  </p>
                  <div className="flex items-center text-white/50 group-hover:text-cyan-400 font-medium transition-colors text-lg w-fit">
                    <span className="relative overflow-hidden">
                      查看详情 
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-cyan-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </span>
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* --- Contact Section --- */}
        <section id="contact" className="py-24 md:py-32 px-6 max-w-4xl mx-auto relative scroll-mt-20">
          <div ref={contactReveal.ref} className={`transition-all duration-1000 ease-out transform delay-100 opacity-0 translate-y-16 max-md:opacity-100 max-md:translate-y-0 ${contactReveal.isVisible ? '!opacity-100 !translate-y-0' : ''}`}>
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">Contact</h2>
              <p className="text-green-500 font-medium tracking-widest text-sm uppercase">与我连接</p>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 leading-relaxed">
                有想法？有项目？<br className="md:hidden" />或者只是想聊聊？<br />
                <span className="font-medium text-white">随时欢迎开启对话。</span>
              </p>
              
              {/* Giant Email Card */}
              <a href="mailto:your@email.com" className="group flex flex-col items-center justify-center p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 w-full max-w-md mx-auto mb-16 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Mail className="w-10 h-10 text-gray-500 group-hover:text-purple-400 mb-5 transition-colors duration-300 relative z-10" />
                <span className="text-xl md:text-2xl font-medium text-white tracking-wide relative z-10 group-hover:text-purple-100 transition-colors">your@email.com</span>
                <span className="text-sm text-gray-500 mt-3 font-light tracking-wider uppercase relative z-10">Send me a message</span>
              </a>

              {/* Social Links */}
              <div className="flex justify-center gap-5 md:gap-8 flex-wrap">
                <a href="#" className="p-4 rounded-full bg-[#111116] border border-white/10 text-gray-400 hover:text-white hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300" aria-label="GitHub">
                  <FaGithub className="w-6 h-6" />
                </a>
                <a href="#" className="p-4 rounded-full bg-[#111116] border border-white/10 text-gray-400 hover:text-green-500 hover:-translate-y-1.5 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300" aria-label="WeChat">
                  <MessageCircle className="w-6 h-6" />
                </a>
                <a href="#" className="p-4 rounded-full bg-[#111116] border border-white/10 text-gray-400 hover:text-blue-500 hover:-translate-y-1.5 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300" aria-label="LinkedIn">
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="#" className="p-4 rounded-full bg-[#111116] border border-white/10 text-gray-400 hover:text-sky-400 hover:-translate-y-1.5 hover:border-sky-400/30 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300" aria-label="Twitter">
                  <FaTwitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/10 bg-[#06060a] relative z-10 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <p className="text-gray-600 text-xs md:text-sm font-light">© 2025 Mr Si · All Rights Reserved</p>
          <p className="text-gray-600 text-xs md:text-sm font-light">
            Designed with <span className="text-red-500/80 mx-1">❤️</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
