import { useEffect } from 'react';
import { FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import { Button } from './ui/Button';

const slideUpAnimation = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function ToastNotification({
	message,
	actionText = "Xem giỏ hàng",
	actionOnClick,
	onClose,
	showCartIcon = true,
	autoCloseDelay = 4000,
}) {
	useEffect(() => {
		if (autoCloseDelay > 0) {
			const timer = setTimeout(() => {
				onClose?.();
			}, autoCloseDelay);
			return () => clearTimeout(timer);
		}
	}, [autoCloseDelay, onClose]);

	return (
		<>
			<style>{slideUpAnimation}</style>
			<div
				className="fixed bottom-6 right-6 z-50"
				style={{ animation: 'slideUp 0.3s ease-out' }}
			>
				<div className="flex items-center gap-3 rounded-2xl border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 shadow-xl shadow-green-900/15">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
						{showCartIcon ? <FaShoppingCart /> : <FaCheckCircle />}
					</div>
					<p className="pr-2 text-sm font-medium text-green-900">{message}</p>
					{actionOnClick && (
						<Button
							variant="primary"
							className="shrink-0 rounded-full bg-green-600 px-4 py-2 text-sm hover:bg-green-700"
							onClick={actionOnClick}
						>
							{actionText}
						</Button>
					)}
					<button
						type="button"
						onClick={onClose}
						className="ml-1 text-green-600 transition hover:text-green-800"
						aria-label="Đóng"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		</>
	);
}
