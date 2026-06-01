// AnimatedContainer — renders children immediately, applies CSS animation class
// No IntersectionObserver, no opacity-0 trap that causes blank pages
const AnimatedContainer = ({ 
  children, 
  animation = 'fade-in-up', 
  delay = 0,
  duration = 0.6,
  className = '' 
}) => {
  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'fade-in-up': 'animate-fade-in-up',
    'fade-in-down': 'animate-fade-in-down',
    'fade-in-left': 'animate-fade-in-left',
    'fade-in-right': 'animate-fade-in-right',
    'scale-in': 'animate-scale-in',
    'scale-in-bounce': 'animate-scale-in-bounce',
    'slide-in-up': 'animate-slide-in-up',
    'slide-in-down': 'animate-slide-in-down',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'bounce-in': 'animate-bounce-in',
  };

  return (
    <div
      className={`${className} ${animationClasses[animation] || ''}`}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: delay ? `${delay}s` : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
