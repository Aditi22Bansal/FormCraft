import { motion, AnimatePresence } from 'framer-motion';

export default function Drawer({ open, onClose, children, width = 480 }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ width }}
            className="fixed right-0 top-0 h-full bg-surface border-l border-border z-50 overflow-y-auto">
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
