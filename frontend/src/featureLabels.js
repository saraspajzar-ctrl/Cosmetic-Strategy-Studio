// Maps raw one-hot encoded feature names to business-friendly labels.
// Prefixes are ordered longest-first so Country_of_Origin matches before Country.
const PREFIXES = [
  ['Country_of_Origin', 'Country of origin'],
  ['Main_Ingredient',   'Main ingredient'],
  ['Cruelty_Free',      'Cruelty-free'],
  ['Packaging_Type',    'Packaging'],
  ['Skin_Type',         'Skin type'],
  ['Gender_Target',     'Gender target'],
  ['Usage_Frequency',   'Usage frequency'],
  ['Product_Size',      'Product size'],
  ['Category',          'Category'],
  ['Brand',             'Brand'],
]

const VALUE_MAP = { True: 'Yes', False: 'No' }

export function cleanFeatureName(raw) {
  for (const [prefix, label] of PREFIXES) {
    if (raw === prefix || raw.startsWith(prefix + '_')) {
      const suffix = raw.slice(prefix.length).replace(/^_/, '').replace(/_/g, ' ')
      if (!suffix) return label
      return `${label}: ${VALUE_MAP[suffix] ?? suffix}`
    }
  }
  return raw.replace(/_/g, ' ')
}
