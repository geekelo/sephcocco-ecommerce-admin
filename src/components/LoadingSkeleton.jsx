import '../styles/LoadingSkeleton.css';
const LoadingSkeleton = ({ itemsPerPage }) => {
    return (
      <div className="skeleton-wrapper-loading">
        {[...Array(itemsPerPage)].map((_, i) => (
          <div key={i} className="skeleton-loading"></div>
        ))}
      </div>
    );
  };
  
  export default LoadingSkeleton;
  