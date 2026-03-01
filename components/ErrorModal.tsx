'use client';

interface ErrorModalProps {
  onClose: () => void;
}

export default function ErrorModal({ onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card-bg rounded-lg p-8 max-w-md w-full mx-4 relative overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor" className="text-white">
            <path d="M50 5L90 30V70L50 95L10 70V30L50 5Z"/>
            <path d="M50 20L80 38V62L50 80L20 62V38L50 20Z"/>
          </svg>
        </div>

        <div className="relative text-center">
          <h2 className="text-white font-extrabold text-5xl italic mb-6">Oops...</h2>
          
          <div className="bg-white/5 rounded-card p-4 mb-6">
            <p className="text-text-muted text-sm">
              It seems that the transaction failed, you can attempt purchasing again.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-card font-bold text-base bg-border text-white hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
