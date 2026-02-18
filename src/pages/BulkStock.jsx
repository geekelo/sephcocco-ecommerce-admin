import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { getActiveUser } from '../utils/getActiveUser';
import VendorDropdown from '../components/VendorDropdown';
import { useGetVendor } from '../hooks/useGetVendor';
import { useViewAllProduct } from '../hooks/useGetAllProduct';
import { useUpdateBulkStock } from '../hooks/useUpdateBulkStock';
import { useActiveDepartment } from '../hooks/useGetActiveDepartment';
import '../styles/Stock.css'; // Reusing stock styles 
import '../styles/OrderPage.css'; // Reusing order page styles for layout

const BulkStock = () => {
    const navigate = useNavigate();
    const activeOutlet = getActiveOutlet();
    const user_id = getActiveUser();

    // Form State
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    // Product Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchTimeoutRef = useRef(null);
    const searchDropdownRef = useRef(null);

    // Selected Products State
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Data Fetching
    const { data: vendors = [] } = useGetVendor(activeOutlet, { search_terms: '' }, 1, 100); // Fetch all vendors
    // const { data: departments = [] } = useActiveDepartment(activeOutlet); // Fetch active departments
    const { mutateAsync: updateBulkStock, isPending: isSubmitting } = useUpdateBulkStock();

    // Custom product search
    const { data: productsData, isLoading: isLoadingProducts, refetch: searchProducts } = useViewAllProduct(
        activeOutlet,
        user_id.id,
        { search_terms: searchTerm },
        1,
        20 // Limit results
    );

    useEffect(() => {
        if (productsData?.products) {
            setSearchResults(productsData.products);
        }
    }, [productsData]);

    // Close search dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsSearching(true);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                searchProducts();
            } else {
                setSearchResults([]);
            }
        }, 500);
    };

    const handleSelectProduct = (product) => {
        // Check if already added
        if (selectedProducts.some(p => p.id === product.id)) {
            toast.warning('Product already added to list');
            setSearchTerm('');
            setIsSearching(false);
            return;
        }

        const newItem = {
            id: product.id,
            department_id: product.department_id, // Store department ID from product
            name: product.name,
            image: product.main_image_url,
            sku: product.sku || product.barcode || 'N/A',
            current_stock: product.amount_in_stock || 0,
            old_price: product.price || 0,
            // Input fields
            add_stock: '',
            cost_price: '',
            profit_markup: '',
            // Computed
            selling_price: 0
        };

        setSelectedProducts([...selectedProducts, newItem]);
        setSearchTerm('');
        setIsSearching(false);
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handleProductChange = (id, field, value) => {
        setSelectedProducts(selectedProducts.map(p => {
            if (p.id === id) {
                const updatedProduct = { ...p, [field]: value };

                // Auto-calculate selling price
                if (field === 'cost_price' || field === 'profit_markup') {
                    const cost = parseFloat(field === 'cost_price' ? value : p.cost_price) || 0;
                    const markup = parseFloat(field === 'profit_markup' ? value : p.profit_markup) || 0;
                    updatedProduct.selling_price = cost + markup;
                }

                return updatedProduct;
            }
            return p;
        }));
    };

    const handleSubmit = async () => {
        if (!invoiceNumber.trim()) {
            toast.error('Please enter an Invoice Number');
            return;
        }
        if (!selectedVendor) {
            toast.error('Please select a Vendor');
            return;
        }

        if (selectedProducts.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        // Validate all products have required fields
        const invalidProduct = selectedProducts.find(p => !p.add_stock || !p.cost_price || p.profit_markup === '');
        if (invalidProduct) {
            toast.error(`Please fill all fields for product: ${invalidProduct.name}`);
            return;
        }

        try {

            const bulkPayload = {
                stock_managements: selectedProducts.map(p => ({
                    [`sephcocco_${activeOutlet}_product_id`]: p.id,
                    [`sephcocco_${activeOutlet}_vendor_id`]: selectedVendor,
                    [`sephcocco_${activeOutlet}_department_id`]: p.department_id, // Added department_id to payload
                    invoice_number: invoiceNumber,
                    status: 'pending',
                    stock: {
                        add_stock: parseInt(p.add_stock, 10) || 0
                    },
                    price: {
                        cost_price: parseFloat(p.cost_price) || 0,
                        profit_markup: parseFloat(p.profit_markup) || 0
                    }
                }))
            };
            console.log({ bulkPayload });

            await updateBulkStock({ active_outlet: activeOutlet, payload: bulkPayload });

            toast.success('Bulk stock added successfully');
            navigate('/stocks');

        } catch (error) {
            console.error('Bulk stock error:', error);
            toast.error(error.response?.data?.message || 'Failed to add bulk stock');
        }
    };

    return (
        <div className="order-page" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="stock-header" style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate(-1)} className="back-button" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Add Bulk Stock</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <button
                        className="confirm-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                    >
                        <Save size={16} />
                        {isSubmitting ? 'Saving...' : 'Save Stock'}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

                {/* Common Details */}
                <div className="bulk-stock-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px', background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div className="form-group-stock">
                        <label>Invoice Number *</label>
                        <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="Enter invoice number"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div className="form-group-stock">
                        <label>Vendor *</label>
                        <VendorDropdown
                            vendors={vendors}
                            value={selectedVendor}
                            onChange={setSelectedVendor}
                            placeholder="Select Vendor"
                        />
                    </div>
                </div>


                {/* Product Search */}
                <div className="product-search-section" style={{ marginBottom: '24px', position: 'relative' }} ref={searchDropdownRef}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Search & Add Product</label>
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search for products by name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsSearching(true)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>

                    {isSearching && searchTerm && (
                        <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #eee', borderRadius: '6px', marginTop: '4px', maxHeight: '300px', overflowY: 'auto', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {isLoadingProducts ? (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#888' }}>Loading products...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleSelectProduct(product)}
                                        style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                                        className="search-result-item"
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                    >
                                        <img src={product.main_image_url} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{product.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Stock: {product.amount_in_stock} | Price: ₦{parseFloat(product.price || 0).toLocaleString()}</div>
                                        </div>
                                        <Plus size={16} style={{ marginLeft: 'auto', color: '#666' }} />
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#888' }}>No products found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Products Table */}
                <div className="selected-products-table" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '100px' }}>Current Stock</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '120px' }}>Old Price</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '120px' }}>Add Stock</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '140px' }}>Cost Price (₦)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '140px' }}>Profit Markup (₦)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', width: '140px' }}>New Price (₦)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#555', width: '60px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProducts.length > 0 ? (
                                selectedProducts.map((item, index) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img src={item.image} alt={item.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                                                <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.current_stock}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>₦{parseFloat(item.old_price).toLocaleString()}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input
                                                type="number"
                                                value={item.add_stock}
                                                onChange={(e) => handleProductChange(item.id, 'add_stock', e.target.value)}
                                                placeholder="0"
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input
                                                type="number"
                                                value={item.cost_price}
                                                onChange={(e) => handleProductChange(item.id, 'cost_price', e.target.value)}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input
                                                type="number"
                                                value={item.profit_markup}
                                                onChange={(e) => handleProductChange(item.id, 'profit_markup', e.target.value)}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                                            ₦{item.selling_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleRemoveProduct(item.id)}
                                                style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                        No products selected. Search and add products above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div >
        </div >
    );
};

export default BulkStock;
