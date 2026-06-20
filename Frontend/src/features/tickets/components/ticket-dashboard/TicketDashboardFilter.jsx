import { cn } from "../../../utils/cn";
import styles from "../assets/styles/TicketDashboardFilter.module.css";
import { getSelectOption, ticketSelectList } from "../data/ticketSelectList";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import ModalButton from "../../../components/ui/ModalButton";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { FaFilter, FaPlus, FaCheck } from "react-icons/fa";
import { TbFilterSpark } from "react-icons/tb";
import { IoReload } from "react-icons/io5";
import { MdBlock } from "react-icons/md";

export const TicketDashboardFilterBoard = ({ dashboardState, classNames }) => {
	const {
		isFetchAllTicketsLoading,
		getFilterValue,
		handleFilterChange,
		executeFetchAllTickets,
		ticketState,
		ticketPriority,
		ticketSort,
		isAgent,
		isCreateTicketLoading,
		isCreateTicketSuccess,
		handleCreateTicketSubmit,
		localValidationError,
		ticketCreateError,
	} = dashboardState;

	return (
		<div
			className={cn(
				"flex flex-col justify-start gap-4 bg-white border-2 border-border rounded-2xl h-fit sticky top-0",
				styles.ticketSelectList,
				classNames,
			)}
		>
			<div
				className={cn(
					`flex gap-2 items-center mb-1 py-6 px-4 w-full rounded-2xl bg-green-600 text-white font-semibold`,
					styles.ticketFilterHeader,
				)}
			>
				<TbFilterSpark className="text-2xl"></TbFilterSpark>
				<h1 className="text-lg">Bộ Lọc</h1>
			</div>

			<div className={"px-4 pb-6 space-y-3"}>
				{ticketSelectList.map((select, index) => {
					return (
						<Select
							value={getFilterValue(select.ticketParam)}
							label={select.label}
							className={cn(
								"w-full relative",
								"[&_label]:absolute [&_label]:top-1 [&_label]:left-3 [&_label]:text-[0.625rem]",
								"[&_label]:text-green-500 [&_label]:font-bold [&_label]:uppercase [&_label]:z-10",
								"[&_label]:pointer-events-none",
								"[&_select]:pt-5 [&_select]:pb-1 [&_select]:text-green-700 [&_select]:border-green-500",
								"[&_option]:bg-white [&_option]:text-black",
								"cursor-pointer",
							)}
							key={`select-${select.label}-${index}`}
							options={select.options}
							onChange={(e) =>
								handleFilterChange(select.ticketParam, e.target.value)
							}
						></Select>
					);
				})}

				{/* Reload Button */}
				<Button
					className="hover:bg-green-400 w-full"
					onClick={() => {
						executeFetchAllTickets(ticketState, ticketPriority, ticketSort);
					}}
				>
					<div
						className={cn("flex flex-row items-center justify-center gap-2")}
					>
						<IoReload
							className={cn("text-xl", { "animate-spin": isFetchAllTicketsLoading })}
						></IoReload>
						<p className={cn(styles.reloadTicketBtnContent)}>Tải Lại</p>
					</div>
				</Button>

				{/* Create Ticket Button */}
				{!isAgent && (
					<ModalButton
						buttonLabel={
							<div
								className={cn(
									"flex flex-row items-center justify-center gap-2",
								)}
							>
								<FaPlus></FaPlus>
								<p className={cn(styles.createTicketBtnContent), "text-nowrap"}>Tạo Ticket</p>
							</div>
						}
						modalTitle="Tạo Ticket"
						isLoading={isCreateTicketLoading}
						buttonClasses={cn(
							"w-full cursor-pointer hover:bg-green-400",
							styles.createTicketBtn,
						)}
					>
						{({close}) => (

						<Form
							onSubmit={async (e) => {
								const isSuccess = await handleCreateTicketSubmit(e);

								if (isSuccess) {
									close();
								}
							}}
						>
							{isCreateTicketSuccess && (
								<span className="flex items-center gap-2 py-2 px-4 rounded-xl bg-bg-success text-white">
									<FaCheck className="text-xl" />
									<p>Ticket đã được khởi tạo xong!</p>
								</span>
							)}

							{localValidationError && (
								<span className="flex gap-2 py-2 px-4 rounded-xl bg-red-500 text-white">
									<MdBlock className="text-2xl" />
									<p>{localValidationError}</p>
								</span>
							)}

							{ticketCreateError && (
								<span className="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-500 text-white">
									<MdBlock className="text-xl" />
									<p>Lỗi khi khởi tạo Ticket, vui lòng thử lại sau.</p>
								</span>
							)}

							<Input label="Tiêu đề" type="text" name="title"></Input>
							<Input label="Chi tiết" type="text" name="detail"></Input>
							<Select
								name="priority"
								label="Ưu tiên"
								options={getSelectOption("priority")}
							></Select>

							<Button type="submit" disabled={isCreateTicketLoading}>
								{isCreateTicketLoading ? <p>Đang Xử Lí...</p> : <p>Lưu</p>}
							</Button>
						</Form>
						)}
					</ModalButton>
				)}
			</div>
		</div>
	);
};

