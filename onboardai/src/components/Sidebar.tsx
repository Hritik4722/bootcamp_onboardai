import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const [profile, setProfile] = useState<{name?: string, role?: string}>({});
  const [planStats, setPlanStats] = useState({ total: 0, completed: 0, percent: 0 });

  useEffect(() => {
    // Load profile
    const savedProfileStr = localStorage.getItem('onboardProfile');
    if (savedProfileStr) {
      try {
        setProfile(JSON.parse(savedProfileStr));
      } catch (e) {
        console.error(e);
      }
    }

    const calculateStats = () => {
      const savedPlanStr = localStorage.getItem('onboardPlan');
      const savedProgressStr = localStorage.getItem('onboardProgress');
      
      if (savedPlanStr) {
        try {
          const plan = JSON.parse(savedPlanStr);
          let total = 0;
          plan.forEach((day: any) => {
            total += day.tasks ? day.tasks.length : 0;
          });
          
          let completed = 0;
          if (savedProgressStr) {
            const progressArr = JSON.parse(savedProgressStr);
            completed = Array.isArray(progressArr) ? progressArr.length : 0;
          }
          
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          setPlanStats({ total, completed, percent });
        } catch (e) {}
      }
    };

    calculateStats();
    window.addEventListener('progress_updated', calculateStats);
    return () => window.removeEventListener('progress_updated', calculateStats);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: '30-Day Plan', icon: Calendar, path: '/plan' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-70 bg-white border-r border-surface-container-highest flex flex-col py-8 px-4 gap-2 z-50">
      <div className="mb-8 px-4">
        <span className="text-xl font-black text-on-surface tracking-tight">OnboardAI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 border-l-4 border-accent text-accent font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container transition-colors'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4">
        <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-highest">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Overall Progress</span>
            <span className="text-xs font-bold text-secondary">{planStats.percent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${planStats.percent}%` }}
              className="h-full bg-secondary transition-all duration-500"
            />
          </div>
          <p className="mt-3 text-[10px] text-on-surface-variant font-medium">{planStats.completed} of {planStats.total} tasks completed</p>
        </div>
        
        <div className="mt-6 flex items-center gap-3 pt-6 border-t border-surface-container">
          <img 
            className="w-10 h-10 rounded-full border border-surface-container-highest object-cover" 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=0D8B61&color=fff`}
            alt={profile.name}
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-on-surface truncate">{profile.name || 'Setup Pending'}</p>
            <p className="text-[11px] text-on-surface-variant truncate">{profile.role || 'New Employee'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
