import { useEffect, useState } from "react";
import { getOrderItems } from "../api/returnRequestApi";

export default function ReturnItemSelector({
                                               order,
                                               selectedItems,
                                               setSelectedItems
                                           }) {

    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!order) {
            setItems([]);
            return;
        }

        getOrderItems(order.id)
            .then(setItems)
            .catch(() => setItems([]));

    }, [order]);

    function toggleItem(item) {

        const productId = String(item.id.productId);

        const exists = selectedItems.find(
            x => x.orderDetailId === productId
        );

        if (exists) {

            setSelectedItems(
                selectedItems.filter(
                    x => x.orderDetailId !== productId
                )
            );

        } else {

            setSelectedItems([
                ...selectedItems,
                {
                    orderDetailId: productId,
                    quantity: 1
                }
            ]);
        }
    }

    function updateQuantity(productId, quantity) {

        setSelectedItems(
            selectedItems.map(item =>
                item.orderDetailId === productId
                    ? {
                        ...item,
                        quantity: Number(quantity)
                    }
                    : item
            )
        );
    }
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700">
                Chọn sản phẩm trả
            </label>

            {
                items.map(item => {

                    const productId =
                        String(item.id.productId);

                    const selected =
                        selectedItems.find(
                            x => x.orderDetailId === productId
                        );
                    return (
                        <div
                            key={productId}
                            className="flex items-center gap-3 border rounded-lg p-3"
                        >
                            <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() =>
                                    toggleItem(item)
                                }
                            />
                            <span className="flex-1">
                                {item.product.name}
                            </span>

                            {
                                selected && (
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.quantity}
                                        value={selected.quantity}
                                        onChange={(e) =>
                                            updateQuantity(
                                                productId,
                                                e.target.value
                                            )
                                        }
                                        className="w-20 border rounded px-2 py-1"
                                    />
                                )
                            }

                        </div>
                    );
                })
            }
        </div>
    );
}