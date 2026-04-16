import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Loader2, LogOut, MapPin, Search, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import { getAllBranches } from '../services/firestore';
import { logout, updateUserProfile } from '../services/auth';
import type { BranchDoc } from '../types/firestore';

const STORE_LABELS: Record<string, string> = {
  lehmuhn: 'Leh-muhn',
  kohfee: 'Koh-fee',
};

export function CashierBranchSelection() {
  const navigate = useNavigate();
  const {
    firebaseUser,
    userProfile,
    setIsLoggedIn,
    resetState,
    updateUserProfileLocal,
  } = useAppContext();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingBranchId, setSavingBranchId] = useState('');
  const [branches, setBranches] = useState<BranchDoc[]>([]);

  const assignedBranchId = userProfile?.assignedBranchId ?? '';
  const activeBranchId = userProfile?.activeBranchId ?? '';

  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.role !== 'CASHIER') {
      navigate('/home', { replace: true });
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getAllBranches()
      .then((docs) => {
        if (cancelled) return;
        setBranches(docs.filter((branch) => branch.isActive));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        toast.error('Failed to load branches. Please try again.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleBranches = useMemo(() => {
    const scoped = assignedBranchId
      ? branches.filter((branch) => branch.branchId === assignedBranchId)
      : branches;

    const term = search.trim().toLowerCase();
    if (!term) return scoped;

    return scoped.filter((branch) => (
      branch.branchName.toLowerCase().includes(term)
      || branch.address.toLowerCase().includes(term)
    ));
  }, [assignedBranchId, branches, search]);

  const handleSelectBranch = async (branchId: string) => {
    if (!firebaseUser || savingBranchId) return;

    setSavingBranchId(branchId);
    try {
      await updateUserProfile(firebaseUser.uid, { activeBranchId: branchId });
      updateUserProfileLocal({ activeBranchId: branchId });
      toast.success('Branch selected. You can now receive branch orders.');
      navigate('/cashier', { replace: true });
    } catch {
      toast.error('Failed to set active branch. Please try again.');
    } finally {
      setSavingBranchId('');
    }
  };

  const handleLogout = async () => {
    await logout();
    resetState();
    setIsLoggedIn(false);
    navigate('/splash', { replace: true });
  };

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <button
            onClick={() => navigate('/cashier')}
            className="mb-2 text-[#362415] cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Select Cashier Branch</h1>
          <p className="text-[13px] text-[#757575] mt-0.5">Choose where this cashier session will receive orders.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-[#D32F2F] text-[#D32F2F] text-[12px] cursor-pointer shrink-0"
          style={{ fontWeight: 600 }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {assignedBranchId && (
        <div className="mb-4 rounded-[12px] border border-[#81C784] bg-[#E8F5E9] px-3 py-2.5">
          <p className="text-[13px] text-[#2E7D32]" style={{ fontWeight: 600 }}>
            Admin assigned this cashier account to one branch.
          </p>
          <p className="text-[12px] text-[#2E7D32] mt-0.5">
            Select the assigned branch to continue.
          </p>
        </div>
      )}

      <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 mb-4">
        <Search size={18} color="#757575" className="mr-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branch by name or address"
          className="bg-transparent flex-1 outline-none text-[14px]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-14">
          <Loader2 size={32} color="#00704A" className="animate-spin" />
        </div>
      )}

      {!loading && visibleBranches.length === 0 && (
        <div className="rounded-[14px] bg-[#FFF3E0] border border-[#FFB74D] p-4">
          <p className="text-[14px] text-[#E65100]" style={{ fontWeight: 600 }}>
            No active branch found for this cashier account.
          </p>
          <p className="text-[13px] text-[#E65100] mt-1">
            Please ask an admin to assign or activate a branch.
          </p>
        </div>
      )}

      {!loading && visibleBranches.length > 0 && (
        <div className="space-y-3">
          {visibleBranches.map((branch, index) => {
            const isSelected = activeBranchId === branch.branchId;
            const isSaving = savingBranchId === branch.branchId;

            return (
              <motion.button
                key={branch.branchId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleSelectBranch(branch.branchId)}
                disabled={Boolean(savingBranchId)}
                className="w-full rounded-[16px] p-4 text-left border cursor-pointer transition-all disabled:opacity-60"
                style={{
                  borderColor: isSelected ? '#00704A' : 'rgba(0,0,0,0.08)',
                  background: isSelected ? '#E8F5E9' : 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Store size={14} color="#00704A" />
                      <span className="text-[12px] text-[#00704A]" style={{ fontWeight: 700 }}>
                        {STORE_LABELS[branch.storeId] ?? branch.storeId}
                      </span>
                    </div>

                    <h3 className="text-[16px] text-[#362415]" style={{ fontWeight: 700 }}>{branch.branchName}</h3>
                    <p className="text-[13px] text-[#757575] mt-1 flex items-start gap-1.5">
                      <MapPin size={14} className="mt-[1px] shrink-0" />
                      <span>{branch.address}</span>
                    </p>
                    <p className="text-[12px] text-[#757575] mt-1">{branch.operatingHours}</p>
                  </div>

                  <div className="shrink-0">
                    {isSaving ? (
                      <Loader2 size={20} color="#00704A" className="animate-spin" />
                    ) : isSelected ? (
                      <CheckCircle2 size={20} color="#2E7D32" />
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
