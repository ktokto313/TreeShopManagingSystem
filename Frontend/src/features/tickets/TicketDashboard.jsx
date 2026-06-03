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
import { Modal } from "../../components/ui/Modal";
import { ticketSelectList } from "./data/ticketSelectList";

const TicketDashboard = ({ className }) => {
	const { isLoading, error, fetchedTickets, executeFetchAllTickets } =
		useFetchAllTickets();
	const { executeAuth } = useAuthUser();

	const [ticketState, setTicketState] = useState("");
	const [ticketPriority, setTicketPriority] = useState("");
	const [ticketSort, setTicketSort] = useState("");

	const handleFilterChange = (ticketParam, value) => {
		if (ticketParam === "status") setTicketState(value);
		if (ticketParam === "priority") setTicketPriority(value);
		if (ticketParam === "sort") setTicketSort(value);
	};

	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

	useEffect(() => {
		executeFetchAllTickets(ticketState, ticketPriority, ticketSort);
	}, [ticketState, ticketPriority, ticketSort]);

	return (
		<>
			<Container className="container flex mt-5 gap-2">
				<Button onClick={() => executeAuth()}>Click Me To Login</Button>
			</Container>

			<div
				className={cn(
					"border-3 border-border rounded-2xl p-4 mx-5 mt-5 min-h-[85vh]",
					className,
				)}
			>
				<div
					className={cn(
						"flex rounded-xl w-full mb-5 bg-green-600 px-5 py-3",
						styles.ticketNavbar,
					)}
				>
					<div
						className={cn(
							"flex-1 flex items-center text-white",
							styles.ticketSelectLeft,
						)}
					>
						Các Ticket Khiếu Nại
					</div>

					{/* Ticket select expand button */}
					<Button
						onClick={() => setIsFilterModalOpen(true)}
						className={cn(
							"cursor-pointer hover:bg-green-400",
							styles.ticketSelectToggle,
						)}
					>
						<FaFilter />
					</Button>

					{/* Modal of ticket sorts and filters when clicking the expand button */}
					<Modal
						isOpen={isFilterModalOpen}
						onClose={() => setIsFilterModalOpen(false)}
						title="Filter & Sort Tickets"
					>
						<div className="flex flex-col gap-4">
							{ticketSelectList.map((select, index) => (
								<Select
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

									// Changes filters and sorts when select changes
									onChange={(e) =>
										handleFilterChange(select.ticketParam, e.target.value)
									}
								/>
							))}
						</div>

						{/* Close button (Apply Filters) */}
						<div className="mt-6 flex justify-end">
							<Button onClick={() => setIsFilterModalOpen(false)}>
								Apply Filters
							</Button>
						</div>
					</Modal>

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
									label={select.label}
									className={cn(
										"w-32 relative",
										"[&_label]:absolute [&_label]:top-1 [&_label]:left-3 [&_label]:text-[10px]",
										"[&_label]:text-green-200 [&_label]:font-bold [&_label]:uppercase [&_label]:z-10",
										"[&_label]:pointer-events-none",
										"[&_select]:pt-5 [&_select]:pb-1 [&_select]:bg-green-700 [&_select]:text-white [&_select]:border-green-500",
										"[&_option]:bg-white [&_option]:text-black",
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
					</div>
				</div>

				<div
					className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4")}
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
						Array.from({ length: 6 }).map((_, index) => (
							<Skeleton key={`skeleton-${index}`}>
								<TicketCard variant="skeleton" />
							</Skeleton>
						))}
				</div>
			</div>
		</>
	);
};

export default TicketDashboard;
