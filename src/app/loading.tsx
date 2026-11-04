export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-6 text-[#0A0A0A]">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        {/* Logo / Monogram placeholder */}
        <div className="w-12 h-12 rounded-full border-2 border-[#0A0A0A] border-t-transparent animate-spin" />

        <div className="text-center space-y-1">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A] uppercase block">
            Cordeiro Ink
          </span>
          <span className="font-sans text-[10px] tracking-[0.25em] text-[#737373] uppercase font-semibold block">
            Carregando Ateliê...
          </span>
        </div>
      </div>
    </div>
  );
}
