import { cn } from "../../../../utils/cn";
import { timeFormat } from "../../../../utils/timeFormat";
import { getTicketStatusStyles, translateTicketPriority, translateTicketStatus } from "../../utils/ticketUtils";


const TicketDetailHeader = ({ detailState }) => {
	const { ticket } = detailState;

	return (
		<div className="border-2 border-green-300 rounded-2xl p-6 bg-gray-100 shadow-sm">
			<div className="flex justify-between items-start mb-4">
				<div>
					<p className="text-gray-500 text-sm font-bold uppercase mb-1">
						Ticket #{ticket.id}
					</p>
					<h1 className="text-2xl font-bold text-black">{ticket.title}</h1>
				</div>
				<span
					className={cn(
						`py-2 px-4 rounded-xl ${getTicketStatusStyles(ticket.ticketState)}`,
					)}
				>
					{translateTicketStatus(ticket.ticketState)}
				</span>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 border-y border-border py-4">
				<div>
					<p className="text-gray-500">Người tạo</p>
					<p className="font-semibold">{ticket.ticketCreator?.fullName}</p>
				</div>
				<div>
					<p className="text-gray-500">Mức ưu tiên</p>
					<p className="font-semibold">
						{translateTicketPriority(ticket.priority)}
					</p>
				</div>
				<div>
					<p className="text-gray-500">Ngày tạo</p>
					<p className="font-semibold">{timeFormat(ticket.timeCreated)}</p>
				</div>
				<div>
					<p className="text-gray-500">Người xử lý</p>
					<p className="font-semibold">
						{ticket.assignee ? ticket.assignee.fullName : "Chưa có"}
					</p>
				</div>
			</div>

			<div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
				{ticket.detail}
			</div>
		</div>
	);
};

export default TicketDetailHeader;
