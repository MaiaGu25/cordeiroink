export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-[#0A0A0A]">
      <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] border-t-transparent animate-spin mb-3" />
      <span className="font-sans text-[11px] uppercase tracking-widest text-[#737373] font-semibold animate-pulse">
        Carregando...
      </span>
    </div>
  );
}
