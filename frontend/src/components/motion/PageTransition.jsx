import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

// Soft fade + rise every time the route changes. Keyed by pathname so the
// whole page remounts into the animation; there is no exit phase so the next
// page never waits on the previous one (keeps navigation feeling instant).
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
