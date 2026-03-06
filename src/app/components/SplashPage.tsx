import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Coffee } from 'lucide-react';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen flex flex-col items-center justify-center px-8"
        style={{ background: '#362415', fontFamily: "'Roboto', sans-serif" }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-[140px] h-[140px] rounded-full bg-white flex items-center justify-center mb-8"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00704A, #362415)' }}>
            <Coffee size={56} color="white" strokeWidth={1.8} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white text-[36px] tracking-tight mb-2"
          style={{ fontWeight: 700 }}
        >
          BJC
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/70 text-[14px] mb-2 text-center tracking-wide"
        >
          Brewed Just for the Community
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/50 text-[12px] mb-12 text-center"
        >
          Leh-muhn Juices & Tea  &bull;  Koh-fee
        </motion.p>

        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-[16px] text-white text-[16px] cursor-pointer"
          style={{ background: '#00704A', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,112,74,0.4)' }}
        >
          Get Started
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/30 text-[11px] mt-8"
        >
          v1.0.0
        </motion.p>
      </div>
    </div>
  );
}