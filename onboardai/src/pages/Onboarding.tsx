import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { generatePlan, uploadDocument } from '../services/api';
import { Loader2, UploadCloud, User, Briefcase, Building, ChevronRight, Hash } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    role: '',
    department: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Profile, 2 = Plan Generation Status

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep(2);

    try {
      // Step 1: Upload document if present
      if (file) {
        await uploadDocument(file);
      }

      // Step 2: Generate Plan
      // We use age/experience generically or pass an empty string for experience if age is given
      const result = await generatePlan(formData.role, "Entry level", formData.department);
      
      // Save everything to localStorage
      localStorage.setItem('onboardProfile', JSON.stringify(formData));
      localStorage.setItem('onboardPlan', JSON.stringify(result.plan));
      
      // Set User ID for Chat persistence
      const currentUserId = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('onboardUserId', currentUserId);

      // Navigate to Dashboard
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert('Failed to complete onboarding: ' + err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-surface-container-highest p-8 md:p-12 shadow-xl z-10 relative"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
            <span className="text-2xl font-black tracking-tighter">OAI</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface mb-3 tracking-tight">Welcome Aboard!</h1>
          <p className="text-on-surface-variant font-medium">Let's set up your personalized onboarding journey.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low border border-surface-container-highest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all" placeholder="Jane Doe" />
                </div>
              </div>
              
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Age</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
                  <input required name="age" value={formData.age} onChange={handleInputChange} type="number" className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low border border-surface-container-highest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all" placeholder="28" />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Role / Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
                  <input required name="role" value={formData.role} onChange={handleInputChange} type="text" className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low border border-surface-container-highest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all" placeholder="e.g. Senior Frontend Engineer" />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Department</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
                  <input required name="department" value={formData.department} onChange={handleInputChange} type="text" className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low border border-surface-container-highest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all" placeholder="e.g. Product Engineering" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container-highest">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3">Company Handbook / Guidelines (Optional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-container-highest hover:border-accent/50 rounded-xl p-6 text-center cursor-pointer transition-colors group bg-surface-container-low/50"
              >
                <UploadCloud className="mx-auto mb-2 text-on-surface-variant group-hover:text-accent transition-colors" size={24} />
                <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {file ? file.name : "Click to upload a PDF or DOCX file"}
                </p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileChange} className="hidden" />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.name || !formData.role || !formData.department}
              className="w-full py-4 mt-6 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Start Your Journey <ChevronRight size={18} />
            </button>
          </form>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-surface-container rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Crafting your 30-Day Plan</h3>
              <p className="text-sm text-on-surface-variant">We're {file ? 'analyzing your document and ' : ''}generating a personalized roadmap...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
