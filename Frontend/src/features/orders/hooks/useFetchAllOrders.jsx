export default useFetchAllOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('ALL');

    //TODO add ticket type to fetchOrders
    const fetchOrders = async () => {
        const response = await fetch("/api/orders", {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
        });

        if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("UNAUTHORIZED");
        }
        throw new Error(`Failed to fetch orders (Status: ${response.status})`);
        }

        const data = await response.json();
        setOrders(data);
    };

    return {
        orders,
        
        fetchOrders
    }
}