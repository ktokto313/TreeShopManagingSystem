import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '../../components/ui/Card'; // Adjust path based on your folder structure

export function TicketCard({ ticket }) {
  // A helper function to map the ticket status to your semantic tokens
  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-bg-warning text-text-warning';
      case 'urgent':
        return 'bg-bg-error text-text-error';
      case 'resolved':
        return 'bg-bg-success text-text-success';
      default:
        return 'bg-bg-surface border border-border text-black';
    }
  };

  return (
    <Card 
      className="w-full transition-all duration-200 hover:border-interactive hover:shadow-md group cursor-pointer"
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4 border-none">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wider text-black opacity-50 uppercase">
            Ticket #{ticket.id}
          </span>
          <CardTitle className="group-hover:text-interactive transition-colors">
            {ticket.title}
          </CardTitle>
        </div>
        
        {/* Status Badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyles(ticket.status)}`}>
          {ticket.status}
        </span>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-black opacity-80 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      </CardContent>

      <CardFooter className="pt-2 bg-transparent border-none flex items-center justify-between opacity-70 text-xs text-black">
        <div className="flex items-center gap-2">
          {/* Avatar Placeholder */}
          <div className="w-5 h-5 rounded-full bg-border flex items-center justify-center font-bold text-[10px]">
            {ticket.customerName.charAt(0)}
          </div>
          <span className="font-medium">{ticket.customerName}</span>
        </div>
        <span>{ticket.timeAgo}</span>
      </CardFooter>
    </Card>
  );
}