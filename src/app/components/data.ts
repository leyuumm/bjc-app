export const COLORS = {
  primary: '#00704A',
  secondary: '#362415',
  background: '#FFFFFF',
  error: '#D32F2F',
  inactive: '#757575',
  surface: '#F5F5F5',
  accent: '#E8F5E9',
};

export const IMAGES = {
  lemonJuice: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGxlbW9uJTIwanVpY2UlMjBkcmlua3xlbnwxfHx8fDE3NzI2OTAxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  latte: 'https://images.unsplash.com/photo-1680381724318-c8ac9fe3a484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjBjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwxfHx8fDE3NzI2MzA3MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  icedTea: 'https://images.unsplash.com/photo-1596813890370-19f2a00b3388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwdGVhJTIwYmV2ZXJhZ2V8ZW58MXx8fHwxNzcyNjg0MDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  matcha: 'https://images.unsplash.com/photo-1708572727896-117b5ea25a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBncmVlbiUyMHRlYSUyMGxhdHRlfGVufDF8fHx8MTc3MjYxNTgzOXww&ixlib=rb-4.1.0&q=80&w=1080',
  mango: 'https://images.unsplash.com/photo-1544510806-e28d3cd4d4e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMHNtb290aGllJTIwdHJvcGljYWx8ZW58MXx8fHwxNzcyNjkwMTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  espresso: 'https://images.unsplash.com/photo-1645445644664-8f44112f334c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NzI2ODg4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  frappe: 'https://images.unsplash.com/photo-1553649372-9d631caca7bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJhbWVsJTIwZnJhcHBlJTIwZHJpbmt8ZW58MXx8fHwxNzcyNjkwMTc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  mocha: 'https://images.unsplash.com/photo-1619286310410-a95de97b0aec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBtb2NoYSUyMGNvZmZlZXxlbnwxfHx8fDE3NzI2OTAxNzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  citrus: 'https://images.unsplash.com/photo-1643996322171-7a94b7acc9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMGp1aWNlJTIwY2l0cnVzJTIwb3JhbmdlfGVufDF8fHx8MTc3MjY5MDE4MHww&ixlib=rb-4.1.0&q=80&w=1080',
  shop: 'https://images.unsplash.com/photo-1631869404868-2ae8de2e7264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY29mZmVlJTIwc2hvcCUyMGludGVyaW9yJTIwd2FybXxlbnwxfHx8fDE3NzI2OTAxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  coldBrew: 'https://images.unsplash.com/photo-1611477948234-a3c27435c72b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xkJTIwYnJldyUyMGNvZmZlZSUyMGdsYXNzfGVufDF8fHx8MTc3MjY2NTM2OXww&ixlib=rb-4.1.0&q=80&w=1080',
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  brand: 'lehmuhn' | 'kohfee';
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
  sugarLevel: string;
  toppings: string[];
  addOns: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  hours: string;
  available: boolean;
  brand: 'lehmuhn' | 'kohfee';
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  time: string;
  customerName: string;
  orderType: string;
}

export const branches: Branch[] = [
  { id: '1', name: 'SM City Cebu', address: 'North Reclamation Area, Cebu City', hours: '8:00 AM - 9:00 PM', available: true, brand: 'lehmuhn' },
  { id: '2', name: 'Ayala Center', address: 'Cebu Business Park, Cebu City', hours: '9:00 AM - 10:00 PM', available: true, brand: 'lehmuhn' },
  { id: '3', name: 'IT Park Branch', address: 'Lahug, Cebu City', hours: '7:00 AM - 11:00 PM', available: false, brand: 'lehmuhn' },
  { id: '4', name: 'Robinson Galleria', address: 'General Maxilom Ave, Cebu City', hours: '10:00 AM - 9:00 PM', available: true, brand: 'kohfee' },
  { id: '5', name: 'Banilad Town Centre', address: 'Gov. M. Cuenco Ave, Cebu City', hours: '8:00 AM - 8:00 PM', available: true, brand: 'kohfee' },
  { id: '6', name: 'Fuente Circle', address: 'Osme\u00f1a Blvd, Cebu City', hours: '6:00 AM - 10:00 PM', available: true, brand: 'kohfee' },
];

