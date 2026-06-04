import { Container } from './Container';
import { cn } from '../../utils/cn';

export function Footer({ className = '', ...props }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={cn(`bg-bg-surface border-t border-border py-8 mt-auto ${className}`)} 
      {...props}
    >
      <Container className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-black opacity-70">
          © {currentYear} MyApp Inc. All rights reserved.
        </p>
        
        <div className="flex gap-4">
          <a href="#" className="text-sm font-medium text-black opacity-70 hover:opacity-100 hover:text-interactive transition-all">
            Privacy Policy
          </a>
          <a href="#" className="text-sm font-medium text-black opacity-70 hover:opacity-100 hover:text-interactive transition-all">
            Terms of Service
          </a>
        </div>
      </Container>
    </footer>
  );
}