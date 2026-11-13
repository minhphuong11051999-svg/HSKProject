import { useNavigate } from 'react-router-dom';
import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import { Crown, Lock, X } from '@phosphor-icons/react';

const DEFAULT_TITLE = 'Tính năng PRO';
const DEFAULT_DESCRIPTION =
  'Nội dung này dành cho tài khoản PRO. Nâng cấp để mở đủ các bước của mọi bài học, đáp án mẫu, thêm đề mẫu và đề thi thật.';

// Animate UI's animated Radix Dialog: zoom/fade in & out, focus trapped inside,
// Escape and backdrop click close it, focus returns to the trigger afterwards.
// `title` / `description` let callers say which feature is locked.
export default function PremiumModal({ open, onClose, title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }) {
  const navigate = useNavigate();

  return (
    <Dialog.Root open={!!open} onOpenChange={(next) => !next && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night-950/80 backdrop-blur-sm" />
        {/* Centred with inset/margin rather than translate so it doesn't fight Motion's transforms. */}
        <Dialog.Content className="fixed inset-x-4 inset-y-0 z-50 m-auto h-fit max-w-sm surface !border-gold/50 p-7 text-center focus:outline-none">
          <Dialog.Close
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-night-700 transition-colors"
            aria-label="Đóng"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </Dialog.Close>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/20">
            <Lock size={30} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <Dialog.Title className="text-xl font-extrabold tracking-tight text-slate-100">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-slate-400">{description}</Dialog.Description>
          <button
            type="button"
            onClick={() => {
              onClose?.();
              navigate('/pro');
            }}
            className="mt-6 w-full min-h-[44px] rounded-xl bg-coral-500 py-2.5 shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] text-sm font-bold text-white hover:bg-coral-600 transition-colors"
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Crown size={16} weight="fill" className="text-amber-200" aria-hidden="true" />
              Xem gói PRO
            </span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