export const TicketDashboardFilterBtn = ({ dashboardState, modalButtonClasses, reloadButtonClasses, reloadButtonContentClasses }) => {
	const {
		isFetchAllTicketsLoading,
		getFilterValue,
		handleFilterChange,
		executeFetchAllTickets,
		ticketState,
		ticketPriority,
		ticketSort,
		setIsSelectAutoFilterSort,
	} = dashboardState;

	return (
		<>
			<ModalButton
				modalTitle={"Lọc Ticket"}
				buttonClasses={cn(
					"flex cursor-pointer hover:bg-green-400",
					styles.ticketSelectToggle,
					modalButtonClasses,
				)}
				buttonLabel={<FaFilter className={"text-base"} />}
			>
				{({ close }) => (
					<>
						<div className="flex flex-col gap-4">
							{ticketSelectList.map((select, index) => (
								<Select
									value={getFilterValue(select.ticketParam)}
									label={select.label}
									className={cn(
										"w-full relative",
										"[&_label]:absolute [&_label]:top-1 [&_label]:left-3 [&_label]:text-[10px]",
										"[&_label]:text-green-200 [&_label]:font-bold [&_label]:uppercase [&_label]:z-10",
										"[&_label]:pointer-events-none",
										"[&_select]:pt-5 [&_select]:pb-1 [&_select]:bg-green-700 [&_select]:text-white [&_select]:border-green-500",
										"[&_option]:bg-white [&_option]:text-black",
									)}
									key={`select-${select.label}-${index}`}
									options={select.options}
									onChange={(e) => {
										handleFilterChange(select.ticketParam, e.target.value);
										setIsSelectAutoFilterSort(false); // disables auto filter and sort
									}}
								/>
							))}
						</div>
						{/* Close button (Apply Filters) */}
						<div className="mt-6 flex justify-end">
							<Button
								onClick={() => {
									executeFetchAllTickets(
										ticketState,
										ticketPriority,
										ticketSort,
									);
									setIsSelectAutoFilterSort(true);
									close(); // Closes the parent
								}}
							>
								Lưu
							</Button>
						</div>
					</>
				)}
			</ModalButton>
			<Button
				className={cn("hover:bg-green-600! w-full"), reloadButtonClasses}
				onClick={() => {
					executeFetchAllTickets(ticketState, ticketPriority, ticketSort);
				}}
			>
				<div className={cn("flex flex-row items-center justify-center gap-2"), reloadButtonContentClasses}>
					<IoReload
						className={cn("text-xl", { "animate-spin": isFetchAllTicketsLoading })}
					></IoReload>
				</div>
			</Button>
		</>
	);
};
