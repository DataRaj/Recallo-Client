'use client';

import { motion } from 'framer-motion';

import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex size-full flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
