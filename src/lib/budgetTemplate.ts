// Full standard Budget (Details) template from Foysal's Excel.
// Each row's `category` matches one of the 14 QUOTATION_CATEGORIES exactly,
// so detail subtotals roll up into the Budget Summary.

export interface DetailTemplateRow {
  category: string;
  job: string;
}

export const BUDGET_DETAIL_TEMPLATE: DetailTemplateRow[] = [
  // Pre-Production (incl. Recce sub-group)
  { category: 'Pre-Production', job: 'Script Development & Story Board' },
  { category: 'Pre-Production', job: 'Recce: DOP' },
  { category: 'Pre-Production', job: 'Recce: Food' },
  { category: 'Pre-Production', job: 'Recce: Transportation' },
  { category: 'Pre-Production', job: 'Recce: Accomodation' },
  // Camera Equipment
  { category: 'Camera Equipment', job: 'Camera Rental' },
  { category: 'Camera Equipment', job: 'Osmo' },
  { category: 'Camera Equipment', job: 'Drone' },
  { category: 'Camera Equipment', job: 'GoPro' },
  { category: 'Camera Equipment', job: 'Lens' },
  { category: 'Camera Equipment', job: 'Sound Gear' },
  // Light & Gear
  { category: 'Light & Gear', job: 'Lights' },
  { category: 'Light & Gear', job: 'Reflector & Others' },
  { category: 'Light & Gear', job: 'Generator' },
  { category: 'Light & Gear', job: 'Generator Oil' },
  { category: 'Light & Gear', job: 'Trolley' },
  { category: 'Light & Gear', job: 'Easy Rig' },
  { category: 'Light & Gear', job: 'DJI Ronin' },
  { category: 'Light & Gear', job: 'Jib Arm' },
  { category: 'Light & Gear', job: 'Jimmi Gib' },
  { category: 'Light & Gear', job: 'Stadycam' },
  { category: 'Light & Gear', job: 'Walkie Talkie' },
  { category: 'Light & Gear', job: 'Sound System' },
  { category: 'Light & Gear', job: 'Rain Machine' },
  { category: 'Light & Gear', job: 'Chroma' },
  // Location & Studio Rental
  { category: 'Location & Studio Rental', job: 'Location' },
  { category: 'Location & Studio Rental', job: 'Set Making Rent' },
  { category: 'Location & Studio Rental', job: 'Set/Stage' },
  // Prop & Wardrobe
  { category: 'Prop & Wardrobe', job: 'Props' },
  { category: 'Prop & Wardrobe', job: 'Costume' },
  { category: 'Prop & Wardrobe', job: 'Ornaments' },
  // Transportation, Catering & Meal
  { category: 'Transportation, Catering & Meal', job: 'Camera Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Artist Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Directorial Team Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Crew Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Light Pickup Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Generator Pickup Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Production Pickup Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Art Pickup Van + Fuel' },
  { category: 'Transportation, Catering & Meal', job: 'Breakfast, Lunch, Refreshment, Dinner' },
  { category: 'Transportation, Catering & Meal', job: 'Catering Accessories' },
  { category: 'Transportation, Catering & Meal', job: 'Accomodation' },
  // Production & Light Crew
  { category: 'Production & Light Crew', job: 'Production Manager' },
  { category: 'Production & Light Crew', job: 'Assistant Production Manager' },
  { category: 'Production & Light Crew', job: 'Production Boys' },
  { category: 'Production & Light Crew', job: 'Light Crew' },
  { category: 'Production & Light Crew', job: 'Gaffer' },
  { category: 'Production & Light Crew', job: 'Crane Crew' },
  // Artist & Casting Agency (Talent)
  { category: 'Artist & Casting Agency', job: 'Main Artist' },
  { category: 'Artist & Casting Agency', job: 'Background' },
  { category: 'Artist & Casting Agency', job: 'Casting Director' },
  // Directorial Team Remuneration (Main Remuneration)
  { category: 'Directorial Team Remuneration', job: 'Director' },
  { category: 'Directorial Team Remuneration', job: '1st AD' },
  { category: 'Directorial Team Remuneration', job: '2nd AD' },
  { category: 'Directorial Team Remuneration', job: '3rd AD' },
  // DOP & Camera Unit
  { category: 'DOP & Camera Unit', job: 'DOP' },
  { category: 'DOP & Camera Unit', job: 'DOP Assistant' },
  { category: 'DOP & Camera Unit', job: 'Focus Puller' },
  // Art & Makeup Crew
  { category: 'Art & Makeup Crew', job: "Art Director's Remuneration" },
  { category: 'Art & Makeup Crew', job: "Assistant Art Director's Remuneration" },
  { category: 'Art & Makeup Crew', job: 'Props Boy' },
  { category: 'Art & Makeup Crew', job: 'Makeup Artist & Hair Stylist' },
  { category: 'Art & Makeup Crew', job: "Costume Designer's Remuneration" },
  // Postproduction
  { category: 'Postproduction', job: 'Offline Edit' },
  { category: 'Postproduction', job: 'Online' },
  { category: 'Postproduction', job: 'Color' },
  { category: 'Postproduction', job: 'Computer Graphics (CG)' },
  { category: 'Postproduction', job: 'Voice' },
  { category: 'Postproduction', job: 'Sound Recording & Mixing' },
  { category: 'Postproduction', job: 'Background Music' },
  { category: 'Postproduction', job: 'Post Supervisor' },
  { category: 'Postproduction', job: 'Hard Drive' },
  // In House Supervision Charge
  { category: 'In House Supervision Charge', job: 'Line Producer' },
  { category: 'In House Supervision Charge', job: 'Production Head' },
  { category: 'In House Supervision Charge', job: 'HR & Accounts' },
  { category: 'In House Supervision Charge', job: 'Product Shoot' },
  { category: 'In House Supervision Charge', job: 'Phone and Phone Card' },
  { category: 'In House Supervision Charge', job: 'Stationary' },
  { category: 'In House Supervision Charge', job: 'Accomodation' },
  // Miscellaneous Cost
  { category: 'Miscellaneous Cost', job: 'Miscellaneous Expense' },
];

