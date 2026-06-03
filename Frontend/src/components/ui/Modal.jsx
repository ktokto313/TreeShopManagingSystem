import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  // Prevent scrolling on the background page when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // The dark background overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      
      {/* Modal box */}
      <div 
        className="bg-bg-surface w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden flex flex-col"
        role="dialog" 
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-black">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-black opacity-50 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-border"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}