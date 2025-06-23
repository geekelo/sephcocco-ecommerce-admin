
import Cookies from 'js-cookie';
export const getActiveOutlet = () => {
    const selectedOutlet = Cookies.get('activeOutlet');
    
    if (!selectedOutlet) {
      console.warn('No active outlet found in cookies');
      return null;
    }

    // Debug: Log the raw cookie value
    console.log('Raw cookie value:', selectedOutlet);
    console.log('Cookie value type:', typeof selectedOutlet);
    
    // Ensure we always return a string
    const outletValue = String(selectedOutlet).trim();
    console.log('Final outlet value:', outletValue);
    
    return outletValue;
  };