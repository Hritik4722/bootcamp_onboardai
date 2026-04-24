import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Clock, MessageSquare, Map, UploadCloud, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, getDocuments } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [planStats, setPlanStats] = useState({ total: 16, completed: 12, pending: 4, percent: 65 });
  const [profile, setProfile] = useState({ name: 'Alex', role: '', department: '' });

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

    // Fetch documents
    getDocuments().then(setDocuments).catch(console.error);

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
          
          setPlanStats({
            total,
            completed,
            pending: total - completed,
            percent
          });
        } catch (e) {
          console.error("Error parsing plan for stats", e);
        }
      }
    };

    // Calculate initially
    calculateStats();

    // Re-calculate if progress updates in another component
    window.addEventListener('progress_updated', calculateStats);
    return () => window.removeEventListener('progress_updated', calculateStats);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');
    try {
      const result = await uploadDocument(file);
      setUploadStatus(`✅ ${result.filename} — ${result.chunks_stored} chunks stored`);
      // Refresh documents
      getDocuments().then(setDocuments).catch(console.error);
      setTimeout(() => setUploadStatus(''), 5000);
    } catch (err: any) {
      setUploadStatus(`❌ ${err.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Welcome, {profile.name}!</h1>
        <p className="text-on-surface-variant">Your onboarding journey as {profile.role} in {profile.department} is underway.</p>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleUpload} className="hidden" />

      <div className="grid grid-cols-12 gap-6">
        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-surface-container-highest p-8 flex items-center gap-8 shadow-sm"
        >
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
              <circle className="text-secondary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * planStats.percent / 100)} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-on-surface">{planStats.percent}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Complete</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Onboarding Progress</h3>
            <p className="text-sm text-on-surface-variant mb-6">You're doing great! Keep working through your generated plan.</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full">
                <CheckCircle2 size={14} className="text-secondary" />
                <span className="text-xs font-bold">Documents Sent</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full">
                <Clock size={14} className="text-on-surface-variant" />
                <span className="text-xs font-bold text-on-surface-variant">Training: Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-surface-container-highest p-8 shadow-sm flex flex-col"
        >
          <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6">Tasks Summary</h3>
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-sm font-bold">Completed</span>
              </div>
              <span className="text-2xl font-black">{planStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Clock size={20} />
                </div>
                <span className="text-sm font-bold">Pending</span>
              </div>
              <span className="text-2xl font-black">{planStats.pending}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-surface-container mt-auto">
            <div className="flex justify-between items-center text-xs font-bold text-accent">
              <span>Next Deadline: Training Module</span>
              <span>Tomorrow</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="col-span-12 bg-white rounded-xl border border-surface-container-highest p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          {uploadStatus && (
            <div className="mb-4 p-3 rounded-xl bg-surface-container text-sm font-medium text-on-surface">
              {uploadStatus}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/chat')} className="flex items-center justify-center gap-3 p-4 rounded-xl border border-surface-container-highest hover:border-accent hover:bg-accent/5 transition-all group bg-white">
              <MessageSquare size={20} className="text-accent" />
              <span className="font-bold text-on-surface">Continue Chat</span>
            </button>
            <button onClick={() => navigate('/plan')} className="flex items-center justify-center gap-3 p-4 rounded-xl border border-surface-container-highest hover:border-accent hover:bg-accent/5 transition-all group bg-white">
              <Map size={20} className="text-accent" />
              <span className="font-bold text-on-surface">View Plan</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 p-4 rounded-xl border border-surface-container-highest hover:border-accent hover:bg-accent/5 transition-all group bg-white">
              <UploadCloud size={20} className="text-accent" />
              <span className="font-bold text-on-surface">Upload Document</span>
            </button>
          </div>
        </div>

        {/* Uploaded Documents Section */}
        <div className="col-span-12 bg-surface-container-low rounded-xl border border-surface-container-highest p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Uploaded Documents</h3>
              <p className="text-sm text-on-surface-variant">Company materials available to the AI assistant.</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="text-accent text-sm font-bold hover:underline">
              + Add Document
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.length > 0 ? (
              documents.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-container-highest shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface truncate max-w-[150px] sm:max-w-[200px]" title={doc}>{doc}</h4>
                    <p className="text-xs text-on-surface-variant">Processed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant col-span-3">No documents uploaded yet. Upload a PDF or DOCX file to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
