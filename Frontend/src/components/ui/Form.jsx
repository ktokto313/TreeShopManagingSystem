export function Form({ onSubmit, children, className = '', ...props }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`flex flex-col gap-4 ${className}`} 
      noValidate 
      {...props}
    >
      {children}
    </form>
  );
}