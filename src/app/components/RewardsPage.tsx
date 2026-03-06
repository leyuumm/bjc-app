import React from 'react';
import { motion } from 'motion/react';
import { Star, Gift, Tag, Sparkles, Coffee, Citrus, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { IMAGES } from './data';

const promos = [
  { id: '1', title: 'Buy 1 Get 1 Free', desc: 'On all large drinks every Wednesday', validUntil: 'Mar 15, 2026', image: IMAGES.frappe },
  { id: '2', title: '20% Off Juices', desc: 'Fresh juice specials this weekend', validUntil: 'Mar 10, 2026', image: IMAGES.citrus },
  { id: '3', title: 'Free Upsize', desc: 'Upsize any drink for free with min. ₱200 order', validUntil: 'Mar 20, 2026', image: IMAGES.matcha },
];

const rewards = [
  { id: '1', name: 'Free Regular Coffee', points: 200, icon: Coffee },
  { id: '2', name: 'Free Lemon Tea', points: 150, icon: Citrus },
  { id: '3', name: '₱50 Discount', points: 300, icon: Tag },
  { id: '4', name: 'Mystery Gift', points: 500, icon: Gift },
];

export function RewardsPage() {
  const { loyaltyPoints } = useAppContext();

  return (
    <div className="pb-6">
      {/* Loyalty Banner */}
      <div
        className="px-5 pt-12 pb-8 rounded-b-[24px]"
        style={{ background: 'linear-gradient(135deg, #362415, #00704A)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} color="#FFD700" />
          <span className="text-white/80 text-[13px]" style={{ fontWeight: 500 }}>BJC Rewards</span>
        </div>
        <h1 className="text-white text-[36px]" style={{ fontWeight: 700 }}>{loyaltyPoints.toLocaleString()}</h1>
        <p className="text-white/60 text-[14px] mt-0.5">Loyalty Points</p>

        <div className="mt-5 bg-white/15 rounded-[12px] p-3 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-[12px]">Next Reward</p>
            <p className="text-white text-[14px]" style={{ fontWeight: 600 }}>Free Coffee at 1,500 pts</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
            <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>83%</span>
          </div>
        </div>
      </div>

      {/* Promotions */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 700 }}>Promotions</h2>
          <button className="text-[13px] text-[#00704A] cursor-pointer" style={{ fontWeight: 500 }}>See All</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[260px] rounded-[16px] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              <div className="h-[100px] relative">
                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                <span className="absolute bottom-2 left-3 text-white text-[11px] bg-[#D32F2F] px-2 py-0.5 rounded-[8px]" style={{ fontWeight: 500 }}>
                  Limited Time
                </span>
              </div>
              <div className="p-3 bg-white">
                <h3 className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>{promo.title}</h3>
                <p className="text-[12px] text-[#757575] mt-0.5">{promo.desc}</p>
                <p className="text-[11px] text-[#00704A] mt-1" style={{ fontWeight: 500 }}>Valid until {promo.validUntil}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Redeemable Rewards */}
      <div className="px-4 pt-6">
        <h2 className="text-[18px] text-[#362415] mb-3" style={{ fontWeight: 700 }}>Redeem Rewards</h2>
        <div className="space-y-2">
          {rewards.map((reward, i) => {
            const canRedeem = loyaltyPoints >= reward.points;
            return (
              <motion.button
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileTap={{ scale: canRedeem ? 0.98 : 1 }}
                className={`w-full flex items-center gap-3 p-4 rounded-[16px] border cursor-pointer text-left transition-all ${
                  canRedeem
                    ? 'bg-white border-[rgba(0,0,0,0.06)]'
                    : 'bg-[#FAFAFA] border-[rgba(0,0,0,0.04)] opacity-60'
                }`}
                style={{ boxShadow: canRedeem ? '0 2px 6px rgba(0,0,0,0.04)' : 'none' }}
              >
                <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center ${canRedeem ? 'bg-[#E8F5E9]' : 'bg-[#F5F5F5]'}`}>
                  <reward.icon size={22} color={canRedeem ? '#00704A' : '#757575'} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>{reward.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} color="#FFB300" fill="#FFB300" />
                    <span className="text-[12px] text-[#757575]">{reward.points} points</span>
                  </div>
                </div>
                <ChevronRight size={18} color={canRedeem ? '#00704A' : '#E0E0E0'} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="px-4 pt-6">
        <h2 className="text-[18px] text-[#362415] mb-3" style={{ fontWeight: 700 }}>Points History</h2>
        <div className="space-y-2">
          {[
            { label: 'Order #BJC-001', pts: '+25', date: 'Mar 4, 2026' },
            { label: 'Order #BJC-002', pts: '+15', date: 'Mar 3, 2026' },
            { label: 'Free Coffee Redeemed', pts: '-200', date: 'Mar 1, 2026' },
            { label: 'Birthday Bonus', pts: '+100', date: 'Feb 28, 2026' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-[rgba(0,0,0,0.06)]">
              <div>
                <p className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>{entry.label}</p>
                <p className="text-[12px] text-[#757575]">{entry.date}</p>
              </div>
              <span className={`text-[14px] ${entry.pts.startsWith('+') ? 'text-[#00704A]' : 'text-[#D32F2F]'}`}
                style={{ fontWeight: 600 }}>
                {entry.pts} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
