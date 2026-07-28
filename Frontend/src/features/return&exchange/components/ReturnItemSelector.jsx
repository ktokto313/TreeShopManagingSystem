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

    function getProductId(item) {

        return String(
            item.id?.productId ??
            item.product?.id
        );
    }

    function toggleItem(item) {

        const productId = getProductId(item);


        const exists =
            selectedItems.find(
                x => x.productId === productId
            );

        if (exists) {

            setSelectedItems(
                selectedItems.filter(
                    x => x.productId !== productId
                )
            );

            return;
        }

        setSelectedItems([
            ...selectedItems,
            {
                productId,
                quantity: 1,
                maxQuantity: item.quantity
            }
        ]);
    }

    function updateQuantity(productId, quantity) {

        setSelectedItems(
            selectedItems.map(item => {

                if (item.productId !== productId) {
                    return item;
                }

                let value =
                    Number(quantity);

                if (value < 1) {
                    value = 1;
                }

                if (value > item.maxQuantity) {
                    value = item.maxQuantity;
                }

                return {
                    ...item,
                    quantity: value
                };

            })
        );
    }
    return (
        <div className="space-y-3">

            <label className="
                text-sm font-medium text-stone-700
            ">
                Chọn sản phẩm trả
            </label>
            {
                items.map(item => {

                    const productId =
                        getProductId(item);
                    const selected =
                        selectedItems.find(
                            x => x.productId === productId
                        );
                    return (
                        <div
                            key={productId}
                            className="
                                flex items-center gap-3
                                border rounded-lg p-3
                            "
                        >
                            <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() =>
                                    toggleItem(item)
                                }
                            />
                            <div className="flex-1">

                                <div>
                                    {item.product?.name}
                                </div>
                                <div className="
                                    text-sm text-stone-500
                                ">
                                    Số lượng trong đơn:
                                    {" "}
                                    {item.quantity}
                                </div>

                            </div>

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
                                        className="
                                            w-20 border rounded
                                            px-2 py-1
                                        "
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