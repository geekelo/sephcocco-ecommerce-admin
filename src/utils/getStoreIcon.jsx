 import Icon1 from '../assets/restur.svg';
 import Icon2 from '../assets/louge.svg';
 import Icon3 from '../assets/phar.svg';
 
 export const getStoreIcon = (storeType) => {
    switch(storeType) {
      case 'pharmacy':
        return       <img 
                      src={Icon3}
                      alt="Icon" 
                      className="icon"
                    />;
      case 'restaurant':
        return       <img 
                      src={Icon1}
                      alt="Icon" 
                      className="icon"
                    />;
      case 'lounge':
        return       <img 
                      src={Icon2}
                      alt="Icon" 
                      className="icon"
                    />;
      default:
        return null;
    }
  };