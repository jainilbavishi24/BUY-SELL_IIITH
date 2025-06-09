export const PRODUCT_CATEGORIES = [
  {
    value: 'electronics',
    label: 'Electronics',
    icon: '📱',
    subcategories: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Headphones',
      'Chargers',
      'Gaming Consoles',
      'Smart Watches',
      'Cameras',
      'Speakers',
      'Other Electronics'
    ]
  },
  {
    value: 'books',
    label: 'Books & Study Material',
    icon: '📚',
    subcategories: [
      'Textbooks',
      'Reference Books',
      'Novels',
      'Competitive Exam Books',
      'Notes',
      'Previous Year Papers',
      'Study Guides',
      'Magazines',
      'Comics',
      'Other Books'
    ]
  },
  {
    value: 'clothing',
    label: 'Clothing & Fashion',
    icon: '👕',
    subcategories: [
      'T-Shirts',
      'Shirts',
      'Jeans',
      'Formal Wear',
      'Ethnic Wear',
      'Footwear',
      'Accessories',
      'Bags',
      'Watches',
      'Jewelry'
    ]
  },
  {
    value: 'furniture',
    label: 'Furniture & Home',
    icon: '🪑',
    subcategories: [
      'Study Table',
      'Chair',
      'Bed',
      'Mattress',
      'Wardrobe',
      'Bookshelf',
      'Desk Lamp',
      'Storage Boxes',
      'Curtains',
      'Home Decor'
    ]
  },
  {
    value: 'sports',
    label: 'Sports & Fitness',
    icon: '⚽',
    subcategories: [
      'Cricket Equipment',
      'Football',
      'Badminton',
      'Tennis',
      'Gym Equipment',
      'Cycling',
      'Swimming',
      'Basketball',
      'Fitness Accessories',
      'Sports Shoes'
    ]
  },
  {
    value: 'vehicles',
    label: 'Vehicles',
    icon: '🚲',
    subcategories: [
      'Bicycles',
      'Motorcycles',
      'Scooters',
      'Car Accessories',
      'Bike Accessories',
      'Helmets',
      'Vehicle Parts',
      'Other Vehicles'
    ]
  },
  {
    value: 'musical',
    label: 'Musical Instruments',
    icon: '🎸',
    subcategories: [
      'Guitar',
      'Keyboard',
      'Drums',
      'Violin',
      'Flute',
      'Harmonium',
      'Ukulele',
      'Music Accessories',
      'Audio Equipment',
      'Other Instruments'
    ]
  },
  {
    value: 'stationery',
    label: 'Stationery & Supplies',
    icon: '✏️',
    subcategories: [
      'Pens & Pencils',
      'Notebooks',
      'Calculators',
      'Art Supplies',
      'Office Supplies',
      'Printing Services',
      'Craft Materials',
      'Organizers',
      'Sticky Notes',
      'Other Stationery'
    ]
  },
  {
    value: 'food',
    label: 'Food & Beverages',
    icon: '🍕',
    subcategories: [
      'Snacks',
      'Beverages',
      'Homemade Food',
      'Cooking Ingredients',
      'Kitchen Appliances',
      'Tiffin Services',
      'Party Orders',
      'Healthy Food',
      'International Cuisine',
      'Other Food Items'
    ]
  },
  {
    value: 'services',
    label: 'Services',
    icon: '🛠️',
    subcategories: [
      'Tutoring',
      'Assignment Help',
      'Typing Services',
      'Repair Services',
      'Cleaning Services',
      'Photography',
      'Event Planning',
      'Transportation',
      'Delivery Services',
      'Other Services'
    ]
  },
  {
    value: 'accommodation',
    label: 'Accommodation',
    icon: '🏠',
    subcategories: [
      'Room Sharing',
      'PG Accommodation',
      'Hostel Transfer',
      'Temporary Stay',
      'Guest House',
      'Apartment Sharing',
      'Subletting',
      'Other Accommodation'
    ]
  },
  {
    value: 'miscellaneous',
    label: 'Miscellaneous',
    icon: '📦',
    subcategories: [
      'Gift Items',
      'Collectibles',
      'Plants',
      'Pet Supplies',
      'Travel Accessories',
      'Personal Care',
      'Health & Wellness',
      'Hobby Items',
      'Seasonal Items',
      'Other Items'
    ]
  }
];

export const getCategoryIcon = (categoryValue) => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.icon : '📦';
};

export const getCategoryLabel = (categoryValue) => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};
