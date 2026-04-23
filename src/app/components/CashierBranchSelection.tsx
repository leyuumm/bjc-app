import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Loader2, LogOut, MapPin, Search, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import { getAllBranches } from '../services/firestore';
import { logout, updateUserProfile } from '../services/auth';
import type { BranchDoc } from '../types/firestore';
import type { StoreId } from '../types/menu';

const STORE_LABELS: Record<string, string> = {
  lehmuhn: 'Leh-muhn',
  kohfee: 'Koh-fee',
};

function getLocationKey(branchName: string): string {
  return branchName
    .replace(/^Leh-?Muhn\s*/i, '')
    .replace(/^Koh-?Fee\s*/i, '')
    .trim()
    .toLowerCase();
}

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
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<BranchDoc[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<StoreId | ''>('');

  const assignedBranchId = userProfile?.assignedBranchId ?? '';
  const assignedBranchIds = userProfile?.assignedBranchIds ?? [];
  const activeBranchId = userProfile?.activeBranchId ?? '';
  const assignedStoreIds = (userProfile?.assignedStoreIds ?? []) as StoreId[];
  const activeStoreId = (userProfile?.activeStoreId ?? '') as StoreId | '';

  useEffect(() => {
    setSelectedBranchId(activeBranchId);
    setSelectedStoreId(activeStoreId);
  }, [activeBranchId, activeStoreId]);

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
    let scoped = branches;

    if (assignedBranchIds.length > 0) {
      scoped = branches.filter((branch) => assignedBranchIds.includes(branch.branchId));
    } else if (assignedBranchId) {
      const anchor = branches.find((branch) => branch.branchId === assignedBranchId);
      const locationKey = anchor ? getLocationKey(anchor.branchName) : '';
      scoped = locationKey
        ? branches.filter((branch) => getLocationKey(branch.branchName) === locationKey)
        : branches.filter((branch) => branch.branchId === assignedBranchId);
    }

    const term = search.trim().toLowerCase();
    if (!term) return scoped;

    return scoped.filter((branch) => (
      branch.branchName.toLowerCase().includes(term)
      || branch.address.toLowerCase().includes(term)
    ));
  }, [assignedBranchId, assignedBranchIds, branches, search]);

  const availableStoreIds = useMemo(() => {
    const branch = visibleBranches.find((item) => item.branchId === selectedBranchId);
    if (!branch) return [];
    const locationKey = getLocationKey(branch.branchName);

    const storesInLocation = visibleBranches
      .filter((item) => getLocationKey(item.branchName) === locationKey)
      .map((item) => item.storeId as StoreId);

    const uniqueStores = [...new Set(storesInLocation)];
    if (assignedStoreIds.length === 0) return uniqueStores;
    return uniqueStores.filter((storeId) => assignedStoreIds.includes(storeId));
  }, [assignedStoreIds, visibleBranches, selectedBranchId]);

  useEffect(() => {
    if (availableStoreIds.length === 0) {
      setSelectedStoreId('');
      return;
    }
    if (!selectedStoreId || !availableStoreIds.includes(selectedStoreId)) {
      setSelectedStoreId(availableStoreIds[0]);
    }
  }, [availableStoreIds, selectedStoreId]);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    // Auto-select store based on the selected branch's storeId
    const branch = visibleBranches.find((b) => b.branchId === branchId);
    if (branch?.storeId) {
      setSelectedStoreId(branch.storeId as StoreId);
    }
  };

  const handleContinue = async () => {
    if (!firebaseUser || saving) return;
    if (!selectedBranchId) {
      toast.error('Please select your branch first.');
      return;
    }
    if (!selectedStoreId) {
      toast.error('Please select your store assignment.');
      return;
    }

    const selectedBranch = visibleBranches.find((item) => item.branchId === selectedBranchId);
    if (!selectedBranch) {
      toast.error('Selected branch is no longer available.');
      return;
    }

    const locationKey = getLocationKey(selectedBranch.branchName);
    const resolvedBranch = visibleBranches.find((item) => (
      getLocationKey(item.branchName) === locationKey
      && (item.storeId as StoreId) === selectedStoreId
    ));

    if (!resolvedBranch) {
      toast.error('No matching branch found for the selected store in this location.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(firebaseUser.uid, {
        activeBranchId: resolvedBranch.branchId,
        activeStoreId: selectedStoreId,
      });
      updateUserProfileLocal({
        activeBranchId: resolvedBranch.branchId,
        activeStoreId: selectedStoreId,
      });
      toast.success('Cashier session is now synced to your branch and store.');
      navigate('/cashier', { replace: true });
    } catch {
      toast.error('Failed to save assignment. Please try again.');
    } finally {
      setSaving(false);
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
          <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Select Branch</h1>
          <p className="text-[13px] text-[#757575] mt-0.5">Choose your branch to receive orders.</p>
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
            const isSelected = selectedBranchId === branch.branchId;

            return (
              <motion.button
                key={branch.branchId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleSelectBranch(branch.branchId)}
                disabled={saving}
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
                    {isSelected ? (
                      <CheckCircle2 size={20} color="#2E7D32" />
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {!loading && availableStoreIds.length > 0 && (
        <div className="mt-5">
          <p className="text-[12px] text-[#757575] mb-2 uppercase tracking-wide" style={{ fontWeight: 600 }}>
            Assigned Store
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableStoreIds.map((storeId) => {
              const active = selectedStoreId === storeId;
              return (
                <button
                  key={storeId}
                  onClick={() => {
                    setSelectedStoreId(storeId);
                    // Auto-select the corresponding branch for this store
                    const branchForStore = visibleBranches.find((b) => b.storeId === storeId);
                    if (branchForStore) {
                      setSelectedBranchId(branchForStore.branchId);
                    }
                  }}
                  disabled={saving}
                  className={`rounded-[12px] px-3 py-3 text-[14px] border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#00704A] border-[#00704A] text-white'
                      : 'bg-white border-[rgba(0,0,0,0.1)] text-[#362415]'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {STORE_LABELS[storeId] ?? storeId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedBranchId && selectedStoreId && (
        <div className="mt-4 rounded-[10px] bg-[#FFF3E0] border border-[#FFB74D] px-3 py-2.5">
          <p className="text-[12px] text-[#E65100]" style={{ fontWeight: 500 }}>
            Selected: <span style={{ fontWeight: 700 }}>{branches.find(b => b.branchId === selectedBranchId)?.branchName}</span> at <span style={{ fontWeight: 700 }}>{STORE_LABELS[selectedStoreId] ?? selectedStoreId}</span>
          </p>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={loading || saving || !selectedBranchId || !selectedStoreId}
        className="w-full mt-6 py-3.5 rounded-[14px] text-white text-[15px] cursor-pointer flex items-center justify-center gap-2"
        style={{
          background: '#00704A',
          fontWeight: 700,
          opacity: loading || saving || !selectedBranchId || !selectedStoreId ? 0.5 : 1,
        }}
      >
        {saving && <Loader2 size={18} className="animate-spin" />}
        Confirm Selection
      </button>
    </div>
  );
}
