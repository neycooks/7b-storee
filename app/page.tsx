export default function Discover() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-card-bg rounded-lg p-6 relative overflow-hidden min-h-[280px]">
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full absolute top-4 left-4">
            People&apos;s favourite
          </span>
          <h2 className="text-white font-extrabold text-[48px] leading-tight mt-16">
            Image Permissions
          </h2>
          <p className="text-primary font-bold text-xl mt-4">25R$</p>
        </div>

        <div className="col-span-2 bg-card-bg rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-20 h-20 opacity-30">
            <div className="w-full h-full bg-[#3D9C4C] rounded flex items-center justify-center text-white font-bold text-xs">
              BFL
            </div>
          </div>
          <h3 className="text-white font-bold text-2xl mt-16">Blox Football League</h3>
          <p className="text-text-muted text-sm mb-3">By puggooss</p>
          <p className="text-text-muted text-xs leading-relaxed">
            Welcome to the BFL the 1st and biggest football touch league, founded in 2023.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold text-sm tracking-wider mb-6">HUB OVERVIEW</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Connected Account</p>
            <p className="text-white font-extrabold text-[32px]">ABRA</p>
          </div>
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Total Sales</p>
            <p className="text-white font-extrabold text-[32px]">619</p>
          </div>
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Owned Products</p>
            <p className="text-white font-extrabold text-[32px]">4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
