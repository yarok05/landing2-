
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Target, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Menu, 
  X, 
  MessageCircle, 
  Sparkles,
  Quote,
  CheckCircle2,
  ExternalLink,
  Star,
  Phone,
  Clock,
  Calendar,
  User,
  Send
} from 'lucide-react';
import { AuditFormState } from './types';
import { ChatWidget } from './ChatWidget';

const MY_PHOTO_URL = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop";

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

const ThreeDEmblem = ({ compact = false }: { compact?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]);
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);

  const springConfig = { damping: 25, stiffness: 100 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const sizeClass = compact ? "w-[120px] h-[60px]" : "w-[160px] h-[160px]";
  const barWidth = compact ? "w-[80px]" : "w-[100px]";
  const barHeight = compact ? "h-[25px]" : "h-[35px]";

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${sizeClass} cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ 
          rotateX: springRotateX, 
          rotateY: springRotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <motion.div 
          animate={{ x: isHovered ? 0 : -20, y: isHovered ? 0 : -10, rotate: isHovered ? -45 : -60, scale: isHovered ? 1.05 : 0.9 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-[#FF8A00] rounded-full shadow-lg opacity-80`}
          style={{ translateZ: -20 }}
        />
        <motion.div 
          animate={{ x: isHovered ? 0 : 0, y: isHovered ? 0 : 15, rotate: isHovered ? -45 : -25, scale: isHovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-[#FF2D55] rounded-full shadow-lg opacity-90`}
          style={{ translateZ: 20 }}
        />
        <motion.div 
          animate={{ x: isHovered ? 0 : 20, y: isHovered ? 0 : -5, rotate: isHovered ? -45 : -40, scale: isHovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-[#00A3FF] rounded-full shadow-xl`}
          style={{ translateZ: 60 }}
        />
        <motion.div animate={{ translateZ: isHovered ? 90 : 70 }} className="absolute z-50 pointer-events-none text-white">
          <h2 className={`font-outfit ${compact ? 'text-[10px]' : 'text-sm'} font-black tracking-[0.3em]`}>IGADSFLEX</h2>
        </motion.div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auditState, setAuditState] = useState<AuditFormState>({ name: '', website: '', niche: '', loading: false });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleAuditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditState.website || !auditState.niche || !auditState.name) return;
    
    setAuditState(prev => ({ ...prev, loading: true }));
    
    // Redirecting to Telegram with pre-filled message
    const message = `Вітаю! Мене звати ${auditState.name}. Хочу замовити безкоштовну консультацію по Meta Ads.\n\nПроект: ${auditState.website}\nНіша: ${auditState.niche}`;
    const telegramUrl = `https://t.me/igadsflex?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
      window.open(telegramUrl, '_blank');
      setAuditState({ name: '', website: '', niche: '', loading: false });
    }, 500);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden text-sm md:text-base font-inter">
      <ChatWidget />
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF8A00] via-[#FF2D55] to-[#00A3FF] z-[100] origin-left" style={{ scaleX }} />

      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm border-b border-white/5 px-6 py-2 flex justify-between items-center text-white">
        <div className="cursor-pointer -ml-4" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <ThreeDEmblem compact />
        </div>
        <div className="hidden md:flex space-x-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
          <button onClick={() => scrollTo('results')} className="hover:text-white transition-colors">Результати</button>
          <button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейси</button>
          <button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Послуги</button>
          <button onClick={() => scrollTo('contacts')} className="px-4 py-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all text-white/60">Контакти</button>
        </div>
        <button onClick={() => scrollTo('offer')} className="hidden md:block px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-white text-black rounded-full hover:bg-orange-500 hover:text-white transition-all">
          Безкоштовна консультація
        </button>
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-black p-12 flex flex-col justify-center space-y-8"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-4"><X size={32} /></button>
            {['Результати', 'Кейси', 'Послуги', 'Контакти'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item.toLowerCase() === 'результати' ? 'results' : item.toLowerCase())}
                className="text-4xl font-black uppercase tracking-tighter hover:text-orange-500 text-left"
              >
                {item}
              </button>
            ))}
            <button onClick={() => scrollTo('offer')} className="py-6 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm">
              Безкоштовна консультація
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <FadeIn>
              <div className="text-[9px] font-black uppercase tracking-[0.5em] text-orange-500 mb-8">Маніфест</div>
              <h1 className="font-outfit text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1] uppercase text-white">
                Я не «запускаю таргет». <br />
                <span className="text-white/20">Я створюю фінансову систему, яка генерує кеш.</span>
              </h1>
              <p className="text-white/40 max-w-md mb-10 text-xs md:text-sm leading-relaxed uppercase tracking-wide">
                Будую прогнозовані системи залучення клієнтів за допомогою Meta Ads та аналітики прибутку.
              </p>
              <button onClick={() => scrollTo('offer')} className="px-8 py-5 bg-orange-600 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all flex items-center space-x-3 shadow-lg shadow-orange-600/20">
                <span>Безкоштовна консультація</span>
                <ArrowRight size={16} />
              </button>
            </FadeIn>
          </div>
          <div className="lg:col-span-5 flex justify-end">
            <FadeIn delay={0.2}>
              <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
               <img src="/me.jpg" alt="Ihor" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-2xl font-bold font-outfit uppercase tracking-tighter">Ігор Яровий</div>
                  <div className="text-orange-500 text-[9px] font-black uppercase tracking-widest opacity-80">Media Buyer • Profit Strategist</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-24 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Ріст прибутку", val: "+240%" },
                { label: "Масштабування", val: "x4.2" },
                { label: "Бюджет в управлінні", val: "$1M+" },
                { label: "Ціна за клієнта", val: "-65%" }
              ].map((s, i) => (
                <div key={i}>
                  <div className={`text-4xl font-black font-outfit ${i % 2 !== 0 ? 'text-orange-500' : 'text-white'}`}>{s.val}</div>
                  <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="font-outfit text-4xl font-black uppercase tracking-tighter mb-16 text-white">Кейси та відгуки</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  niche: "Бренд Одягу", 
                  res: "+$42,000 чистого прибутку", 
                  quote: "Нарешті реклама працює як інвестиція. Продажі виросли в декілька разів за перші два місяці.",
                  author: "Олена, власниця бренду"
                },
                { 
                  niche: "Онлайн Курси", 
                  res: "Стабільний потік клієнтів щодня", 
                  quote: "Завдяки Ігорю ми змогли вийти на міжнародний ринок і отримувати стабільні оплати.",
                  author: "Максим, CEO школи"
                },
                { 
                  niche: "Послуги / Салон", 
                  res: "Запис заповнений на місяць вперед", 
                  quote: "Ми навіть вимкнули рекламу на тиждень, бо не встигали обробляти всіх клієнтів.",
                  author: "Анна, власниця мережі"
                },
                { 
                  niche: "Локальний Бізнес", 
                  res: "Масштабування продажів у 3 рази", 
                  quote: "Все чітко і прозоро. Кожна витрачена гривня приносить результат, який можна порахувати.",
                  author: "Дмитро, підприємець"
                }
              ].map((c, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-orange-500/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="text-orange-500 text-[9px] font-black uppercase tracking-widest mb-4">{c.niche}</div>
                    <div className="text-2xl font-black font-outfit uppercase mb-8 text-white group-hover:text-orange-500 transition-colors">{c.res}</div>
                    <div className="relative">
                      <Quote size={20} className="text-white/10 absolute -top-4 -left-4" />
                      <p className="text-white/50 text-xs italic leading-relaxed pl-4">"{c.quote}"</p>
                      <div className="mt-4 pl-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">— {c.author}</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-orange-500 text-orange-500" />)}
                    </div>
                    <div className="text-[9px] text-white/10 uppercase font-black tracking-widest">Verified Case</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-[#080808] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-12">Що я роблю</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
              {[
                { t: "Масштабування", d: "Збільшую ваші продажі через Meta Ads без втрати прибутковості." },
                { t: "Системи", d: "Будую шлях клієнта від першого кліку до покупки." },
                { t: "Контроль", d: "Повний аналіз цифр. Ви точно знаєте, скільки заробляєте." }
              ].map((s, i) => (
                <div key={i} className="p-10 bg-[#050505] hover:bg-black transition-colors">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-4 text-white">{s.t}</h4>
                  <p className="text-white/30 text-[10px] leading-relaxed font-light">{s.d}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Offer Section - SIMPLIFIED WITHOUT AI, MORE UNDERSTANDABLE */}
      <section id="offer" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="font-outfit text-4xl md:text-8xl font-black tracking-tight uppercase leading-tight text-white mb-6">
                ЗНАЙДЕМО ВАШ ПРИБУТОК.
              </h2>
              
              <div className="flex flex-col items-center gap-6">
                 <div className="flex items-center space-x-3 bg-white text-black px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Clock size={18} className="animate-pulse" />
                    <p className="text-[11px] md:text-sm uppercase tracking-[0.1em] font-black">
                      БЕЗКОШТОВНА КОНСУЛЬТАЦІЯ ТІЛЬКИ ДО КІНЦЯ МІСЯЦЯ
                    </p>
                 </div>
                 <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Заповніть просту форму для запису</p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleAuditRequest} className="bg-[#111] border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative">
                <div className="space-y-6 mb-10">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                      <User size={12} />
                      <span>Як вас звати?</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ваше ім'я" 
                      value={auditState.name} 
                      onChange={(e) => setAuditState({ ...auditState, name: e.target.value })} 
                      className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-8 py-5 text-base outline-none focus:border-orange-500 focus:bg-white/[0.08] transition-all text-white placeholder:text-white/10" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                      <ExternalLink size={12} />
                      <span>Ваш проект (сайт або інстаграм)</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Наприклад: myshop.ua" 
                      value={auditState.website} 
                      onChange={(e) => setAuditState({ ...auditState, website: e.target.value })} 
                      className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-8 py-5 text-base outline-none focus:border-orange-500 focus:bg-white/[0.08] transition-all text-white placeholder:text-white/10" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                      <Zap size={12} />
                      <span>Ваша ніша бізнесу</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Наприклад: Одяг, Меблі, Навчання" 
                      value={auditState.niche} 
                      onChange={(e) => setAuditState({ ...auditState, niche: e.target.value })} 
                      className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-8 py-5 text-base outline-none focus:border-orange-500 focus:bg-white/[0.08] transition-all text-white placeholder:text-white/10" 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={auditState.loading} 
                  className="w-full py-7 bg-white text-black rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-orange-500 hover:text-white transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center justify-center space-x-3 group active:scale-95"
                >
                  {auditState.loading ? (
                    <span className="flex items-center space-x-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Send size={20} /></motion.div>
                      <span>ПЕРЕНАПРАВЛЕННЯ...</span>
                    </span>
                  ) : (
                    <>
                      <span>ЗАБРОНЮВАТИ У TELEGRAM</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
                
                <div className="mt-8 flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-3 text-white/20 text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    <span>Особистий розбір вашої ситуації</span>
                  </div>
                </div>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer / Contacts */}
      <footer id="contacts" className="py-16 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <h2 className="font-outfit text-4xl font-black tracking-tighter uppercase mb-2 text-white">IGADSFLEX.</h2>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-8">Strategic Meta Systems</p>
            <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <a href="mailto:yarokhorol@gmail.com" className="block hover:text-orange-500 transition-colors">yarokhorol@gmail.com</a>
              <div className="text-white/30 flex items-center space-x-2">
                <span>+4917662832957 • Kyiv • Global</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-12 text-[9px] font-bold uppercase tracking-widest text-white/40">
            <div className="space-y-4">
              <div className="text-white/10">Соціальні мережі</div>
              <a href="https://www.instagram.com/yarovyi.vision/" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Instagram</a>
              <a href="https://t.me/igadsflex" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Telegram</a>
              <a href="https://wa.me/4917662832957" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors text-orange-500">WhatsApp</a>
            </div>
            <div className="space-y-4">
              <div className="text-white/10">Дія</div>
              <button onClick={() => scrollTo('offer')} className="block text-orange-500 hover:text-white transition-colors">Замовити аудит</button>
              <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="block text-white/30 hover:text-white transition-colors">Вгору</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[8px] text-white/10 font-black uppercase tracking-widest">
          © {new Date().getFullYear()} IGADSFLEX / ІГОР ЯРОВИЙ
        </div>
      </footer>
    </div>
  );
};

export default App;
