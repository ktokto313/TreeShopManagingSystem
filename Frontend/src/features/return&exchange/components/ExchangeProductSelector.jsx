import { useEffect, useState } from "react";
import { getAvailableProducts } from "../api/returnRequestApi";

export default function ExchangeProductSelector({
                                                    products,
                                                    setProducts
                                                }) {

    const [availableProducts, setAvailableProducts] = useState([]);


    useEffect(() => {
        getAvailableProducts()
            .then(setAvailableProducts)
            .catch(() =>
                setAvailableProducts([])
            );

    }, []);

    function addProduct() {

        setProducts([
            ...products,
            {
                productId:
                    availableProducts.length > 0
                        ? String(availableProducts[0].id)
                        : "",
                quantity: 1
            }
        ]);

    }

    function removeProduct(index) {

        setProducts(
            products.filter(
                (_, i) => i !== index
            )
        );

    }

    function updateProduct(
        index,
        field,
        value
    ) {

        setProducts(
            products.map(
                (item, i) => {

                    if (i !== index) {
                        return item;
                    }

                    return {
                        ...item,
                        [field]:
                            field === "quantity"
                                ? Number(value)
                                : value
                    };

                }
            )
        );

    }

    return (

        <div className="
            space-y-4
        ">

            <label className="
                text-sm font-medium text-stone-700
            ">
                Chọn sản phẩm đổi
            </label>

            {
                products.map(
                    (item, index) => (

                        <div
                            key={index}
                            className="
                                flex items-center
                                gap-3
                                border rounded-lg
                                p-3
                            "
                        >

                            <select

                                value={item.productId}

                                onChange={(e) =>
                                    updateProduct(
                                        index,
                                        "productId",
                                        e.target.value
                                    )
                                }

                                className="
                                    flex-1
                                    border rounded-lg
                                    px-3 py-2
                                "
                            >
                                <option value="">
                                    Chọn sản phẩm
                                </option>


                                {
                                    availableProducts.map(
                                        product => (

                                            <option
                                                key={product.id}
                                                value={String(product.id)}
                                            >
                                                {
                                                    product.name
                                                }
                                            </option>

                                        )
                                    )
                                }

                            </select>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                    updateProduct(
                                        index,
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-20
                                    border rounded-lg
                                    px-2 py-2
                                "
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    removeProduct(index)
                                }
                                className="
                                    text-red-500
                                    hover:text-red-700
                                "
                            >
                                Xóa
                            </button>

                        </div>

                    )
                )
            }
            <div className="pt-2">

                <button
                    type="button"
                    onClick={addProduct}
                    className="
                        px-4 py-2
                        rounded-lg
                        bg-green-500
                        text-white
                        hover:bg-green-600
                        transition
                    "
                >
                    + Thêm sản phẩm đổi
                </button>

            </div>
        </div>
    );
}