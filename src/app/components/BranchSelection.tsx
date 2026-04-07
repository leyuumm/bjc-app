import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAppContext } from './AppContext';
import { getStoreBranches } from '../services/firestore';
import type { BranchDoc } from '../types/firestore';
import type { Branch } from '../types/menu';

export function BranchSelection() {
  const navigate = useNavigate();
  const { selectedBrand, setSelectedBranch } = useAppContext();
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBrand) return;
    let cancelled = false;
    setLoading(true);
    getStoreBranches(selectedBrand).then((docs: BranchDoc[]) => {
      if (!cancelled) {
        setBranches(docs.map(d => ({
          id: d.branchId,
          name: d.branchName,
          address: d.address,
          hours: d.operatingHours,
          available: d.isActive,
          brand: d.storeId as Branch['brand'],
        })));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedBrand]);

  const filtered = branches
    .filter(b => b.brand === selectedBrand)
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (id: string) => {
    setSelectedBranch(id);
    navigate('/menu');
  };

  return (
    <div className="px-4 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/home')} className="cursor-pointer">
          <ArrowLeft size={24} color="#362415" />
        </button>
        <div>
          <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Select Branch</h1>
          <p className="text-[13px] text-[#757575]">
            {selectedBrand === 'lehmuhn' ? 'Leh-muhn Juices & Tea' : 'Koh-fee'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 mb-6">
        <Search size={18} color="#757575" className="mr-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search branches..."
          className="bg-transparent flex-1 outline-none text-[14px]"
        />
      </div>

      {/* Branch Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[16px] p-4 bg-white border border-[rgba(0,0,0,0.08)] animate-pulse">
              <div className="h-5 bg-[#E0E0E0] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#E0E0E0] rounded w-full mb-1" />
              <div className="h-4 bg-[#E0E0E0] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.map((branch, i) => (
          <motion.button
            key={branch.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => branch.available && handleSelect(branch.id)}
            className={`w-full rounded-[16px] p-4 text-left cursor-pointer border transition-all ${
              branch.available
                ? 'bg-white border-[rgba(0,0,0,0.08)] hover:border-[#00704A]'
                : 'bg-[#FAFAFA] border-[rgba(0,0,0,0.06)] opacity-60'
            }`}
            style={{ boxShadow: branch.available ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-[16px] text-[#362415]" style={{ fontWeight: 600 }}>{branch.name}</h3>
                <div className="flex items-center gap-1 mt-1.5 text-[13px] text-[#757575]">
                  <MapPin size={14} />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[13px] text-[#757575]">
                  <Clock size={14} />
                  <span>{branch.hours}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {branch.available ? (
                  <span className="flex items-center gap-1 text-[12px] text-[#00704A] bg-[#E8F5E9] px-2.5 py-1 rounded-[20px]">
                    <CheckCircle2 size={14} />
                    Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] text-[#D32F2F] bg-[#FFEBEE] px-2.5 py-1 rounded-[20px]">
                    <XCircle size={14} />
                    Closed
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      )}
    </div>
  );
}
