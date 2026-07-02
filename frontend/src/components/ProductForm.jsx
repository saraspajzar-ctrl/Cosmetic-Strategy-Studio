import React from 'react'

const OPTIONS = {
  Brand: [
    'Drunk Elephant','Charlotte Tilbury','NARS','MAC','Fenty Beauty','Rare Beauty',
    'Ilia Beauty','Laura Mercier','Natasha Denona','Urban Decay','Too Faced',
    'Benefit Cosmetics','Tatcha','La Mer','Kiehl\'s','The Ordinary','CeraVe',
    'Neutrogena','L\'Oréal','Maybelline','Other',
  ],
  Category: [
    'Serum','Moisturizer','Foundation','Lipstick','Mascara','Blush','Highlighter',
    'Concealer','Face Mask','Eye Shadow','Primer','Toner','Cleanser','SPF',
    'Makeup Remover','Body Lotion','Eye Cream','Hair Care',
  ],
  Usage_Frequency: ['Daily','Weekly','Occasional','Monthly'],
  Product_Size: ['10ml','15ml','30ml','50ml','75ml','100ml','150ml','200ml','250ml','500ml'],
  Skin_Type: ['Normal','Dry','Oily','Combination','Sensitive'],
  Gender_Target: ['Female','Male','Unisex'],
  Packaging_Type: ['Bottle','Tube','Compact','Jar','Pump','Stick','Dropper','Sachet'],
  Main_Ingredient: [
    'Retinol','Hyaluronic Acid','Vitamin C','Niacinamide','Glycerin','Salicylic Acid',
    'AHA','Peptides','Collagen','Aloe Vera','Shea Butter','Jojoba Oil',
    'Ceramides','Zinc Oxide','Benzoyl Peroxide','Bakuchiol','Squalane',
  ],
  Cruelty_Free: ['True','False'],
  Country_of_Origin: [
    'USA','UK','France','South Korea','Italy','Japan','Germany','Australia',
    'Canada','Spain','Switzerland','Sweden','Netherlands',
  ],
}

const LABELS = {
  Brand: 'Brand',
  Category: 'Category',
  Usage_Frequency: 'Usage Frequency',
  Product_Size: 'Product Size',
  Skin_Type: 'Skin Type',
  Gender_Target: 'Gender Target',
  Packaging_Type: 'Packaging Type',
  Main_Ingredient: 'Main Ingredient',
  Cruelty_Free: 'Cruelty Free',
  Country_of_Origin: 'Country of Origin',
}

export default function ProductForm({ values, onChange, onSubmit, loading, submitLabel = 'Predict' }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        {Object.entries(OPTIONS).map(([field, opts]) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{LABELS[field] || field}</label>
            <select
              id={field}
              value={values[field] || ''}
              onChange={e => onChange(field, e.target.value)}
              required
            >
              <option value="" disabled>Select…</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="form-group">
          <label htmlFor="Number_of_Reviews">Expected Reviews</label>
          <input
            id="Number_of_Reviews"
            type="number"
            min="0"
            step="1"
            value={values.Number_of_Reviews ?? ''}
            onChange={e => onChange('Number_of_Reviews', e.target.value)}
            placeholder="e.g. 500"
            required
          />
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading
        ? <><span className="spinner" style={{ marginRight: 8 }} />Predicting&hellip;</>
        : submitLabel}
      </button>
    </form>
  )
}
