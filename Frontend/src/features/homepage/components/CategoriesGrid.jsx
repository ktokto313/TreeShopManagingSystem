import { Link } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { useScrollReveal } from '../hooks/useScrollReveal';

const categories = [
    {
        title: 'Cây Để Bàn',
        desc: 'Nhỏ gọn, thanh lọc không khí góc làm việc',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
        to: '/catalog/category/3', // Cây để bàn
    },
    {
        title: 'Cây Lọc Không Khí',
        desc: 'Mang lại bầu không khí trong lành',
        image: 'https://images.unsplash.com/photo-1545241047-6083a36a1c1c?auto=format&fit=crop&q=80&w=800',
        to: '/catalog/category/1', // Cây trong nhà
    },
    {
        title: 'Sen Đá & Xương Rồng',
        desc: 'Dễ chăm sóc, sống bền bỉ',
        image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=800',
        to: '/catalog/category/4', // Sen đá & Xương rồng
    },
    {
        title: 'Chậu & Dụng Cụ',
        desc: 'Phụ kiện tô điểm không gian xanh',
        image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800',
        to: '/catalog/category/6', // Phụ kiện
    },
];

export default function CategoriesGrid() {
    const { ref, isVisible } = useScrollReveal();

    return (
        <section className="pt-15 sm:pt-30" ref={ref}>
            <Container>
                <div 
                    className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                >
                    <h2 className="text-3xl font-bold text-green-800 mb-4">Khám Phá Danh Mục</h2>
                    <p className="text-green-600">
                        Từ những chậu cây mini để bàn cho tới cây cảnh cỡ lớn, chúng tôi có đủ mọi 
                        lựa chọn để biến không gian của bạn trở nên tươi mát hơn.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <Link 
                            key={idx} 
                            to={cat.to}
                            className={`group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700 transform ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                            }`}
                            style={{ transitionDelay: `${idx * 150}ms` }}
                        >
                            <img 
                                src={cat.image} 
                                alt={cat.title} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-xl font-semibold mb-1">{cat.title}</h3>
                                <p className="text-green-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {cat.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