// Team List sheet — Recce Team + Shooting Team (role, quantity)
export interface TeamTemplateRow {
  role_title: string;
  quantity: number;
}

export const RECCE_TEAM: TeamTemplateRow[] = [
  'Director', 'Producer', 'Line Producer', 'Production Head', 'Production Manager',
  'Production Boy', 'Cinematographer', 'Chief AD', 'First AD', 'Casting Director',
  'Art Director', 'Driver',
].map((role_title) => ({ role_title, quantity: 1 }));

export const SHOOTING_TEAM: TeamTemplateRow[] = [
  { role_title: 'Director', quantity: 1 },
  { role_title: 'Producer', quantity: 1 },
  { role_title: 'Line Producer', quantity: 1 },
  { role_title: 'Production Head', quantity: 1 },
  { role_title: 'Production Manager', quantity: 1 },
  { role_title: 'Production Boy', quantity: 3 },
  { role_title: 'Cinematographer', quantity: 1 },
  { role_title: 'Chief AD', quantity: 1 },
  { role_title: 'First AD', quantity: 1 },
  { role_title: 'Casting Director', quantity: 1 },
  { role_title: 'Art Director', quantity: 1 },
  { role_title: 'Driver', quantity: 1 },
  { role_title: 'Focus Puller', quantity: 1 },
  { role_title: 'Gaffer', quantity: 1 },
  { role_title: 'Art Assistant', quantity: 1 },
  { role_title: 'Costume Designer', quantity: 1 },
  { role_title: 'Costume Designer Assistant', quantity: 1 },
  { role_title: 'Camera Crew', quantity: 3 },
  { role_title: '2nd AD', quantity: 1 },
  { role_title: 'Artist', quantity: 10 },
  { role_title: 'Casting Director Assistant', quantity: 1 },
  { role_title: 'Client & Agency', quantity: 5 },
];
