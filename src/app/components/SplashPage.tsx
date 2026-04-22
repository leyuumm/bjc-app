import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

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
          className="w-[240px] mb-8"
        >
          <img src="https://img1.wsimg.com/isteam/ip/c2bd527b-5ab9-45b8-826e-cfa648c84f37/jc%20group.png/:/rs=w:400,h:400,cg:true,m/cr=w:400,h:400/qt=q:95" alt="Beyond JC Group OPC logo" className="w-full h-auto" />
        </motion.div>

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