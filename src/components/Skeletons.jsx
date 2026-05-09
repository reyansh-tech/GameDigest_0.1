export function CardSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass rounded-[24px] p-4">
          <div className="skeleton h-5 w-20" />
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="skeleton h-16" />
            <div className="skeleton h-10 self-center" />
            <div className="skeleton h-16" />
          </div>
          <div className="mt-6 skeleton h-4 w-2/3" />
        </div>
      ))}
    </>
  );
}
