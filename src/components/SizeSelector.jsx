import React from 'react';

function SizeSelector({ variants, selectedVariant, onSelect }) {
  if (!variants || variants.length <= 1) return null;

  const getSize = (title) => {
    const match = title.match(/^(xs|s|m|l|xl|xxl|2xl|3xl|4xl|5xl|6|7|8|9|10|11|12|28|29|30|31|32|33|34|35|36|37|38|39|40|os|one size)/i);
    return match ? match[0].toUpperCase() : title.split('/')[0].trim();
  };

  const handleChange = (e) => {
    const variant = variants.find(v => v.node.id === e.target.value);
    if (variant) onSelect(variant.node);
  };

  return (
    <div className="size-dropdown" style={{margin: '10px 0'}}>
      <label style={{display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase'}}>
        Size:
      </label>
      <select
        value={selectedVariant?.id || ''}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#0f0f0f',
          border: '2px solid #444',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        {variants.map((variant) => {
          const size = getSize(variant.node.title);
          const isAvailable = variant.node.availableForSale;
          
          return (
            <option 
              key={variant.node.id} 
              value={variant.node.id}
              disabled={!isAvailable}
            >
              {size} {!isAvailable ? '(Out of Stock)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default SizeSelector;
