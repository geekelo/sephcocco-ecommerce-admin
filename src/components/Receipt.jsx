import React from 'react';
import '../styles/Receipt.css';

const Receipt = ({ order, onClose }) => {
  console.log('receitorder', order);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  const product = order?.products?.[0];

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }

          .receipt-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 10px;
          }

          .receipt-title {
            font-size: 22px;
            font-weight: 700;
            color: #ff6b35;
          }

          .receipt-section {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
          }

          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }

          .receipt-status {
            color: #4caf50;
            font-weight: 600;
            text-transform: capitalize;
          }

          .receipt-product {
            display: flex;
            gap: 15px;
          }

          .receipt-product-image {
            width: 60px;
            height: 60px;
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
          }

          .receipt-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .receipt-total-section {
            margin-top: 20px;
            padding: 15px;
            border: 2px solid #ff6b35;
            border-radius: 8px;
            background: #f9f9f9;
          }

          .receipt-total-value {
            font-size: 20px;
            font-weight: 700;
            color: #ff6b35;
          }

          @media print {
            .receipt-total-section {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt-content">

          <!-- HEADER -->
          <div class="receipt-header">
            <h1 class="receipt-title">ORDER RECEIPT</h1>
          </div>

          <!-- ORDER DETAILS (same as modal) -->
          <div class="receipt-section">
            <div class="receipt-row">
              <span>Order Number:</span>
              <span>#${order?.orderNumber || 'N/A'}</span>
            </div>
            <div class="receipt-row">
              <span>Status:</span>
              <span class="receipt-status">${order?.orderStatus || 'N/A'}</span>
            </div>
          </div>

          <!-- PRODUCT DETAILS (same as modal) -->
          <div class="receipt-section">
            <h3>Product Details</h3>
            <div class="receipt-product">
              ${
                product?.image
                  ? `<div class="receipt-product-image">
                      <img src="${product.image}" />
                    </div>`
                  : ''
              }
              <div>
                <div class="receipt-row">
                  <span>Product:</span>
                  <span>${product?.name || 'N/A'}</span>
                </div>
                <div class="receipt-row">
                  <span>Unit Price:</span>
                  <span>₦${parseFloat(product?.price || 0).toFixed(2)}</span>
                </div>
                <div class="receipt-row">
                  <span>Quantity:</span>
                  <span>1</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PAYMENT DETAILS (same as modal) -->
          <div class="receipt-section">
            <h3>Payment Details</h3>
            <div class="receipt-row">
              <span>Payment Method:</span>
              <span style="text-transform:capitalize;">
                ${order?.paymentMethod || 'N/A'}
              </span>
            </div>
            <div class="receipt-row">
              <span>Payment Status:</span>
              <span style="text-transform:capitalize;">
                ${order?.paymentStatus || 'N/A'}
              </span>
            </div>
          </div>

          <!-- TOTAL (same as modal) -->
          <div class="receipt-total-section">
            <div class="receipt-row">
              <span>TOTAL PAID:</span>
              <span class="receipt-total-value">
                ₦${parseFloat(order?.amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

        </div>
      </body>
    </html>
  `;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
};


  return (
    <div className="receipt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="receipt-container">
        {/* Screen-only buttons */}
        <div className="receipt-actions no-print">
          <button className="close-receipt-btn" onClick={onClose}>
            Close
          </button>
          <button className="print-receipt-btn" onClick={handlePrint}>
            Print Receipt
          </button>
        </div>

        {/* Printable Receipt */}
        <div className="receipt-content">
          {/* Header */}
          <div className="receipt-header">
         
            <h1 className="receipt-title">ORDER RECEIPT</h1>
       
          </div>

          {/* Order Details */}
          <div className="receipt-section">
            <div className="receipt-row">
              <span className="receipt-label">Order ID:</span>
              <span className="receipt-value">#{order?.orderNumber}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Status:</span>
              <span className="receipt-value receipt-status">{order?.orderStatus}</span>
            </div>
          </div>

          {/* Product Information */}
          <div className="receipt-section">
            <h2 className="receipt-section-title">Product Details</h2>
            <div className="receipt-product">
              <div className="receipt-product-image">
                {order.product?.main_image_url && (
                  <img 
                    src={order?.product?.main_image_url} 
                    alt={order?.product?.name || 'Product'} 
                  />
                )}
              </div>
              <div className="receipt-product-details">
                <div className="receipt-product-name">{order.product?.name || 'Product'}</div>
                <div className="receipt-row">
                  <span className="receipt-label">Unit Price:</span>
                  <span className="receipt-value">₦{parseFloat(order?.products[0]?.price || 0).toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Quantity:</span>
                  <span className="receipt-value">{order?.quantity || 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="receipt-section">
            <h2 className="receipt-section-title">Payment Details</h2>
            <div className="receipt-row">
              <span className="receipt-label">Payment Method:</span>
              <span className="receipt-value" style={{textTransform: 'capitalize'}}>{order?.paymentMethod || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Status:</span>
              <span className="receipt-value" style={{textTransform: 'capitalize'}}>{order?.paymentStatus || 'N/A'}</span>
            </div>
            {order?.payment_details?.transaction_id && (
              <div className="receipt-row">
                <span className="receipt-label">Transaction ID:</span>
                <span className="receipt-value" >{order?.payment_details?.transaction_id}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="receipt-total-section">
            <div className="receipt-total-row">
              <span className="receipt-total-label">TOTAL AMOUNT:</span>
              <span className="receipt-total-value">₦{parseFloat(order?.amount || 0).toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Receipt;