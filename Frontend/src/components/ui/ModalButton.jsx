import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { cn } from "../../utils/cn";
import { IoWarningOutline } from "react-icons/io5";

const ModalButton = ({
	isLoading,
	buttonClasses,
	modalClasses,
	modalTitle,
	buttonLabel,
	children,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formError, setFormError] = useState(null);

	const handleClose = () => {
		if (isLoading) return;
		setIsModalOpen(false);
		setFormError(null);
	};

	return (
		<>
			<Button
				className={cn(buttonClasses)}
				onClick={() => setIsModalOpen(true)}
			>
				{buttonLabel}
			</Button>
			<Modal
				className={cn(modalClasses)}
				title={modalTitle}
				isOpen={isModalOpen}
				onClose={handleClose}
			>
				{formError && (
					<div
						className={cn(
							"flex -mt-5 mb-4 items-center gap-2 py-2 px-3 border-amber-400 border rounded-2xl text-text-warning bg-bg-warning",
						)}
					>
						<IoWarningOutline className="-mb-0.5"></IoWarningOutline>
						{formError}
					</div>
				)}

				{/* Enables children to be able to close the parent */}
				{typeof children === "function"
					? children({ close: handleClose })
					: children}
			</Modal>
		</>
	);
};

export default ModalButton;
