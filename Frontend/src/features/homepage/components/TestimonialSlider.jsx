import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Container } from '../../../components/global/Container';
import { useHomepageTestimonials } from '../hooks/useHomepageTestimonials';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { requestJson } from '../../../utils/api';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function TestimonialSlider() {
    const { user } = useContext(AuthContext);
    const role = user?.roleName ?? user?.role;
    const isManager = role === 'MANAGER' || role === 'SYSTEM_ADMIN';
    
    const { testimonials, loading, reload } = useHomepageTestimonials();
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleToggleCurate = async (reviewId) => {
        if (!isManager) return;
        try {
            await requestJson(`/api/orders/reviews/${reviewId}/curate`, { method: 'PUT' });
            reload();
        } catch (error) {
            console.error('Failed to toggle curate status', error);
        }
    };

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, [testimonials.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Auto-advance
    useEffect(() => {
        if (testimonials.length === 0) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [testimonials.length, nextSlide]);

    if (!loading && !isManager && testimonials.length < 5) {
        return null;
    }   

    return (
        <section className="py-20 overflow-hidden bg-green-200/80" ref={ref}>
            <Container>
                {loading ? (
                    <div className="h-64 bg-green-50/50 animate-pulse rounded-xl w-full"></div>
                ) : testimonials.length === 0 && isManager ? (
                    <p className="text-stone-500 text-center">Chưa có đánh giá nào được chọn hiển thị (Chỉ Manager thấy dòng này).</p>
                ) : (
                    <>
                        <div 
                            className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 transform ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            <h2 className="text-3xl font-bold text-green-800 mb-4">Khách Hàng Yêu Cây Nói Gì?</h2>
                            <p className="text-green-600">
                                Những chia sẻ chân thực từ những người đã đồng hành cùng Greenshop.
                            </p>
                        </div>

                        <div 
                            className={`relative flex items-center justify-center transition-all duration-1000 transform ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                            }`}
                        >
                            <button 
                                onClick={prevSlide}
                                className="absolute left-0 z-10 p-3 bg-white text-green-700 rounded-full shadow-lg hover:bg-green-50 hover:scale-110 transition-all focus:outline-none"
                            >
                                <FiChevronLeft size={24} />
                            </button>

                            <div className="grid w-full max-w-5xl px-4 md:px-12 mx-auto overflow-visible py-4">
                                {testimonials.map((review, i) => {
                                    const isCenter = i === currentIndex;
                                    const isLeft = i === (currentIndex - 1 + testimonials.length) % testimonials.length;
                                    const isRight = i === (currentIndex + 1) % testimonials.length;
                                    
                                    // Default state (hidden behind)
                                    let positionClass = 'opacity-0 scale-75 translate-x-0 z-[-1] pointer-events-none';
                                    
                                    if (testimonials.length <= 2) {
                                        if (isCenter) positionClass = 'translate-x-0 scale-100 opacity-100 z-10 shadow-xl';
                                        else positionClass = 'opacity-0 scale-75 translate-x-0 z-[-1] pointer-events-none';
                                    } else {
                                        if (isCenter) {
                                            positionClass = 'translate-x-0 scale-105 opacity-100 z-10 shadow-xl';
                                        } else if (isLeft) {
                                            positionClass = '-translate-x-full md:-translate-x-[110%] scale-95 opacity-0 md:opacity-50 z-0 pointer-events-none';
                                        } else if (isRight) {
                                            positionClass = 'translate-x-full md:translate-x-[110%] scale-95 opacity-0 md:opacity-50 z-0 pointer-events-none';
                                        }
                                    }

                                    return (
                                        <div 
                                            key={review.id}
                                            className={`col-start-1 row-start-1 w-full md:w-[32%] justify-self-center bg-white p-8 rounded-3xl border border-green-100 flex flex-col items-center text-center transition-all duration-700 ease-out ${positionClass}`}
                                        >
                                            <div className="flex text-yellow-400 mb-4 text-xl">
                                                {Array.from({ length: 5 }).map((_, starIdx) => (
                                                    starIdx < review.rating ? <FaStar key={starIdx} /> : <FiStar key={starIdx} />
                                                ))}
                                            </div>
                                            <p className="text-stone-600 italic mb-6 line-clamp-4">
                                                "{review.comment || 'Tuyệt vời!'}"
                                            </p>
                                            <div className="mt-auto">
                                                <h4 className="font-semibold text-green-800">{review.user?.fullName || review.user?.name || 'Khách hàng'}</h4>
                                            </div>
                                            
                                            {isManager && (
                                                <button 
                                                    onClick={() => handleToggleCurate(review.id)}
                                                    className="mt-4 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold hover:bg-red-200 transition pointer-events-auto"
                                                >
                                                    Gỡ Khỏi Trang Chủ
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={nextSlide}
                                className="absolute right-0 z-10 p-3 bg-white text-green-700 rounded-full shadow-lg hover:bg-green-50 hover:scale-110 transition-all focus:outline-none"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </div>
                    </>
                )}
            </Container>
        </section>
    );
}
