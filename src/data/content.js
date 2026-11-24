// All copy is taken from the Kleener Touch company profile.

export const company = {
  name: 'Kleener Touch',
  legalName: 'Kleener Touch Facility Management Limited',
  rc: '8263558',
  tagline: 'Keep It Working.',
  slogan: 'We don’t just clean, we organize while at it.',
  phone: '0701 430 8301',
  phoneHref: 'tel:+2347014308301',
  email: 'kleenertouch@gmail.com',
  office: 'Lagos, Nigeria',
  instagram: { handle: '@kleenertouch', url: 'https://instagram.com/kleenertouch' },
  x: { handle: '@kleenertouchfm', url: 'https://x.com/kleenertouchfm' },
  coverage: ['Lagos', 'Ogun', 'Ibadan', 'Benin', 'Abraka', 'Warri', 'Nationwide projects'],
};

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#clients', label: 'Clients' },
  { href: '#contact', label: 'Contact' },
];

export const hero = {
  headline: ['Clean Spaces.', 'Efficient Facilities.', 'Reliable People.'],
  lead:
    'Kleener Touch Facility Management Limited delivers professional cleaning, facility management, janitorial outsourcing, housekeeping and pest control solutions for residential, commercial and corporate environments.',
  sub: 'We combine skilled people, structured processes and quality supervision to keep your spaces clean, organized and functioning efficiently.',
};

export const highlights = [
  { label: 'Trained personnel', value: 30, suffix: '+' },
  { label: 'Client retention', value: 98, suffix: '%' },
  { label: 'Operations since', value: 2024, from: 2000 },
];

export const milestones = [
  { date: 'Oct 2023', text: 'Registered as a business' },
  { date: '2024', text: 'Commenced full operations' },
  { date: 'Feb 2025', text: 'Re-registered as a Limited Liability Company' },
];

export const vision =
  'To become a leading and trusted one-stop facility solutions company in Nigeria, recognized for professionalism, reliability, innovation and exceptional customer service — and ultimately a household name across residential, commercial, hospitality and corporate environments.';

export const mission =
  'To provide professional, responsive and reliable facility solutions that make our clients’ lives and operations easier, while creating a structured environment where skilled professionals are treated fairly, properly managed and adequately compensated.';

export const values = [
  { title: 'Professionalism', text: 'High standards in how we communicate, work and deliver.' },
  { title: 'Integrity', text: 'Trust is the foundation of every client and professional relationship.' },
  { title: 'Accountability', text: 'We take ownership of our responsibilities and address service concerns promptly.' },
  { title: 'Customer Focus', text: 'We listen, respond and solve practical needs.' },
  { title: 'Fairness', text: 'We maintain respectful working relationships and honour agreed compensation.' },
  { title: 'Reliability', text: 'We understand that our clients depend on consistent service delivery.' },
  { title: 'Excellence', text: 'Better people, processes and standards for better outcomes.' },
];

