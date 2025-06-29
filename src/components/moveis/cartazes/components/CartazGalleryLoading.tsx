
export function CartazGalleryLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
