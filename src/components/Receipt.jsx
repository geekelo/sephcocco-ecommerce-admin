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

  const products = Array.isArray(order?.products) ? order.products : [];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) return;

    const productsHTML = products.length
      ? products
          .map(
            (product, index) => `
              <div class="receipt-section product-section">
                <div class="product-section-header">Product ${index + 1}</div>

                <div class="receipt-product">
                  ${
                    product?.image
                      ? `
                        <div class="receipt-product-image">
                          <img src="${product.image}" alt="${product?.name || 'Product'}" />
                        </div>
                      `
                      : ''
                  }

                  <div class="receipt-product-details">
                    <div class="receipt-product-name">${product?.name || 'N/A'}</div>

                    <div class="receipt-row">
                      <span class="receipt-label">Order ID:</span>
                      <span class="receipt-value wrap-text">
                        ${product?.orderNumber || product?.orderId || 'N/A'}
                      </span>
                    </div>

                    <div class="receipt-row">
                      <span class="receipt-label">Order Status:</span>
                      <span class="receipt-value status-text">
                        ${product?.orderStatus || 'N/A'}
                      </span>
                    </div>

                    <div class="receipt-row">
                      <span class="receipt-label">Unit Price:</span>
                      <span class="receipt-value">
                        ₦${parseFloat(product?.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div class="receipt-row">
                      <span class="receipt-label">Quantity:</span>
                      <span class="receipt-value">${product?.quantity || 1}</span>
                    </div>

                    <div class="receipt-row">
                      <span class="receipt-label">Category:</span>
                      <span class="receipt-value wrap-text">
                        ${product?.categories || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            `
          )
          .join('')
      : `
        <div class="receipt-section">
          <div class="receipt-row">
            <span class="receipt-value">No products available</span>
          </div>
        </div>
      `;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <meta charset="utf-8" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #333;
              background: #fff;
            }

            .receipt-content {
              max-width: 820px;
              margin: 0 auto;
            }

            .receipt-header {
              text-align: center;
              margin-bottom: 24px;
              border-bottom: 2px solid #ff6b35;
              padding-bottom: 12px;
            }

            .receipt-title {
              font-size: 24px;
              font-weight: 700;
              color: #ff6b35;
              letter-spacing: 0.5px;
            }

            .receipt-section {
              margin-bottom: 18px;
              padding-bottom: 14px;
              border-bottom: 1px solid #e5e7eb;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .product-section-header {
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 12px;
              color: #222;
            }

            .receipt-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 8px;
              font-size: 14px;
              line-height: 1.45;
            }

            .receipt-label {
              font-weight: 600;
              min-width: 140px;
              color: #444;
            }

            .receipt-value {
              flex: 1;
              text-align: right;
              color: #111;
            }

            .wrap-text {
              word-break: break-word;
              overflow-wrap: anywhere;
            }

            .status-text {
              text-transform: capitalize;
              font-weight: 600;
              color: #2e7d32;
            }

            .receipt-product {
              display: flex;
              gap: 16px;
              align-items: flex-start;
            }

            .receipt-product-image {
              width: 72px;
              height: 72px;
              min-width: 72px;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
              background: #fafafa;
            }

            .receipt-product-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }

            .receipt-product-details {
              flex: 1;
              min-width: 0;
            }

            .receipt-product-name {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #111827;
            }

            .receipt-total-section {
              margin-top: 24px;
              padding: 16px;
              border: 2px solid #ff6b35;
              border-radius: 10px;
              background: #fff7f3;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .receipt-total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
            }

            .receipt-total-label {
              font-size: 15px;
              font-weight: 700;
              color: #333;
            }

            .receipt-total-value {
              font-size: 22px;
              font-weight: 800;
              color: #ff6b35;
            }

            @media print {
              body {
                padding: 12mm;
              }

              .receipt-total-section {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .receipt-section,
              .product-section,
              .receipt-total-section {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt-content">
            <div class="receipt-header">
              <h1 class="receipt-title">ORDER RECEIPT</h1>
            </div>

            <div class="receipt-section">
              <div class="receipt-row">
                <span class="receipt-label">Payment Date:</span>
                <span class="receipt-value">${formatDate(order?.paymentDate)}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Payment ID:</span>
                <span class="receipt-value wrap-text">${order?.paymentId || 'N/A'}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Transaction ID:</span>
                <span class="receipt-value wrap-text">${order?.transactionId || 'N/A'}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Payment Method:</span>
                <span class="receipt-value" style="text-transform: capitalize;">
                  ${order?.paymentMethod || 'N/A'}
                </span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Payment Status:</span>
                <span class="receipt-value status-text">
                  ${order?.paymentStatus || 'N/A'}
                </span>
              </div>
            </div>

            ${productsHTML}

            <div class="receipt-total-section">
              <div class="receipt-total-row">
                <span class="receipt-total-label">TOTAL AMOUNT:</span>
                <span class="receipt-total-value">
                  ₦${parseFloat(order?.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  return (
    <div
      className="receipt-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="receipt-container">
        <div className="receipt-actions no-print">
          <button className="close-receipt-btn" onClick={onClose}>
            Close
          </button>
          <button className="print-receipt-btn" onClick={handlePrint}>
            Print Receipt
          </button>
        </div>

        <div className="receipt-content">
          <div className="receipt-header">
            <h1 className="receipt-title">ORDER RECEIPT</h1>
          </div>

          <div className="receipt-section">
            <div className="receipt-row">
              <span className="receipt-label">Payment Date:</span>
              <span className="receipt-value">{formatDate(order?.paymentDate)}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Payment ID:</span>
              <span className="receipt-value">{order?.paymentId || 'N/A'}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Transaction ID:</span>
              <span className="receipt-value">{order?.transactionId || 'N/A'}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Payment Method:</span>
              <span
                className="receipt-value"
                style={{ textTransform: 'capitalize' }}
              >
                {order?.paymentMethod || 'N/A'}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Payment Status:</span>
              <span
                className="receipt-value"
                style={{ textTransform: 'capitalize' }}
              >
                {order?.paymentStatus || 'N/A'}
              </span>
            </div>
          </div>

          <div className="receipt-section">
            <h2 className="receipt-section-title">Product Details</h2>

            {products.length > 0 ? (
              products.map((product, index) => (
                <div
                  className="receipt-product"
                  key={product?.id || index}
                  style={{
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom:
                      index !== products.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div className="receipt-product-image">
                    {product?.image && (
                      <img
                        src={product.image}
                        alt={product?.name || 'Product'}
                      />
                    )}
                  </div>

                  <div className="receipt-product-details">
                    <div className="receipt-product-name">
                      {product?.name || 'Product'}
                    </div>

                    <div className="receipt-row">
                      <span className="receipt-label">Order ID:</span>
                      <span className="receipt-value">
                        #{product?.orderNumber || product?.orderId || 'N/A'}
                      </span>
                    </div>

                    <div className="receipt-row">
                      <span className="receipt-label">Order Status:</span>
                      <span className="receipt-value">
                        {product?.orderStatus || 'N/A'}
                      </span>
                    </div>

                    <div className="receipt-row">
                      <span className="receipt-label">Unit Price:</span>
                      <span className="receipt-value">
                        ₦{parseFloat(product?.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="receipt-row">
                      <span className="receipt-label">Quantity:</span>
                      <span className="receipt-value">
                        {product?.quantity || 1}
                      </span>
                    </div>

                    <div className="receipt-row">
                      <span className="receipt-label">Category:</span>
                      <span className="receipt-value">
                        {product?.categories || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="receipt-row">
                <span className="receipt-value">No products available</span>
              </div>
            )}
          </div>

          <div className="receipt-total-section">
            <div className="receipt-total-row">
              <span className="receipt-total-label">TOTAL AMOUNT:</span>
              <span className="receipt-total-value">
                ₦{parseFloat(order?.amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;