export const products: Product[] = [
  { id: '1', name: 'Classic Lemonade', price: 89, image: IMAGES.lemonJuice, category: 'Juices', description: 'Freshly squeezed lemons with a hint of sweetness', brand: 'lehmuhn' },
  { id: '2', name: 'Mango Sunrise', price: 109, image: IMAGES.mango, category: 'Juices', description: 'Fresh Philippine mangoes blended to perfection', brand: 'lehmuhn' },
  { id: '3', name: 'Citrus Burst', price: 99, image: IMAGES.citrus, category: 'Juices', description: 'A refreshing mix of orange, lemon, and calamansi', brand: 'lehmuhn' },
  { id: '4', name: 'Iced Lemon Tea', price: 79, image: IMAGES.icedTea, category: 'Tea', description: 'Cold brewed tea with fresh lemon slices', brand: 'lehmuhn' },
  { id: '5', name: 'Matcha Latte', price: 129, image: IMAGES.matcha, category: 'Tea', description: 'Premium Japanese matcha with creamy milk', brand: 'lehmuhn' },
  { id: '6', name: 'Classic Espresso', price: 99, image: IMAGES.espresso, category: 'Hot Coffee', description: 'Rich, bold espresso shot from Arabica beans', brand: 'kohfee' },
  { id: '7', name: 'Caf\u00e9 Latte', price: 129, image: IMAGES.latte, category: 'Hot Coffee', description: 'Smooth espresso with steamed milk and microfoam', brand: 'kohfee' },
  { id: '8', name: 'Caramel Frapp\u00e9', price: 149, image: IMAGES.frappe, category: 'Blended', description: 'Icy caramel blended coffee with whipped cream', brand: 'kohfee' },
  { id: '9', name: 'Mocha Delight', price: 139, image: IMAGES.mocha, category: 'Hot Coffee', description: 'Chocolate and espresso in perfect harmony', brand: 'kohfee' },
  { id: '10', name: 'Cold Brew', price: 119, image: IMAGES.coldBrew, category: 'Iced Coffee', description: '24-hour slow-steeped coffee, smooth and bold', brand: 'kohfee' },
];

export const sampleOrders: Order[] = [
  {
    id: 'BJC-001',
    items: [{ ...products[7], quantity: 2, size: 'Large', sugarLevel: '75%', toppings: ['Whipped Cream'], addOns: ['Extra Shot'] }],
    total: 338,
    status: 'pending',
    time: '10:30 AM',
    customerName: 'Maria Santos',
    orderType: 'Advance Order',
  },
  {
    id: 'BJC-002',
    items: [{ ...products[6], quantity: 1, size: 'Medium', sugarLevel: '100%', toppings: [], addOns: [] }],
    total: 129,
    status: 'preparing',
    time: '10:45 AM',
    customerName: 'Juan Dela Cruz',
    orderType: 'On-site',
  },
  {
    id: 'BJC-003',
    items: [{ ...products[0], quantity: 3, size: 'Regular', sugarLevel: '50%', toppings: ['Nata de Coco'], addOns: [] }],
    total: 267,
    status: 'ready',
    time: '11:00 AM',
    customerName: 'Ana Reyes',
    orderType: 'Advance Order',
  },
  {
    id: 'BJC-004',
    items: [{ ...products[9], quantity: 1, size: 'Large', sugarLevel: '25%', toppings: [], addOns: ['Oat Milk'] }],
    total: 149,
    status: 'completed',
    time: '9:15 AM',
    customerName: 'Carlo Mendoza',
    orderType: 'On-site',
  },
];
