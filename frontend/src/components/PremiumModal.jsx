export default function PremiumModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-gold/50 bg-night-900 p-6 text-center shadow-2xl shadow-gold/10"
      >
        <button
          onClick={onClose}
          className="float-right -mt-2 -mr-2 text-slate-500 hover:text-slate-300"
          aria-label="Đóng"
        >
          ✕
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600 text-3xl">
          🔒
        </div>
        <h2 className="text-lg font-bold text-slate-100">Tính năng Premium</h2>
        <p className="mt-2 text-sm text-slate-400">
          Bài học này dành cho tài khoản PRO. Nâng cấp tài khoản của bạn để truy cập toàn bộ bài luyện viết (1-7) và
          đề thi thật.
        </p>
        <button
          onClick={() => {
            alert('Tính năng nâng cấp PRO sẽ sớm được cập nhật, cảm ơn bạn đã quan tâm!');
            onClose();
          }}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-coral-500 to-gold py-2.5 text-sm font-semibold text-night-950 hover:opacity-90 transition-opacity"
        >
          👑 Mở khoá PRO
        </button>
      </div>
    </div>
  );
}
