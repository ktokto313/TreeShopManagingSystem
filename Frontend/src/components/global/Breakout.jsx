// This is a wrapper component, it can take anything inside of it to break out of the parent container.
// This is for when you want something to absolutely span the whole screen
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