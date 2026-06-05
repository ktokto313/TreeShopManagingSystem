export const createTicket = async (ticketData) => {
    const url = `/api/tickets`; 

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
        },
        body: JSON.stringify(ticketData), 
        credentials: "include",
    });

    if(!response.ok) throw new Error("Error when creating a ticket");
    return response.json();
};