import { useState } from 'react';
import { Container } from '../../../components/global/Container';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
    {
        q: 'Greenshop có vận chuyển cây đi tỉnh không?',
        a: 'Hiện tại Greenshop chỉ hỗ trợ vận chuyển hoả tốc trong khu vực nội thành để đảm bảo cây luôn khỏe mạnh và không bị sốc nhiệt khi đến tay bạn.',
    },
    {
        q: 'Chính sách bảo hành cây như thế nào?',
        a: 'Chúng tôi hỗ trợ 1 đổi 1 trong vòng 3 ngày nếu cây có dấu hiệu héo úa, gãy rụng do lỗi vận chuyển hoặc tư vấn sai cách.',
    },
    {
        q: 'Tôi không biết chăm cây, Greenshop có hỗ trợ không?',
        a: 'Chắc chắn rồi! Mỗi chậu cây đều đi kèm hướng dẫn chăm sóc chi tiết. Bạn cũng có thể nhắn tin cho page 24/7 để được đội ngũ chuyên gia tư vấn.',
    },
];

export default function NewsletterFAQ() {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <section className="py-20" ref={ref}>
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    {/* FAQ Section */}
                    <div 
                        className={`transition-all duration-700 transform ${
                            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                        }`}
                    >
                        <h2 className="text-3xl font-bold text-green-800 mb-6">Câu Hỏi Thường Gặp</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="border border-green-200 rounded-2xl overflow-hidden bg-white transition-all"
                                >
                                    <button
                                        onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left text-green-800 font-semibold hover:bg-green-50 transition"
                                    >
                                        {faq.q}
                                        <FiChevronDown 
                                            className={`transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} 
                                            size={20} 
                                        />
                                    </button>
                                    <div 
                                        className={`px-5 text-green-700 overflow-hidden transition-all duration-300 ${
                                            openIdx === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        {faq.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Green Mission Section */}
                    <div 
                        className={`bg-green-800 rounded-3xl p-8 sm:p-12 text-left flex flex-col justify-center transition-all duration-700 transform ${
                            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                        }`}
                        style={{ backgroundImage: 'linear-gradient(to bottom right, #283c1d, #3f6537)' }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-6">Sứ Mệnh Của Greenshop</h2>
                        <p className="text-green-100 mb-6 leading-relaxed">
                            Tại Greenshop, chúng tôi tin rằng mỗi mầm xanh được mang vào không gian sống không chỉ làm đẹp ngôi nhà, mà còn mang lại sự bình yên, thanh lọc tâm hồn và kết nối con người gần hơn với thiên nhiên.
                        </p>
                        <p className="text-green-200 text-sm italic border-l-4 border-yellow-400 pl-4 py-2">
                            "Mỗi chậu cây là một câu chuyện tình yêu với thiên nhiên, mang năng lượng tích cực và sự tươi mát đến từng góc nhỏ trong ngôi nhà của bạn."
                        </p>
                    </div>

                </div>
            </Container>
        </section>
    );
}
