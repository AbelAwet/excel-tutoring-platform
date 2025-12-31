import { Link } from 'react-router-dom';

const Logo = ({ variant = 'full', className = '', to = '/' }) => {
  const renderLogo = () => {
    if (variant === 'icon') {
      return (
        <img 
          src="/logo/logo.png" 
          alt="EXCEL Tutoring" 
          className="h-10 w-auto"
        />
      );
    }
    
    return (
      <img 
        src="/logo/logo.png" 
        alt="EXCEL Tutoring Service" 
        className="h-12 w-auto"
      />
    );
  };

  if (to) {
    return (
      <Link to={to} className={`inline-flex items-center ${className}`}>
        {renderLogo()}
      </Link>
    );
  }

  return <div className={`inline-flex items-center ${className}`}>{renderLogo()}</div>;
};

export default Logo;
