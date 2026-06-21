import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { IoClose } from "react-icons/io5";

export function Modal({ isOpen, onClose, title, children, className }) {
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
    <div onClick={onClose} className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm", className)}>
      
      {/* Modal box */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-surface w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden flex flex-col overflow-y-scroll min-h-30 max-h-[80vh] min-w-[40vw]"
        role="dialog" 
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="justify-between sticky flex items-center py-7 px-8 border-b bg-green-500 border-border top-0 z-61">
          <h2 className="text-xl font-semibold text-white relative">
            {title}
          </h2>

          {/* Close button */}
          <button 
            onClick={onClose}
            className="text-white text-4xl hover:opacity-100 transition-opacity p-1 cursor-pointer rounded-md hover:bg-white/20"
            aria-label="Close"
          >
            <IoClose></IoClose>
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