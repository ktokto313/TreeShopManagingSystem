import { Button } from "./components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/Card";
import { Form } from "./components/ui/Form";
import { Input } from "./components/ui/Input";
import { TicketCard } from "./features/tickets/TicketCard";

const App = () => {
	const singleTicket = {
		id: "TK-8092",
		title: "Cannot access the billing dashboard",
		status: "urgent",
		description:
			"Hello, I tried to update my credit card information this morning but the billing page keeps throwing a 500 Internal Server Error. I need this fixed before my subscription pauses.",
		customerName: "Eleanor Shellstrop",
		timeAgo: "15 mins ago",
	};

	return (
		<div>
			<Button>Hello</Button>


			<Form>
				<Input type="text"></Input>
			</Form>

      {/* TicketCard Example */}
			<TicketCard ticket={singleTicket}></TicketCard>

      {/* Normal Card Example */}
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>Standard Card Title</CardTitle>
				</CardHeader>

				<CardContent>
					<p className="text-sm text-black opacity-80">
						This is a normal card. You can drop text, images, or even entire
						forms inside this content block. It will expand to fit whatever you
						put in here.
					</p>
				</CardContent>

				<CardFooter className="justify-end gap-3 border-t border-border mt-4 pt-4">
					<Button variant="secondary">Cancel</Button>
					<Button variant="primary">Confirm</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default App;
