// Simple fallback container without animations
const SimpleContainer = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default SimpleContainer;