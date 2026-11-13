import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import { ChatCircleText, X, CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { sendFeedback } from '../api/feedback';

const INPUT =
  'w-full bg-night-900 border border-night-600 rounded-xl px-3 py-2.5 text-[0.9375rem] text-slate-100 placeholder:text-slate-500 transition-colors focus:border-coral-400 focus:ring-2 focus:ring-coral-400/30 focus:outline-none';

// "Góp ý" box: a floating button on every learner page that opens a short form.
// Signed-in learners are linked to their account; guests may leave a contact.
export default function FeedbackButton() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Admin pages have their own sticky save bars; the admin reads feedback instead.
  if (location.pathname.startsWith('/admin')) return null;

  function onOpenChange(next) {
    setOpen(next);
    if (!next) {
      setError('');
      if (sent) {
        setSent(false);
        setMessage('');
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) {
      setError('Bạn hãy nhập nội dung góp ý.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await sendFeedback({ message, email: user ? undefined : contact, page: location.pathname });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Chưa gửi được, bạn thử lại sau ít phút nhé.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 inline-flex items-center gap-2 min-h-[48px] min-w-[48px] justify-center rounded-full bg-coral-500 hover:bg-coral-600 px-3.5 sm:px-5 text-sm font-bold text-white shadow-[0_10px_28px_-10px_rgba(31,63,143,0.8)] transition-colors"
        aria-label="Góp ý cho Belle Chinese Lab"
      >
        <ChatCircleText size={22} weight="fill" aria-hidden="true" />
        <span className="hidden sm:inline">Góp ý</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night-950/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-4 inset-y-0 z-50 m-auto h-fit max-w-md surface p-6 sm:p-7 focus:outline-none">
          <Dialog.Close
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-night-700 transition-colors"
            aria-label="Đóng"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </Dialog.Close>

          {sent ? (
            <div className="text-center py-4" role="status">
              <CheckCircle size={48} weight="fill" className="mx-auto text-ok" aria-hidden="true" />
              <Dialog.Title className="mt-3 text-xl font-extrabold tracking-tight text-slate-100">Cảm ơn bạn!</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-400">
                Góp ý của bạn đã được gửi tới Belle Chinese Lab.
              </Dialog.Description>
              <Dialog.Close className="mt-6 min-h-[44px] rounded-xl bg-coral-500 hover:bg-coral-600 px-6 text-sm font-bold text-white transition-colors">
                Đóng
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Dialog.Title className="text-xl font-extrabold tracking-tight text-slate-100 pr-8">Góp ý</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-400">
                Bạn gặp lỗi, muốn thêm dạng bài hay có ý tưởng nào? Hãy cho chúng mình biết nhé.
              </Dialog.Description>

              <label htmlFor="fb-message" className="block mt-5 mb-1.5 text-sm font-semibold text-slate-300">
                Nội dung
              </label>
              <textarea
                id="fb-message"
                rows={5}
                maxLength={3000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? 'fb-error' : undefined}
                className={`${INPUT} resize-y leading-relaxed`}
                placeholder="Ví dụ: Bước Đục lỗ bài 求职信 bị trùng câu…"
              />

              {!user && (
                <>
                  <label htmlFor="fb-contact" className="block mt-4 mb-1.5 text-sm font-semibold text-slate-300">
                    Email hoặc số điện thoại <span className="font-normal text-slate-500">(không bắt buộc)</span>
                  </label>
                  <input
                    id="fb-contact"
                    type="text"
                    autoComplete="email"
                    maxLength={120}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className={INPUT}
                  />
                </>
              )}

              {error && (
                <p id="fb-error" role="alert" className="mt-3 text-sm text-err">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-wait text-sm font-bold text-white transition-colors"
              >
                {sending ? 'Đang gửi…' : 'Gửi góp ý'}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