export const services = [
  {
    id: 'cleaning',
    letter: 'A',
    tab: 'Cleaning',
    blurb: 'Homes, offices, deep & post-construction',
    icon: 'sparkle',
    title: 'Professional Cleaning Services',
    intro:
      'Cleaning solutions designed to maintain clean, healthy, organized and presentable environments. We don’t just clean, we organize while at it.',
    items: [
      'Residential cleaning', 'Office and commercial cleaning', 'Post-construction cleaning', 'Deep cleaning',
      'Upholstery and mattress cleaning', 'Rug and carpet cleaning', 'Move-in and move-out cleaning',
    ],
    image: { src: '/images/bathroom-clean.jpg', alt: 'Kleener Touch cleaner wiping down a bathtub', position: '50% 40%' },
  },
  {
    id: 'janitorial',
    letter: 'B',
    tab: 'Janitorial & Housekeeping',
    blurb: 'Recruit, deploy & supervise staff',
    icon: 'users',
    title: 'Janitorial & Housekeeping Services',
    intro:
      'We recruit, train, deploy and supervise reliable janitors and housekeepers, so you can focus on your core activities while we manage the day-to-day workforce.',
    items: [
      'Janitorial outsourcing', 'Office janitorial management', 'Residential housekeeping', 'Hotel and hospitality housekeeping',
      'Full-time and part-time housekeeping', 'Janitorial staff recruitment and training',
    ],
    image: { src: '/images/room-housekeeping.jpg', alt: 'Kleener Touch housekeeper cleaning a bedroom window with the furniture covered', position: '50% 22%' },
  },
  {
    id: 'facility',
    letter: 'C',
    tab: 'Facility Management',
    blurb: 'Maintenance, repairs & supervision',
    icon: 'building',
    title: 'Facility Management Services',
    intro: 'Keeping buildings and facilities functional, safe, organized and properly maintained. Our goal is simple: Keep It Working.',
    items: [
      'Facility supervision and management', 'Facility maintenance coordination', 'Plumbing services', 'Electrical maintenance',
      'Painting', 'Carpentry', 'Facility and staff management',
    ],
    image: { src: '/images/staff-hivis.jpg', alt: 'Kleener Touch FM staff member in a hi-vis vest cleaning an exterior window', position: '50% 30%' },
  },
  {
    id: 'pest',
    letter: 'D',
    tab: 'Pest Control & Supplies',
    blurb: 'Fumigation, chemicals & equipment',
    icon: 'shield',
    title: 'Pest Control & Facility Supplies',
    intro:
      'Professional pest management for homes, businesses and hospitality spaces, plus the chemicals, equipment and consumables that keep facilities running, including our own Kleener Touch products.',
    items: [
      'Fumigation', 'General pest control', 'Cleaning chemicals', 'Cleaning equipment procurement', 'Cleaning consumables and supplies',
    ],
    image: { src: '/images/products.jpg', alt: 'Kleener Touch branded toilet wash and liquid soap products', position: '50% 50%' },
  },
];

export const qualityControl = {
  title: 'Supervision & Quality Control',
  text: 'Every deployment is supported by operational supervision, performance monitoring and quality checks to ensure agreed service standards are consistently maintained.',
};

export const gallery = [
  {
    src: '/images/bathroom-detail.jpg', position: '50% 35%', service: 'Professional Cleaning Services',
    title: 'Deep cleaning', text: 'Bathrooms cleaned top to bottom, with shelves and products put back in order.',
    alt: 'Kleener Touch cleaner organising bathroom shelves',
  },
  {
    src: '/images/curtain-dusting.jpg', position: '50% 30%', service: 'Professional Cleaning Services',
    title: 'Detail work', text: 'Curtains, rails and high corners dusted, not skipped.',
    alt: 'Kleener Touch cleaner dusting curtains with an extension pole',
  },
  {
    src: '/images/cleaning-mop.jpg', position: '50% 40%', service: 'Janitorial & Housekeeping Services',
    title: 'Janitorial services', text: 'Daily floor care that keeps offices and homes presentable.',
    alt: 'Kleener Touch janitor mopping a floor',
  },
  {
    src: '/images/post-construction.jpg', position: '50% 40%', service: 'Professional Cleaning Services',
    title: 'Post-construction cleaning', text: 'Dust and site debris cleared so a new space is ready to use.',
    alt: 'Post-construction clean-up in progress',
  },
  {
    src: '/images/vacuum.jpg', position: '50% 50%', service: 'Pest Control & Facility Supplies',
    title: 'Equipment procurement', text: 'Wet and dry vacuums and cleaning equipment supplied to clients.',
    alt: 'Wet and dry vacuum cleaner supplied by Kleener Touch',
  },
  {
    src: '/images/staff-uniform.jpg', position: '50% 30%', service: 'Facility Management Services',
    title: 'Uniformed, reachable staff', text: 'Every team member wears Kleener Touch uniform with our number on it.',
    alt: 'Kleener Touch staff member in a branded uniform',
  },
];

export const steps = [
  { title: 'Understanding the need', text: 'We engage with you to understand the facility, requirements, expectations and challenges.' },
  { title: 'Assessment & planning', text: 'We assess the requirements and develop an appropriate service approach.' },
  { title: 'Deployment', text: 'We deploy trained personnel, appropriate equipment and the necessary resources.' },
  { title: 'Supervision & QC', text: 'Operations are monitored to ensure agreed standards are maintained.' },
  { title: 'Feedback', text: 'We encourage you to raise concerns promptly so they can be addressed.' },
  { title: 'Continuous improvement', text: 'We review service delivery and make improvements where necessary.' },
];

