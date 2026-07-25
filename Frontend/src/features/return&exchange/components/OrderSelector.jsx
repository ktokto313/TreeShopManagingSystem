import { useEffect, useState } from "react";
import { getAvailableOrders } from "../api/returnRequestApi";

export default function OrderSelector({
                                          customerId,
                                          selectedOrder,
                                          setSelectedOrder
                                      }) {

    const [orders, setOrders] = useState([]);

    useEffect(() => {

        if (!customerId) return;

        getAvailableOrders(customerId)
            .then(data => {
                console.log("Orders:", data);
                setOrders(data);
            })
            .catch(error => {
                console.error(error);
                setOrders([]);
            });

    }, [customerId]);


    return (
        <div className="space-y-2">

            <label className="text-sm font-medium text-stone-700">
                Chọn đơn hàng
            </label>

            <select
                value={selectedOrder?.id ?? ""}
                onChange={(e) => {

                    console.log(
                        "Selected ID:",
                        e.target.value
                    );


                    const order = orders.find(
                        o =>
                            String(o.id)
                            ===
                            String(e.target.value)
                    );


                    console.log(
                        "Found order:",
                        order
                    );


                    setSelectedOrder(order);
                }}

                className="
                    w-full rounded-lg border border-stone-300
                    px-3 py-2 text-sm
                "
            >

                <option value="">
                    -- Chọn đơn hàng --
                </option>


                {orders.map(order => (

                    <option
                        key={order.id}
                        value={order.id}
                    >
                        Đơn hàng #{order.id}
                    </option>

                ))}

            </select>

        </div>
    );
}