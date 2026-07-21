import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { timeFormat } from "../../../utils/timeFormat";
import { IoWarning } from "react-icons/io5";
import {
	getTicketStatusStyles,
	translateTicketStatus,
	getTicketPriorityStyles,
	translateTicketPriority,
} from "../utils/ticketUtils";

export function TicketCard({ ticket, variant = "default" }) {
	return (
		<>
			{variant === "default" && ticket && (
				<Card className="w-full flex flex-col h-full min-h-45 justify-between transition-all duration-200 hover:border-interactive-hover border-2 group cursor-pointer">
					<CardHeader className="pb-0 flex-row items-start justify-between gap-4 border-none">
						<div className="flex flex-col gap-1">
							<div className="flex justify-between">
								<span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
									#{ticket.id}
								</span>
								{/* Ticket's status and priority */}
								<div className="flex gap-2 items-center">
									{ticket.priority && (
										<span
											className={`px-2 py-1 rounded-xl text-[0.7rem] font-bold gap-0.5 flex items-center ${getTicketPriorityStyles(ticket.priority)}`}
											title={translateTicketPriority(ticket.priority)}
										>
											{Array.from({ length: { low: 1, medium: 2, high: 3, critical: 4 }[ticket.priority.toLowerCase()] || 1 }).map((_, i) => (
												<IoWarning key={i} className="text-sm" />
											))}
										</span>
									)}
									<span
										className={`px-2 py-1 rounded-xl text-[0.7rem] font-bold gap-1 ${getTicketStatusStyles(ticket.ticketState)}`}
									>
										{translateTicketStatus(ticket.ticketState)}
									</span>
								</div>
							</div>
							{/* Ticket's title */}
							<CardTitle className="transition-colors truncate">
								{ticket.title}
							</CardTitle>
						</div>
					</CardHeader>

					{/* Ticket's detail */}
					<CardContent className={cn("py-2! w-full")}>
						<p
							className={cn(
								"text-sm text-gray-700 line-clamp-2 leading-relaxed",
							)}
						>
							{ticket.detail}
						</p>
					</CardContent>

					<CardFooter className="pt-0 bg-transparent border-none flex gap-3 items-center justify-between text-gray-600 text-xs">
						<div className="flex items-center gap-2">
							{/* Avatar Placeholder */}
							<div className="w-5 h-5 rounded-full bg-border flex items-center justify-center font-bold text-[10px]">
								{ticket?.ticketCreator?.fullName?.charAt(0)}
							</div>
							{/* Ticket's creator's full name */}
							<span className="font-medium truncate">
								{ticket?.ticketCreator?.fullName}
							</span>
						</div>

						{/* Ticket's creation time */}
						<span className="font-medium truncate">
							{timeFormat(ticket.timeCreated)}
						</span>
					</CardFooter>
				</Card>
			)}

			{variant === "skeleton" && (
				<Card className="w-full flex flex-col justify-content-between transition-all duration-200 group">
					<CardHeader className="pb-0 flex-row items-start justify-between gap-4 border-none">
						<div className="flex flex-col gap-1">
							<div className="flex justify-between">
								<span className="font-semibold tracking-wider text-gray-300 text-base uppercase">
									#
								</span>
								{/* Ticket's status and priority skeleton */}
								<div className="flex gap-2 items-center">
									<span className={`px-2 py-1 rounded-xl text-[0.7rem] gap-1 `}>
										<div className="rounded-full bg-gray-300 w-12 h-5"></div>
									</span>
									<span className={`px-2 py-1 rounded-xl text-[0.7rem] gap-1 `}>
										<div className="rounded-full bg-gray-300 w-15 h-5"></div>
									</span>
								</div>
							</div>
							{/* Ticket's title */}
							<CardTitle className="group-hover:text-interactive transition-colors truncate">
								<div className="rounded-full bg-gray-300 w-[70%] h-8"></div>
							</CardTitle>
						</div>
					</CardHeader>

					{/* Ticket's detail */}
					<CardContent className={cn("py-2! w-full space-y-1 mt-1")}>
						<div className="rounded-full bg-gray-300 w-[50%] h-3"></div>
						<div className="rounded-full bg-gray-300 w-[50%] h-3"></div>
					</CardContent>

					<CardFooter className="pt-0 mt-1 bg-transparent border-none flex gap-3 items-center justify-between text-gray-300">
						<div className="flex items-center gap-2 flex-6">
							{/* Avatar Placeholder */}
							<div className="h-5 rounded-full bg-gray-300 aspect-square"></div>
							{/* Ticket's creator's full name */}
							<div className="rounded-full w-[50%] bg-gray-300 h-2"></div>
						</div>

						{/* Ticket's creation time */}
						<div className="rounded-full bg-gray-300 flex-3 h-2"></div>
					</CardFooter>
				</Card>
			)}
		</>
	);
}
