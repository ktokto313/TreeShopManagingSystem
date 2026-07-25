import { useEffect, useState } from "react";
import { getAvailableProducts } from "../api/returnRequestApi";

export default function ExchangeProductSelector({
                                                    product,
                                                    setProduct
                                                }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getAvailableProducts()
            .then(setProducts)
            .catch(() => setProducts([]));
    }, []);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
                Chọn sản phẩm đổi
            </label>

            <select
                value={product || ""}
                onChange={(e) => setProduct(e.target.value)}
                className="
                    w-full rounded-lg border border-stone-300
                    px-3 py-2 text-sm
                    focus:outline-none focus:ring-2
                    focus:ring-green-500
                "
            >
                <option value="">
                    Chọn sản phẩm
                </option>

                {products.map((p) => (
                    <option
                        key={p.id}
                        value={p.id}
                    >
                        {p.name}
                    </option>
                ))}
            </select>
        </div>
    );
}