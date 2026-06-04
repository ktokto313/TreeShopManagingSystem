import { useEffect, useState } from "react";
import { Select } from "../../components/ui/Select";
import { cn } from "../../utils/cn";
import { TicketCard } from "./TicketCard";
import { Button } from "../../components/ui/Button";
import styles from "./TicketDashboard.module.css";
import useFetchAllTickets from "./hooks/useFetchAllTickets";
import useAuthUser from "../../hooks/useAuthUser";
import { Container } from "../../components/global/Container";
import { Skeleton } from "../../components/ui/Skeleton";
import { FaFilter } from "react-icons/fa";
import { getSelectOption, ticketSelectList } from "./data/ticketSelectList";
import ModalButton from "../../components/ui/ModalButton";
import { Form } from "../../components/ui/Form";
import { Input } from "../../components/ui/Input";
import useCreateTicket from "./hooks/useCreateTicket";
import { TbReload } from "react-icons/tb";
import { LuTicketCheck } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";
import useFilterAndSortTickets from "./hooks/useFilterAndSortTickets";
import { IoWarningOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

const TicketDashboard = ({ className }) => {
	const { isLoading, fetchedTickets, executeFetchAllTickets } =
		useFetchAllTickets();
	const { executeAuth } = useAuthUser();

	const {
		isCreateTicketLoading,
		localValidation,
		isCreateTicketSuccess,
		handleCreateTicketSubmit,
	} = useCreateTicket();

	const {
		ticketState,
		ticketPriority,
		ticketSort,
		handleFilterChange,
		getFilterValue,
	} = useFilterAndSortTickets();

	useEffect(() => {
		if (isSelectAutoFilterSort) {
			executeFetchAllTickets(ticketState, ticketPriority, ticketSort);
		}
	}, [ticketState, ticketPriority, ticketSort]);

	const [isSelectAutoFilterSort, setIsSelectAutoFilterSort] = useState(true);

	return (
		<div>
			<Container className={cn("container flex mt-5 gap-2")}>
				<Button onClick={() => executeAuth()}>Login</Button>
			</Container>

			<div
				className={cn(
					"border-2 border-border mx-auto w-full rounded-2xl mt-5 min-h-180",
					className,
					styles.dashboard,
				)}
			>
				{/* Dashboard Navbar */}
				<div
					className={cn(
						"flex rounded-xl mb-5 bg-green-600 px-5 py-3",
						styles.ticketNavbar,
					)}
				>
					<div
						className={cn(
							"flex-1 gap-2 flex flex-row items-center text-white",
							styles.ticketSelectLeft,
						)}
					>
						<LuTicketCheck className="text-3xl"></LuTicketCheck>
						<h1 className="text-nowrap">Các Ticket Khiếu Nại</h1>
					</div>

					{/* Ticket select expand modal button */}
					<ModalButton
						modalTitle={"Lọc Ticket"}
						buttonClasses={cn(
							"cursor-pointer hover:bg-green-400 py-4 px-4.5",
							styles.ticketSelectToggle,
						)}
						buttonLabel={<FaFilter className={"text-base"} />}
					>
						{/* Enables children to be able to close the parent */}
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
											{
												/* enables auto filter and sort again  */
											}
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

					{/* Normal select list */}
					<div
						className={cn(
							"flex-4 flex flex-row justify-end gap-1",
							styles.ticketSelectList,
						)}
					>
						{ticketSelectList.map((select, index) => {
							return (
								<Select
									value={getFilterValue(select.ticketParam)}
									label={select.label}
									className={cn(
										"w-32 relative",
										"[&_label]:absolute [&_label]:top-1 [&_label]:left-3 [&_label]:text-[10px]",
										"[&_label]:text-green-200 [&_label]:font-bold [&_label]:uppercase [&_label]:z-10",
										"[&_label]:pointer-events-none",
										"[&_select]:pt-5 [&_select]:pb-1 [&_select]:bg-green-700 [&_select]:text-white [&_select]:border-green-500",
										"[&_option]:bg-white [&_option]:text-black",
										"cursor-pointer",
									)}
									key={`select-${select.label}-${index}`}
									options={select.options}
									// Changes filters and sorts when select changes
									onChange={(e) =>
										handleFilterChange(select.ticketParam, e.target.value)
									}
								></Select>
							);
						})}

						{/* Reload Button */}
						<Button
							className="ml-2 mr-2 w-13 h-full cursor-pointer hover:bg-green-400"
							onClick={() =>
								executeFetchAllTickets(ticketState, ticketPriority, ticketSort)
							}
						>
							<TbReload className="text-xl"></TbReload>
						</Button>

						{/* Ticket Creation Button */}
						<ModalButton
							buttonLabel={
								<div className={cn("flex flex-row items-center gap-2")}>
									<FaPlus></FaPlus>
									<p className={cn(styles.createTicketBtnContent)}>
										Tạo Ticket
									</p>
								</div>
							}
							modalTitle="Tạo Ticket"
							isLoading={isCreateTicketLoading}
							buttonClasses={cn(
								"w-30 cursor-pointer hover:bg-green-400",
								styles.createTicketBtn,
							)}
						>
							<Form
								onSubmit={(e) => {
									handleCreateTicketSubmit(e);
								}}
							>
								{isCreateTicketSuccess && (
									<span className="flex items-center gap-2 py-2 px-4 rounded-xl bg-bg-success text-white">
										<FaCheck className="text-xl" />
										<p>Ticket đã được khởi tạo xong!</p>
									</span>
								)}

								{localValidation && (
									<span className="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-600 text-white">
										<IoWarningOutline className="text-xl" />
										{localValidation}
									</span>
								)}

								<Input label="Tiêu đề" type="text" name="title"></Input>
								<Input label="Chi tiết" type="text" name="detail"></Input>
								<Select
									name="priority"
									label="Ưu tiên"
									options={getSelectOption("priority")}
								></Select>

								<Button type="submit" disabled={isCreateTicketLoading && true}>
									{isCreateTicketLoading ? <p>Đang Xử Lí...</p> : <p>Lưu</p>}
								</Button>
							</Form>
						</ModalButton>
					</div>
				</div>

				{/* Dashboard Body */}
				<div
					className={cn(
						"px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
					)}
				>
					{!isLoading &&
						fetchedTickets.map((t, index) => (
							<TicketCard
								className={cn("cursor-pointer")}
								key={`ticketCard-${t.id}-${index}`}
								ticket={t}
							/>
						))}
					{isLoading &&
						Array.from({ length: 12 }).map((_, index) => (
							<Skeleton className="rounded-xl" key={`skeleton-${index}`}>
								<TicketCard variant="skeleton" />
							</Skeleton>
						))}
				</div>
			</div>
		</div>
	);
};

export default TicketDashboard;
