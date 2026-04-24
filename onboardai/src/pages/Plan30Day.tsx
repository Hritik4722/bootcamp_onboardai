import { useState, useEffect } from 'react';
import { Download, Share2, CheckCircle2, Lock, CircleDot, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { type PlanDay } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Plan30Day() {
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPlan = localStorage.getItem('onboardPlan');
    const savedProgress = localStorage.getItem('onboardProgress');
    
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    } else {
      // If no plan is found, redirect to onboarding
      navigate('/onboarding');
    }

    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch(e) {}
    }
  }, [navigate]);

  const toggleTask = (taskId: string) => {
    setProgress(prev => {
      const newProgress = prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId];
      
      localStorage.setItem('onboardProgress', JSON.stringify(newProgress));
      window.dispatchEvent(new Event('progress_updated'));
      return newProgress;
    });
  };

  // Group generated plan into weeks
  const getWeeksFromPlan = (days: PlanDay[]) => {
    const weeks = [
      { title: 'WEEK 1: ORIENTATION & SETUP', days: days.filter(d => d.day >= 1 && d.day <= 5), active: true },
      { title: 'WEEK 2: LEARNING & INTEGRATION', days: days.filter(d => d.day >= 6 && d.day <= 10), active: false },
      { title: 'WEEK 3: LEARNING & INTEGRATION', days: days.filter(d => d.day >= 11 && d.day <= 15), active: false },
      { title: 'WEEK 4: HANDS-ON & COLLABORATION', days: days.filter(d => d.day >= 16 && d.day <= 20), active: false },
      { title: 'WEEK 5: HANDS-ON & COLLABORATION', days: days.filter(d => d.day >= 21 && d.day <= 25), active: false },
      { title: 'WEEK 6: REVIEW & GOAL SETTING', days: days.filter(d => d.day >= 26 && d.day <= 30), active: false },
    ];
    return weeks.filter(w => w.days.length > 0);
  };

  return (
    <main className="p-8 lg:p-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-on-surface mb-3">30-Day Success Plan</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl font-medium">Curated milestones designed to ensure your smooth transition into the high-performing team.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-container-highest rounded-xl text-sm font-bold hover:bg-surface-container-low transition-all shadow-sm">
            <Download size={18} />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-container-highest rounded-xl text-sm font-bold hover:bg-surface-container-low transition-all shadow-sm text-accent">
            <Share2 size={18} />
            Share Progress
          </button>
        </div>
      </div>

      {/* Generated Plan */}
      {plan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {getWeeksFromPlan(plan).map((week, idx) => (
            <div key={week.title} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-[11px] font-black flex items-center gap-2 tracking-widest ${idx === 0 ? 'text-accent' : 'text-on-surface-variant/40'}`}>
                  <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-accent animate-pulse' : 'bg-surface-container-highest'}`} />
                  {week.title}
                </h2>
              </div>

              <div className="space-y-4">
                {week.days.map((day, tidx) => {
                  const dayTasksCompleted = day.tasks.every((_, ti) => progress.includes(`${day.day}-${ti}`));
                  return (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + tidx * 0.05 }}
                      className={`relative p-5 rounded-2xl border transition-all ${dayTasksCompleted ? 'bg-surface-container-low border-surface-container-highest opacity-70 grayscale' : 'bg-white border-surface-container-highest hover:border-accent/40'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black bg-accent/10 text-accent px-2 py-0.5 rounded">DAY {day.day}</span>
                        {dayTasksCompleted ? <CheckCircle2 size={16} className="text-secondary" /> : <CircleDot size={16} className="text-on-surface-variant/20" />}
                      </div>
                      <h3 className={`text-sm font-bold mb-2 ${dayTasksCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{day.title}</h3>
                      <ul className="space-y-2">
                        {day.tasks.map((task, ti) => {
                          const taskId = `${day.day}-${ti}`;
                          const isCompleted = progress.includes(taskId);
                          return (
                            <li 
                              key={ti} 
                              onClick={() => toggleTask(taskId)}
                              className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer group"
                            >
                              <button className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isCompleted ? 'bg-secondary border-secondary text-white' : 'border-on-surface-variant/30 group-hover:border-accent'}`}>
                                {isCompleted && <CheckCircle2 size={12} />}
                              </button>
                              <span className={`transition-colors ${isCompleted ? 'text-on-surface-variant/60 line-through' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                                {task}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
