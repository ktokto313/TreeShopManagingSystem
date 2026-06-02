export function Breakout({ children, className = '', ...props }) {
  return (
    <div 
      className={`w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}