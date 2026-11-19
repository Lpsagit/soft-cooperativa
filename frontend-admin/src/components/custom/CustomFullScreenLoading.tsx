export const CustomFullScreenLoading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2">
        <img
          src="/cooperativa/admin_coop/lpsa4.png"
          alt="Logo"
          className="w-40 h-40 object-contain animate-pulse"
        />
      </div>
    </div>
  );
};
