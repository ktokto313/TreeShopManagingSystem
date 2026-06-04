import { Container } from './Container'; 

export function Header({ className = '', ...props }) {
  return (
    <header 
      className={`bg-bg-base border-b border-border sticky top-0 z-50 ${className}`} 
      {...props}
    >
      <Container className="flex items-center justify-between h-16">
        {/* Logo Area */}
        <div className="flex items-center gap-2 font-bold text-lg text-black">
          <div className="w-8 h-8 rounded-md bg-interactive flex items-center justify-center text-white">
            {/* Placeholder for an icon/logo */}
            ★
          </div>
          <span>MyApp</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          <a href="#" className="text-sm font-medium text-black hover:text-interactive transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm font-medium text-black hover:text-interactive transition-colors">
            Tickets
          </a>
        </nav>
      </Container>
    </header>
  );
}