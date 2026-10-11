import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Cake,
  Check,
  ChevronDown,
  Gift,
  Heart,
  QrCode,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onMemberLogin: () => void;
  onBusinessLogin: () => void;
}

const green = '#0f9f57';

const ProductCard = () => (
  <div className="relative mx-auto w-full max-w-[560px]">
    <div className="absolute -inset-10 rounded-full bg-emerald-400/20 blur-3xl" />
    <div className="relative grid grid-cols-[0.78fr_1fr] items-center gap-5 sm:gap-7">
      <div className="relative rotate-[-4deg] rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-5">
        <div className="rounded-[22px] bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white sm:p-5">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 font-black">M</div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold">LIVE</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Membership</p>
          <h3 className="mt-1 text-lg font-black">Michael Yubileum</h3>
          <div className="mt-7 rounded-2xl bg-white/10 p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Your Progress</p>
            <p className="mt-1 text-3xl font-black">7<span className="text-base text-emerald-200">/10</span></p>
            <div className="mt-3 h-2 rounded-full bg-white/20"><div className="h-2 w-[70%] rounded-full bg-white" /></div>
            <p className="mt-3 text-[10px] font-bold">3 more stamps → Free Reward</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[10px] font-black text-emerald-700">
            <QrCode size={14} /> SHOW QR CODE
          </div>
        </div>
      </div>

      <div className="relative rounded-[28px] border border-slate-700 bg-[#0b1724] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.35)] sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-sm font-black text-white">Business Insights</p><p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Analytics Dashboard</p></div>
          <BarChart3 size={19} className="text-emerald-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[['594','Members'],['+23','New'],['553','At risk'],['7%','Retention']].map(([value,label]) => (
            <div key={label} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xl font-black text-white">{value}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
          <div className="mb-4 flex items-center justify-between"><p className="text-[9px] font-bold text-slate-400">Weekly Member Growth</p><span className="text-[9px] font-bold text-emerald-400">+57%</span></div>
          <div className="flex h-24 items-end gap-2">
            {[42,28,18,24,34,30,50,62].map((h,i)=><div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-900 to-emerald-400" style={{height:`${h}%`}} />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Feature = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5">
    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white"><Icon size={21}/></div>
    <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-500">{children}</p>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onMemberLogin, onBusinessLogin }) => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => scrollTo('top')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-600/20">L</div>
            <div className="text-left"><div className="text-lg font-black tracking-tight">Loyalink</div><div className="hidden text-[8px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:block">Customer loyalty</div></div>
          </button>
          <nav className="hidden items-center gap-7 md:flex">
            {['Features','How it works','Pricing','FAQ'].map((item, i) => <button key={item} onClick={() => scrollTo(['features','how-it-works','pricing','faq'][i])} className="text-sm font-bold text-slate-500 transition hover:text-slate-950">{item}</button>)}
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={onBusinessLogin} className="hidden rounded-xl px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 sm:block">Log in</button>
            <button onClick={onBusinessLogin} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">Start free</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-[#f5fbf7] pt-28">
          <div className="absolute left-[-12rem] top-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute right-[-10rem] top-32 h-[32rem] w-[32rem] rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-black text-emerald-700 shadow-sm"><Sparkles size={14}/> Loyalty made simple for small businesses</div>
              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[68px]">Turn first-time customers <span className="text-emerald-600">into regulars.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Loyalink helps small businesses build customer loyalty with digital membership cards, stamps, rewards, and customer insights — without complicated software.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={onBusinessLogin} className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">Start Free — Up to 100 Members <ArrowRight size={17} className="transition group-hover:translate-x-1"/></button>
                <button onClick={() => scrollTo('how-it-works')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">See How It Works</button>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-400"><span>✓ Free up to 100 members</span><span>✓ No customer app</span><span>✓ Simple setup</span></div>
            </div>
            <ProductCard />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white py-7"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-center text-xs font-black uppercase tracking-widest text-slate-400"><span>Digital loyalty</span><span>•</span><span>Customer data</span><span>•</span><span>Rewards</span><span>•</span><span>Business insights</span></div></section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">The problem</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Your customers are already coming back. <span className="text-slate-400">Do you know who they are?</span></h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature icon={WalletCards} title="Paper cards get lost">Customers forget loyalty cards, lose them, or simply stop using them.</Feature>
            <Feature icon={Users} title="Relationships disappear">You make a sale today, but customer information often doesn't stay with your business.</Feature>
            <Feature icon={Repeat2} title="You can't see who's leaving">Without customer data, it's hard to understand repeat visits or spot customers going inactive.</Feature>
          </div>
          <div className="mt-12 flex items-center gap-3 rounded-3xl bg-slate-950 p-7 text-white sm:p-9"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500"><Zap size={22}/></div><div><p className="text-xl font-black">Loyalink turns every visit into a relationship.</p><p className="mt-1 text-sm text-slate-400">Give customers a reason to return — and keep the relationship visible to your business.</p></div></div>
        </section>

        <section id="features" className="bg-[#f7faf8] py-20 lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">One simple system</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Three experiences. One loyalty engine.</h2><p className="mt-4 text-base leading-7 text-slate-500">Built around the people who make your business work: customers, staff, and owners.</p></div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[{icon:WalletCards,title:'For Customers',headline:'A loyalty card they will actually use.',items:['Digital membership card','Stamp progress','Rewards and vouchers','No physical card'],tone:'bg-emerald-600'},{icon:QrCode,title:'For Staff',headline:'Give stamps in seconds.',items:['Scan customer QR','Manual phone lookup','Fast stamp management','Simple interface'],tone:'bg-slate-950'},{icon:BarChart3,title:'For Business Owners',headline:"Know who's coming back.",items:['Customer database','Retention and at-risk insights','Member growth','Referral and birthday tracking'],tone:'bg-emerald-700'}].map(({icon:Icon,title,headline,items,tone})=><div key={title} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm"><div className={`${tone} p-7 text-white`}><div className="flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{title}</span><Icon size={24}/></div><h3 className="mt-10 text-2xl font-black leading-tight">{headline}</h3></div><div className="p-7">{items.map(item=><div key={item} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={12}/></div><span className="text-sm font-bold text-slate-600">{item}</span></div>)}</div></div>)}</div>
        </div></section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">How it works</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">From visit to reward in 3 simple steps.</h2><p className="mt-5 text-base leading-7 text-slate-500">The loyalty loop is simple enough for everyday operations — and powerful enough to create a repeat-customer habit.</p></div><div className="grid gap-4 sm:grid-cols-3">{[['01','Customer joins','Scan your business QR and become a member.'],['02','Customer gets stamped','Staff scans the member QR after a purchase.'],['03','Customer comes back','Customers see progress and know how close they are to a reward.']].map(([n,title,copy],i)=><div key={n} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-5xl font-black text-emerald-100">{n}</span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>{i<2&&<ArrowRight className="absolute -right-4 top-1/2 z-10 hidden rounded-full bg-white p-1 text-emerald-500 shadow sm:block" size={28}/>}</div>)}</div></div></section>

        <section className="bg-slate-950 py-20 text-white lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Business insights</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Know your customers. Grow your business.</h2><p className="mt-5 text-base leading-7 text-slate-400">Every loyalty interaction becomes useful customer data, so you can see growth, retention, and the customers who may need attention.</p><div className="mt-8 grid grid-cols-2 gap-3">{[['594','Total members'],['+23','New this month'],['553','At risk'],['7%','Retention']].map(([v,l])=><div key={l} className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-2xl font-black">{v}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{l}</p></div>)}</div></div><div className="rounded-[32px] border border-slate-800 bg-[#0d1b28] p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><div><p className="font-black">Weekly Member Growth</p><p className="mt-1 text-xs text-slate-500">Running total · 8 weeks</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">+57%</span></div><div className="mt-8 flex h-52 items-end gap-3 border-b border-slate-800">{[72,42,16,18,18,12,28,43].map((h,i)=><div key={i} className="group relative flex-1"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">{[38,21,3,3,3,2,7,11][i]}</div><div className="h-full rounded-t-xl bg-gradient-to-t from-emerald-950 to-emerald-500" style={{height:`${h}%`}}/></div>)}</div><div className="mt-5 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-600"><span>Aug 16</span><span>Aug 30</span><span>Sep 13</span><span>Sep 27</span><span>Oct 4</span></div></div></div></div></section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Made for repeat businesses</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Where repeat customers matter.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[['☕','Café','10 stamps → Free coffee'],['🧋','Beverage shop','10 visits → Free drink'],['🍜','Restaurant','5 visits → Free dessert'],['💈','Barbershop','8 visits → Free haircut'],['💅','Salon','5 visits → Free treatment'],['🧺','Laundry','10 orders → Free service']].map(([emoji,title,copy])=><div key={title} className="flex items-center gap-4 rounded-3xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-lg"><span className="text-3xl">{emoji}</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm text-slate-500">{copy}</p></div></div>)}</div></section>

        <section id="pricing" className="bg-[#f7faf8] py-20 lg:py-28"><div className="mx-auto max-w-5xl px-5 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Pricing</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Start free. Grow when your business grows.</h2><p className="mt-4 text-slate-500">No upfront investment. Start building your customer base with up to 100 members.</p></div><div className="mx-auto mt-12 max-w-md rounded-[32px] border-2 border-emerald-500 bg-white p-8 shadow-xl shadow-emerald-900/10"><div className="flex items-start justify-between"><div><p className="text-sm font-black text-emerald-600">FREE</p><p className="mt-2 text-5xl font-black tracking-tight">Rp0</p><p className="mt-1 text-sm font-bold text-slate-400">Forever · up to 100 members</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Gift size={23}/></div></div><div className="mt-8 space-y-3">{['Digital membership card','Digital stamps and rewards','QR scanning','Customer database','Basic analytics','Voucher management'].map(item=><div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600"><Check size={17} className="text-emerald-500"/>{item}</div>)}</div><button onClick={onBusinessLogin} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white transition hover:bg-emerald-700">Start Free <ArrowRight size={17}/></button></div></div></section>

        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 lg:py-28"><div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">FAQ</p><h2 className="mt-3 text-4xl font-black tracking-[-0.035em]">Questions, answered.</h2></div><div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">{[['Do customers need to download an app?','No. Customers can access their Loyalink membership card directly from their phone.'],['Do I need special hardware?','No. Loyalink is designed to work with standard smartphones, tablets, and computers with camera access.'],['How do customers get stamps?','Customers show their Loyalink QR code after a purchase. Staff scans it and the stamp is added to their account.'],['How many members can I have for free?','The free plan supports up to 100 members.'],['Do I need technical knowledge?','No. Loyalink is designed to be simple enough for everyday business operations.']].map(([q,a])=><details key={q} className="group p-5 sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-black"><span>{q}</span><ChevronDown size={18} className="shrink-0 text-slate-400 transition group-open:rotate-180"/></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{a}</p></details>)}</div></section>

        <section className="px-5 pb-20 lg:pb-28"><div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-emerald-600 px-6 py-14 text-center text-white shadow-2xl shadow-emerald-900/20 sm:px-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Heart size={25}/></div><h2 className="mx-auto mt-6 max-w-2xl text-4xl font-black tracking-[-0.035em] sm:text-5xl">Turn your customers into regulars.</h2><p className="mx-auto mt-4 max-w-xl text-base leading-7 text-emerald-50">Start your loyalty program today and see what Loyalink can do for your business.</p><button onClick={onBusinessLogin} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-black text-emerald-700 shadow-xl transition hover:-translate-y-0.5">Start Free — Up to 100 Members <ArrowRight size={17}/></button></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><div className="text-lg font-black">Loyalink</div><p className="mt-1 text-xs text-slate-400">Simple loyalty. Stronger customer relationships.</p></div><div className="flex flex-wrap gap-5 text-xs font-bold text-slate-400"><button onClick={onMemberLogin} className="hover:text-slate-950">Member login</button><button onClick={onBusinessLogin} className="hover:text-slate-950">Business login</button><span>© 2026 Loyalink</span></div></div></footer>
    </div>
  );
};
