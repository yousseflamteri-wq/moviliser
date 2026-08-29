export default function Toast({ toast }) {
  if (!toast) return null;
  const bad = toast.tone === 'bad';
  return (
    <div
      role="status"
      className={`fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full px-5 py-2.5 text-[14px]
        font-500 shadow-lift animate-toast-in ${bad ? 'bg-red-600 text-white' : 'bg-ink text-paper'}`}
    >
      {toast.msg}
    </div>
  );
}
