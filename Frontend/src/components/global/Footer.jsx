import { Link } from 'react-router-dom';
import { Container } from './Container';

export function Footer() {
    return (
        <footer className="border-t border-border bg-green-900 text-green-100">
            <Container className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Greenshop</h3>
                        <p className="text-sm text-green-200">
                            Mang không gian xanh đến ngôi nhà của bạn. Chúng tôi cung cấp các loại cây cảnh chất lượng cao cùng dịch vụ chăm sóc tận tâm.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-white mb-4">Về Chúng Tôi</h4>
                        <ul className="space-y-2 text-sm text-green-200">
                            <li><Link to="/catalog" className="hover:text-white transition-colors">Sản phẩm</Link></li>
                            <li><Link to="/blogs" className="hover:text-white transition-colors">Cẩm nang trồng cây</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Hỗ Trợ Khách Hàng</h4>
                        <ul className="space-y-2 text-sm text-green-200">
                            <li><Link to="/policy" className="hover:text-white transition-colors">Chính sách & Quy định</Link></li>
                            <li><Link to="/tickets" className="hover:text-white transition-colors">Gửi khiếu nại / Hỗ trợ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Liên Hệ</h4>
                        <ul className="space-y-2 text-sm text-green-200">
                            <li>123 Đường Xanh, Quận 1, TP.HCM</li>
                            <li>090 123 4567</li>
                            <li>support@greenshop.vn</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-green-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-green-300">
                    <p>&copy; {new Date().getFullYear()} Greenshop. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
}