export const quality = [
  'Proper staff selection & onboarding',
  'Role-specific training',
  'Clear service expectations',
  'Supervision & performance monitoring',
  'Client feedback & corrective action',
];

export const reasons = [
  { icon: 'bolt', title: 'Responsive service', text: 'Short response times to recruitment needs, complaints and operational challenges.' },
  { icon: 'heart', title: 'Customer-focused', text: 'Practical solutions to your concerns — not generic services.' },
  { icon: 'users', title: 'Structured workforce', text: 'We carry the burden of recruiting, training, supervising and replacing staff.' },
  { icon: 'layers', title: 'One-stop solutions', text: 'One dependable partner for cleaning, staffing, maintenance and supplies.' },
  { icon: 'badge', title: 'Professionalism', text: 'Built on professional standards, proper communication and continuous improvement.' },
  { icon: 'shield', title: 'Accountability', text: 'Our reputation rests on the people we deploy and the quality we deliver.' },
];

export const industries = [
  'Residential properties', 'Corporate offices', 'Commercial spaces', 'Hotels & hospitality', 'Restaurants & cafés',
  'Salons & spas', 'Property management companies', 'Architectural & interior design firms', 'Retail businesses',
  'Private residences', 'Estates & apartment buildings', 'Construction & post-construction',
];

export const clients = [
  'Navani Salon', 'Navani Wardrobe', 'EDIBLESBYTEMI', 'Foresight Determinate Structures', 'YONÉ',
  'Ese Jones Hotel & Apartments', 'Donseal Professional Services', 'ZACE Architecture Limited', 'Groove Platform',
];

export const reviews = [
  { quote: 'Very professional, punctual and courteous staff.', name: 'One U', meta: 'Google review' },
  { quote: 'Awesome service. They are always prompt and attentive to details.', name: 'Furniture Mart', meta: 'Google review' },
  {
    quote: 'Great product. I have been coming back for the toilet wash, and it never disappoints. Good quality and definitely worth buying again.',
    name: 'Ifedolapo',
    meta: 'Google review · General housekeeping',
  },
  { quote: 'Great work ethic and customer service.', name: 'Bella Nwafor', meta: 'Google review · General housekeeping' },
  { quote: 'Very reasonable and reliable, it was nice working with Kleener Touch.', name: 'Jude Eze', meta: 'Google review · Window cleaning' },
];

export const team = [
  { src: '/images/team-4.jpg', alt: 'Three Kleener Touch staff members in uniform' },
  { src: '/images/team-2.jpg', alt: 'Kleener Touch staff at an outreach stand' },
  { src: '/images/team-1.jpg', alt: 'Kleener Touch staff member in uniform' },
  { src: '/images/team-5.jpg', alt: 'Kleener Touch housekeeper poolside' },
  { src: '/images/team-6.jpg', alt: 'Kleener Touch team member beside a service banner' },
  { src: '/images/team-3.jpg', alt: 'Kleener Touch staff member on site' },
];

export const founder = {
  name: 'Salau Philip Damilare',
  role: 'Founder / Managing Director',
  photo: '/images/founder.jpg',
  quote:
    'When you entrust someone with your home, business, project or facility, you are entrusting them with something valuable. That responsibility is never lost on us.',
  bio:
    'His professional interests span facility management, operations, quality management, project management and service delivery, and he leads Kleener Touch with a focus on structure, supervision and fairness.',
  qualifications: [
    'BSc Agricultural Engineering',
    'MSc Agricultural & Environmental Engineering',
    'Certified Facility Manager (CFM)',
    'Associate Member, Global Institute of Project Management',
    'Professional training in management',
    'Quality Assurance and Quality Control / ISO QMS certification',
  ],
};

export const bookingOptions = {
  propertyTypes: [
    'Home / apartment', 'Office', 'Hotel / hospitality', 'Restaurant / café', 'Salon / spa',
    'Retail store', 'Estate / building', 'Construction site', 'Other',
  ],
  timeWindows: [
    { value: 'Morning', hint: 'Before 12pm' },
    { value: 'Afternoon', hint: '12pm – 5pm' },
    { value: 'Flexible', hint: 'Any time' },
  ],
  frequencies: ['One-time', 'Weekly', 'Every two weeks', 'Monthly', 'Ongoing contract'],
};
