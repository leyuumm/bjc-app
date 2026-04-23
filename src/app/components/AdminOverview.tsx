import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, ChevronDown, DollarSign, Flame, Loader2, Menu, ShoppingBag, TrendingUp, CupSoda, Utensils } from 'lucide-react';
import { useAppContext } from './AppContext';
import { AdminNavPanel } from './AdminNavPanel';
import { getAllBranches, getProductsByStore, onBranchOrdersSnapshot } from '../services/firestore';
import type { BranchDoc, OrderDoc, ProductDoc } from '../types/firestore';
import type { StoreId } from '../types/menu';
import { toast } from 'sonner';

interface TopSellerItem {
  name: string;
  quantity: number;
}

const phpCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

function normalizeDate(input: unknown): Date {
  if (input instanceof Date) return input;

  if (
    typeof input === 'object'
    && input
    && 'toDate' in input
    && typeof (input as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (input as { toDate: () => Date }).toDate();
  }

  return new Date(input as string | number | Date);
}

function isToday(input: unknown): boolean {
  const value = normalizeDate(input);
  const now = new Date();

  return (
    value.getFullYear() === now.getFullYear()
    && value.getMonth() === now.getMonth()
    && value.getDate() === now.getDate()
  );
}

export function AdminOverview() {
  const navigate = useNavigate();
  const { userProfile, authLoading } = useAppContext();

  const [showNavPanel, setShowNavPanel] = useState(false);
  const [branches, setBranches] = useState<BranchDoc[]>([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [branchOrders, setBranchOrders] = useState<Record<string, OrderDoc[]>>({});
  const [productsById, setProductsById] = useState<Record<string, ProductDoc>>({});

  useEffect(() => {
    if (authLoading) return;
    if (userProfile?.role !== 'ADMIN') {
      navigate('/home', { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  useEffect(() => {
    getAllBranches().then(setBranches);
  }, []);

  useEffect(() => {
    if (branches.length === 0) return;

    setBranchOrders({});

    const unsubs = branches.map((branch) => onBranchOrdersSnapshot(branch.branchId, null, (orders) => {
      setBranchOrders((prev) => ({ ...prev, [branch.branchId]: orders }));
    }));

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [branches]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const [lehmuhnProducts, kohfeeProducts] = await Promise.all([
          getProductsByStore('lehmuhn'),
          getProductsByStore('kohfee'),
        ]);

        if (cancelled) return;

        const all = [...lehmuhnProducts, ...kohfeeProducts];
        const byId = all.reduce<Record<string, ProductDoc>>((acc, product) => {
          acc[product.productId] = product;
          return acc;
        }, {});

        setProductsById(byId);
      } catch {
        toast.error('Unable to load product analytics.');
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const allOrders = useMemo(
    () => Object.values(branchOrders).flat(),
    [branchOrders],
  );

  const selectedOrders = useMemo(
    () => (selectedBranchFilter === 'all' ? allOrders : (branchOrders[selectedBranchFilter] ?? [])),
    [allOrders, branchOrders, selectedBranchFilter],
  );

  const todaySelectedOrders = useMemo(
    () => selectedOrders.filter(order => isToday(order.timestamp)),
    [selectedOrders],
  );

  const todayAllOrders = useMemo(
    () => allOrders.filter(order => isToday(order.timestamp)),
    [allOrders],
  );

  const loadingOrders = branches.length > 0 && Object.keys(branchOrders).length === 0;

  const totalSalesToday = todaySelectedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrdersToday = todaySelectedOrders.length;
  const completedOrders = todaySelectedOrders.filter(order => order.status === 'Completed').length;

  const selectedBranchName = selectedBranchFilter === 'all'
    ? 'All branches'
    : (branches.find((branch) => branch.branchId === selectedBranchFilter)?.branchName ?? 'Selected branch');

  const topSellers = useMemo(() => {
    const counters: Record<StoreId, { drink: Map<string, number>; food: Map<string, number> }> = {
      lehmuhn: { drink: new Map(), food: new Map() },
      kohfee: { drink: new Map(), food: new Map() },
    };

    for (const order of todayAllOrders) {
      for (const item of order.orderDetails) {
        const product = productsById[item.productId];
        if (!product) continue;

        const storeId = product.storeId as StoreId;
        if (storeId !== 'lehmuhn' && storeId !== 'kohfee') continue;

        const meta = (product.meta ?? {}) as Record<string, unknown>;
        const menuGroup = String((meta.menuGroup as string | undefined) ?? '').toUpperCase();
        const isFood = Boolean(meta.isFood) || menuGroup === 'FOOD' || product.categoryId === 'kf-food';

        const bucket = isFood ? counters[storeId].food : counters[storeId].drink;
        const previous = bucket.get(product.productId) ?? 0;
        bucket.set(product.productId, previous + (item.quantity || 0));
      }
    }

    const pickTop = (storeId: StoreId, type: 'drink' | 'food'): TopSellerItem | null => {
      const entries = [...counters[storeId][type].entries()];
      if (entries.length === 0) return null;

      const [productId, quantity] = entries.sort((a, b) => b[1] - a[1])[0];
      const productName = productsById[productId]?.productName ?? productId;
      return { name: productName, quantity };
    };

    return {
      lehmuhn: {
        drink: pickTop('lehmuhn', 'drink'),
        food: pickTop('lehmuhn', 'food'),
      },
      kohfee: {
        drink: pickTop('kohfee', 'drink'),
        food: pickTop('kohfee', 'food'),
      },
    };
  }, [todayAllOrders, productsById]);

  if (authLoading || userProfile?.role !== 'ADMIN') {
    return (
      <div className="px-4 pt-10 pb-6 flex items-center justify-center">
        <Loader2 size={28} color="#00704A" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => setShowNavPanel(true)}
          aria-label="Open admin menu"
          className="flex items-center justify-center w-10 h-10 rounded-full text-[#362415] cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Admin Dashboard</h1>
      </div>
      <p className="text-[13px] text-[#757575] mt-0.5 mb-4">Daily overview</p>

      <div className="mb-4">
        <label className="text-[11px] text-[#757575] mb-2 block uppercase tracking-wide" style={{ fontWeight: 600 }}>
          Filter by Branch
        </label>
        <div className="relative">
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            className="w-full bg-white rounded-[12px] px-4 py-3 text-[14px] outline-none appearance-none cursor-pointer"
            style={{ fontWeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
          <Building2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575]" />
          <ChevronDown size={18} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#757575] pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-[16px] bg-gradient-to-br from-[#00704A] to-[#005538] p-5 text-white" style={{ boxShadow: '0 4px 16px rgba(0,112,74,0.3)' }}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={20} className="opacity-80" />
            <span className="text-[12px] opacity-70 uppercase tracking-wide" style={{ fontWeight: 600 }}>Total Sales Today</span>
          </div>
          <p className="text-[12px] opacity-75 mb-1" style={{ fontWeight: 500 }}>
            {selectedBranchName}
          </p>
          <p className="text-[32px]" style={{ fontWeight: 700 }}>
            {phpCurrencyFormatter.format(totalSalesToday)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[16px] bg-white p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} color="#00704A" />
              <span className="text-[11px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>Orders</span>
            </div>
            <p className="text-[28px] text-[#362415]" style={{ fontWeight: 700 }}>
              {loadingOrders ? '...' : totalOrdersToday}
            </p>
          </div>
          <div className="rounded-[16px] bg-white p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} color="#00704A" />
              <span className="text-[11px] text-[#757575] uppercase tracking-wide" style={{ fontWeight: 600 }}>Completed</span>
            </div>
            <p className="text-[28px] text-[#362415]" style={{ fontWeight: 700 }}>
              {loadingOrders ? '...' : completedOrders}
            </p>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} color="#E65100" />
            <span className="text-[12px] text-[#362415] uppercase tracking-wide" style={{ fontWeight: 700 }}>
              Top Sellers Today (All Branches)
            </span>
          </div>

          <div className="space-y-3 mt-3">
            {([
              { id: 'lehmuhn' as StoreId, label: 'the leh-muhn' },
              { id: 'kohfee' as StoreId, label: 'the koh-fee' },
            ]).map((store) => {
              const topDrink = topSellers[store.id].drink;
              const topFood = topSellers[store.id].food;

              return (
                <div key={store.id} className="rounded-[12px] bg-[#F8F8F8] px-3 py-3">
                  <p className="text-[13px] text-[#00704A] mb-2" style={{ fontWeight: 700 }}>{store.label}</p>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <CupSoda size={15} color="#00704A" className="mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#757575] uppercase" style={{ fontWeight: 600 }}>Top Drink</p>
                        <p className="text-[13px] text-[#362415] truncate" style={{ fontWeight: 600 }}>
                          {topDrink ? topDrink.name : 'No drink sales yet'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#00704A] shrink-0" style={{ fontWeight: 700 }}>
                      {topDrink ? `${topDrink.quantity} sold` : '-'}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-3 mt-2.5">
                    <div className="flex items-start gap-2 min-w-0">
                      <Utensils size={15} color="#795548" className="mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#757575] uppercase" style={{ fontWeight: 600 }}>Top Food</p>
                        <p className="text-[13px] text-[#362415] truncate" style={{ fontWeight: 600 }}>
                          {topFood ? topFood.name : store.id === 'lehmuhn' ? 'No food items for this store' : 'No food sales yet'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#795548] shrink-0" style={{ fontWeight: 700 }}>
                      {topFood ? `${topFood.quantity} sold` : '-'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AdminNavPanel open={showNavPanel} onClose={() => setShowNavPanel(false)} />
    </div>
  );
}