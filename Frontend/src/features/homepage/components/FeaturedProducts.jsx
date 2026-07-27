import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { useHomepageProducts } from '../hooks/useHomepageProducts';
import { useScrollReveal } from '../hooks/useScrollReveal';
import CatalogProductCard from '../../catalog/components/CatalogProductCard';
import { AuthContext } from '../../../context/AuthContext';
import { addCartItem } from '../../cart/cartApi';
import { addWishlistProduct, getWishlistProducts } from '../../wishlist/wishlistApi';

export default function FeaturedProducts() {
    const { products, loading, error, title } = useHomepageProducts();
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    const [addingProductId, setAddingProductId] = useState(null);
    const [notice, setNotice] = useState('');
    const [wishlistIds, setWishlistIds] = useState(new Set());

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlistIds(new Set());
            return;
        }

        let isMounted = true;
        getWishlistProducts()
            .then((list) => {
                if (isMounted && Array.isArray(list)) {
                    setWishlistIds(new Set(list.map((item) => item.id || item.productId)));
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const handleOpen = (product) => {
        navigate(`/catalog/${product.id || product.productId}`);
    };

    const handleAddToCart = async (product) => {
        const prodId = product.id || product.productId;
        if (!prodId) return;

        if (product.stock !== undefined && Number(product.stock) <= 0) {
            setNotice(`${product.name} hiện đang hết hàng.`);
            return;
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/' } } });
            return;
        }

        setAddingProductId(prodId);
        setNotice('');

        try {
            await addCartItem(Number(prodId), 1);
            window.dispatchEvent(new Event('cart-updated'));
            setNotice(`${product.name} đã được thêm vào giỏ hàng.`);
        } catch (err) {
            if (err?.status === 401) {
                logout?.();
                navigate('/login', { state: { from: { pathname: '/' } } });
                return;
            }
            setNotice(err.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        } finally {
            setAddingProductId(null);
        }
    };

    const handleWishlistAction = async (product) => {
        const prodId = product.id || product.productId;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/catalog/${prodId}` } } });
            return;
        }

        if (wishlistIds.has(prodId)) {
            navigate('/wishlist');
            return;
        }

        setNotice('');
        try {
            await addWishlistProduct(prodId);
            setWishlistIds((current) => new Set([...current, prodId]));
            setNotice(`${product.name} đã được thêm vào danh sách yêu thích.`);
        } catch (err) {
            if (err?.status === 401) {
                logout?.();
                navigate('/login', { state: { from: { pathname: '/' } } });
                return;
            }
            setNotice(err.message || 'Không thể thêm vào yêu thích.');
        }
    };

    return (
        <section className="mt-15 py-15 bg-green-400/70" ref={ref}>
            <Container>
                <div 
                    className={`text-center max-w-2xl mx-auto mb-12 bg-green-500 py-5 rounded-xl transition-all duration-700 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                >
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                </div>

                {notice && (
                    <div className="mb-6 max-w-2xl mx-auto rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900 shadow-xs">
                        {notice}
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-96 bg-stone-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-2xl">
                        {error}
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {products.map((product, idx) => {
                            const productId = product.id || product.productId;
                            return (
                                <div 
                                    key={productId || idx}
                                    className={`transition-all duration-700 transform ${
                                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                                    }`}
                                    style={{ transitionDelay: `${idx * 150}ms` }}
                                >
                                    <CatalogProductCard 
                                        product={product} 
                                        onOpen={handleOpen} 
                                        categoryName={product.categoryName}
                                        onAdd={handleAddToCart}
                                        onWishlist={handleWishlistAction}
                                        isAdding={addingProductId === productId}
                                        isWishlisted={wishlistIds.has(productId)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </Container>
        </section>
    );
}

