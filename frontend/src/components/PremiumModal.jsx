import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import { Crown, Lock, X } from '@phosphor-icons/react';

// Animate UI's animated Radix Dialog: zoom/fade in & out, focus trapped inside,
// Escape and backdrop click close it, focus returns to the trigger afterwards.
export default function PremiumModal({ open, onClose }) {
  return (
    <Dialog.Root open={!!open} onOpenChange={(next) => !next && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        {/* Centred with inset/margin rather than translate so it doesn't fight Motion's transforms. */}
        <Dialog.Content className="fixed inset-x-4 inset-y-0 z-50 m-auto h-fit max-w-sm rounded-2xl border border-gold/50 bg-night-900 p-6 text-center shadow-2xl shadow-gold/10 focus:outline-none">
          <Dialog.Close
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-300 hover:bg-night-800 transition-colors"
            aria-label="Đóng"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </Dialog.Close>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600">
            <Lock size={30} weight="fill" className="text-night-950" aria-hidden="true" />
          </div>
          <Dialog.Title className="text-lg font-bold text-slate-100">Tính năng Premium</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-400">
            Bài học này dành cho tài khoản PRO. Nâng cấp tài khoản của bạn để truy cập toàn bộ bài luyện viết (1-7) và
            đề thi thật.
          </Dialog.Description>
          <button
            type="button"
            onClick={() => {
              alert('Tính năng nâng cấp PRO sẽ sớm được cập nhật, cảm ơn bạn đã quan tâm!');
              onClose?.();
            }}
            className="mt-5 w-full min-h-[44px] rounded-lg bg-gradient-to-r from-coral-500 to-gold py-2.5 text-sm font-semibold text-night-950 hover:opacity-90 transition-opacity"
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Crown size={16} weight="fill" aria-hidden="true" />
              Mở khoá PRO
            </span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
