export const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 opacity-30 pointer-events-none dark:opacity-20">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse delay-2000" />
    </div>
  );
};
