// The 14 fixed Budget Summary categories — exact order from Foysal's Excel
// ("Budget (Quotation)" sheet). These seed every new quotation.
export const QUOTATION_CATEGORIES = [
  'Pre-Production',
  'Camera Equipment',
  'Light & Gear',
  'Location & Studio Rental',
  'Prop & Wardrobe',
  'Transportation, Catering & Meal',
  'Production & Light Crew',
  'Artist & Casting Agency',
  'Directorial Team Remuneration',
  'DOP & Camera Unit',
  'Art & Makeup Crew',
  'Postproduction',
  'In House Supervision Charge',
  'Miscellaneous Cost',
] as const;

export const FILM_FORMATS = ['TVC', 'OVC', 'AV', 'Digital', 'Documentary', 'Photoshoot', 'Other'];

export const QUOTATION_STATUSES = [
  { key: 'draft', label: 'Draft', color: '#6B7280' },
  { key: 'sent', label: 'Sent', color: '#3B82F6' },
  { key: 'approved', label: 'Approved', color: '#2ECC71' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
  { key: 'expired', label: 'Expired', color: '#F59E0B' },
] as const;

export const quotationStatusMeta = (s: string) =>
  QUOTATION_STATUSES.find((x) => x.key === s) ?? QUOTATION_STATUSES[0];
