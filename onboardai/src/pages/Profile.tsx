import React, { useState, useEffect } from 'react';
import { User, Briefcase, Building, Hash, Settings, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    const savedProfileStr = localStorage.getItem('onboardProfile');
    if (savedProfileStr) {
      try {
        setProfile(JSON.parse(savedProfileStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <main className="p-8 lg:p-12 max-w-[1000px] mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-on-surface mb-3">Your Profile</h1>
        <p className="text-lg text-on-surface-variant font-medium">Manage your personal onboarding details.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-surface-container-highest shadow-sm overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-accent/20 to-primary-container/20 w-full relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=0D8B61&color=fff&size=100`} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white text-on-surface-variant transition-colors shadow-sm">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-on-surface">{profile.name || 'Unknown User'}</h2>
              <p className="text-on-surface-variant font-medium flex items-center gap-2 mt-1">
                <Briefcase size={16} className="text-on-surface-variant/60" />
                {profile.role || 'No Role Assigned'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-surface-container-highest rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-container-highest">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Department</span>
              <div className="flex items-center gap-2 text-on-surface font-medium">
                <Building size={18} className="text-accent" />
                {profile.department || 'Not Specified'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-container-highest">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Age</span>
              <div className="flex items-center gap-2 text-on-surface font-medium">
                <Hash size={18} className="text-accent" />
                {profile.age || 'Not Specified'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
