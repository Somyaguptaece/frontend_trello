export default function BoardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel h-28 rounded-3xl animate-pulse" />
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-panel h-[560px] w-[320px] rounded-[28px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
