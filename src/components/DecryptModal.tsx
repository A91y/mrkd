'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecryptModalProps } from '@/types';

export default function DecryptModal({ isOpen, onDecrypt, onCancel, error }: DecryptModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onDecrypt(password.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-strong border border-border/50 rounded-3xl shadow-2xl max-w-md w-full p-8 glow-strong"
            >
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Encrypted Content
                </h2>
                <p className="text-sm text-muted-foreground">
                  This markdown is password-protected. Enter the password to view it.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter decryption password"
                    className="w-full px-4 py-3 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    autoFocus
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 glass-strong border border-red-500/30 rounded-xl text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-5 py-3 text-center glass hover-glow rounded-xl transition-all font-semibold border border-border/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!password.trim()}
                    className="flex-1 px-5 py-3 text-white bg-accent hover:bg-accent/90 rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decrypt
                  </button>
                </div>
              </form>

              {/* Warning */}
              <p className="mt-4 text-xs text-center text-muted-foreground">
                ⚠️ Wrong password will result in garbled text
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

