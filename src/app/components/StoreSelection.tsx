import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Citrus, Coffee, MapPin } from 'lucide-react';
import { useAppContext } from './AppContext';
import { IMAGES } from './data';
import { getStoreBranches } from '../services/firestore';

export function StoreSelection() {
  const navigate = useNavigate();
  const { setSelectedBrand } = useAppContext();
  const [lehmuhnCount, setLehmuhnCount] = useState<number | null>(null);
  const [kohfeeCount, setKohfeeCount] = useState<number | null>(null);

  useEffect(() => {
    getStoreBranches('lehmuhn').then(docs => setLehmuhnCount(docs.length));
    getStoreBranches('kohfee').then(docs => setKohfeeCount(docs.length));
  }, []);

  const handleSelect = (brand: 'lehmuhn' | 'kohfee') => {
    setSelectedBrand(brand);
    navigate('/branches');
  };

  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="text-[24px] text-[#362415]" style={{ fontWeight: 700 }}>Choose Your Store</h1>
      <p className="text-[14px] text-[#757575] mt-1 mb-6">Select a brand to explore</p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('lehmuhn')}
        className="w-full rounded-[16px] overflow-hidden mb-4 text-left cursor-pointer"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
      >
        <div className="h-[140px] relative">
          <img src={IMAGES.lemonJuice} alt="Leh-muhn" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <Citrus size={24} color="#00704A" />
            </div>
            <div>
              <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 700 }}>leh-muhn Juices & Tea</h2>
              <p className="text-[13px] text-[#757575]">Fresh juices, teas & smoothies</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[12px] text-[#00704A]">
            <MapPin size={14} />
            <span>{lehmuhnCount === null ? '...' : `${lehmuhnCount} branch${lehmuhnCount !== 1 ? 'es' : ''} available`}</span>
          </div>
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelect('kohfee')}
        className="w-full rounded-[16px] overflow-hidden text-left cursor-pointer"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
      >
        <div className="h-[140px] relative">
          <img src={IMAGES.shop} alt="the koh-fee" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5E6D8] flex items-center justify-center">
              <Coffee size={24} color="#362415" />
            </div>
            <div>
              <h2 className="text-[18px] text-[#362415]" style={{ fontWeight: 700 }}>the koh-fee</h2>
              <p className="text-[13px] text-[#757575]">Specialty coffee & blends</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[12px] text-[#362415]">
            <MapPin size={14} />
            <span>{kohfeeCount === null ? '...' : `${kohfeeCount} branch${kohfeeCount !== 1 ? 'es' : ''} available`}</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
