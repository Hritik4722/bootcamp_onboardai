import { Bell, Settings, Verified } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b border-surface-container-highest flex items-center justify-between h-16 px-8 ml-70">
      <div className="flex items-center gap-2">
        <Verified className="text-accent" size={20} fill="currentColor" />
        <span className="text-sm font-semibold tracking-tight text-on-surface">AI Assistant Status: Online</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-accent transition-colors">
            <Bell size={20} />
          </button>
          <button className="hover:text-accent transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-surface-container-highest">
          <span className="text-sm font-bold text-on-surface">Alex Rivera</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-container-highest">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
