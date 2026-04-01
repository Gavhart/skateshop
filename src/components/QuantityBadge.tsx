import React from 'react';

function QuantityBadge({ quantity, available }) {
  if (!available) {
    return <span className="qty-badge out-of-stock">OUT OF STOCK</span>;
  }
  
  if (quantity <= 3) {
    return <span className="qty-badge low-stock">ONLY {quantity} LEFT</span>;
  }
  
  if (quantity <= 10) {
    return <span className="qty-badge medium-stock">{quantity} IN STOCK</span>;
  }
  
  return <span className="qty-badge in-stock">IN STOCK</span>;
}

export default QuantityBadge;
