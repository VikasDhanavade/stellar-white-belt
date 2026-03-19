import Freighter from "./components/Freighter";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-100">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>

      <nav className="w-full px-8 py-5 flex items-center justify-between z-10 
                      bg-slate-900/50 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 
                          flex items-center justify-center shadow-lg shadow-blue-500/30
                          group-hover:scale-105 transition-transform duration-300">
            <span className="text-2xl font-black text-white leading-none tracking-tighter">S</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Stellar Connect
          </h1>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[440px] animate-fade-in-up">
          <Freighter />
        </div>
      </main>

      <footer className="pb-8 text-center text-slate-500 text-sm z-10 font-medium tracking-wide">
        Engineered for the <span className="shimmer-text font-bold">Stellar Network</span>
      </footer>
    </div>
  );
}

export default App;