import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { useHomepageProducts } from '../hooks/useHomepageProducts';
import { useScrollReveal } from '../hooks/useScrollReveal';
import CatalogProductCard from '../../catalog/components/CatalogProductCard';

export default function FeaturedProducts() {
    const { products, loading, error, title } = useHomepageProducts();
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const navigate = useNavigate();

    const handleOpen = (product) => {
        navigate(`/catalog/${product.id || product.productId}`);
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
                        {products.map((product, idx) => (
                            <div 
                                key={product.id || product.productId || idx}
                                className={`transition-all duration-700 transform ${
                                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                                }`}
                                style={{ transitionDelay: `${idx * 150}ms` }}
                            >
                                <CatalogProductCard 
                                    product={product} 
                                    onOpen={handleOpen} 
                                    categoryName={product.category?.name}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}
