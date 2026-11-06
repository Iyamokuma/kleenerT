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
  { href: '#leadership', label: 'Leadership' },
];

export const stats = [
  { value: 2024, label: 'Full operations commenced', from: 2000 },
  { value: 20, suffix: '+', label: 'Permanent staff' },
  { value: 10, suffix: '+', label: 'Contract staff' },
  { value: 98, suffix: '%+', label: 'Customer retention' },
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
  { title: 'Accountability', text: 'We own our commitments and keep improving our delivery.' },
  { title: 'Customer Focus', text: 'We listen, respond and solve practical needs.' },
  { title: 'Fairness', text: 'Clients and skilled professionals deserve fair, respectful treatment.' },
  { title: 'Reliability', text: 'Facility services are essential — we aim to be dependable.' },
  { title: 'Excellence', text: 'Better people, processes and standards for better outcomes.' },
];

export const services = [
  {
    id: 'cleaning',
    tab: 'Cleaning',
    icon: 'sparkle',
    title: 'Professional Cleaning Services',
    intro:
      'Cleaning solutions designed to maintain clean, healthy, organized and presentable environments. Our approach goes beyond simply removing dirt — we don’t just clean, we organize while at it.',
    items: [
      'Residential cleaning', 'Office & commercial cleaning', 'Deep cleaning', 'Move-in & move-out cleaning',
      'Post-construction cleaning', 'Regular cleaning', 'Subscription cleaning', 'Upholstery cleaning',
      'Couch & mattress cleaning', 'Rug & carpet cleaning', 'Floor & tile cleaning', 'Specialized cleaning',
    ],
    image: { src: '/images/bedroom-finish.jpg', alt: 'Freshly cleaned and organized bedroom' },
  },
  {
    id: 'janitorial',
    tab: 'Janitorial & Housekeeping',
    icon: 'users',
    title: 'Janitorial & Housekeeping Outsourcing',
    intro:
      'We help organizations and property owners recruit, deploy and manage reliable janitors and housekeepers — so you can focus on your core activities while we manage day-to-day workforce requirements.',
    items: [
      'Janitor recruitment & deployment', 'Housekeeper recruitment & deployment', 'Staff replacement',
      'Staff supervision', 'Attendance & performance monitoring', 'Training & onboarding', 'Quality control',
    ],
    image: { src: '/images/cleaning-mop.jpg', alt: 'Kleener Touch janitor mopping a floor' },
  },
  {
    id: 'facility',
    tab: 'Facility Management',
    icon: 'building',
    title: 'Facility Management',
    intro: 'Keeping buildings and facilities functional, safe, organized and properly maintained. Our goal is simple: Keep It Working.',
    items: [
      'Facility operations management', 'Facility & staff management', 'Preventive maintenance coordination',
      'Corrective maintenance coordination', 'Plumbing services', 'Electrical services', 'Painting', 'Carpentry',
      'General repairs & maintenance', 'Cleaning & environmental services', 'Vendor & contractor coordination',
    ],
    image: { src: '/images/post-construction.jpg', alt: 'Post-construction clean-up in progress' },
  },
  {
    id: 'pest',
    tab: 'Pest Control',
    icon: 'shield',
    title: 'Pest Control & Fumigation',
    intro: 'Professional pest management solutions for residential, commercial and hospitality environments.',
    items: [
      'Fumigation', 'Pest control', 'Preventive pest management', 'Follow-up pest treatment',
      'Scheduled pest control', 'Quarterly pest-control retainerships',
    ],
    image: { src: '/images/hero.jpg', alt: 'Kleener Touch team with sprayers and treatment equipment' },
  },
  {
    id: 'supplies',
    tab: 'Equipment & Supplies',
    icon: 'box',
    title: 'Cleaning Equipment & Supplies',
    intro:
      'We provide and procure cleaning products, equipment and consumables for clients — including our own Kleener Touch toilet wash and multipurpose liquid soap.',
    items: [
      'Cleaning chemicals', 'Toilet wash', 'Multipurpose liquid soap', 'Cleaning tools', 'Wet & dry vacuum cleaners',
      'Upholstery cleaning equipment', 'Floor-cleaning equipment', 'Cleaning consumables', 'Other facility equipment & materials',
    ],
    image: { src: '/images/products.jpg', alt: 'Kleener Touch branded toilet wash and liquid soap products' },
  },
];

export const gallery = [
  { src: '/images/bedroom-finish.jpg', alt: 'Finished bedroom after a Kleener Touch clean', caption: 'Residential finish', area: 'a' },
  { src: '/images/cleaning-mop.jpg', alt: 'Janitor mopping a floor', caption: 'Janitorial', area: 'b' },
  { src: '/images/post-construction.jpg', alt: 'Post-construction cleaning', caption: 'Post-construction', area: 'c' },
  { src: '/images/vacuum.jpg', alt: 'Wet and dry vacuum cleaner', caption: 'Equipment supply', area: 'd' },
  { src: '/images/housekeeping.jpg', alt: 'Housekeeping staff at work', caption: 'Housekeeping', area: 'e' },
  { src: '/images/products.jpg', alt: 'Kleener Touch cleaning products', caption: 'Kleener Touch products', area: 'f' },
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
    'He holds a B.Tech in Agricultural Engineering from Ladoke Akintola University of Technology, Ogbomoso, and an M.Sc in Agricultural and Environmental Engineering from the University of Ibadan. His professional interests span facility management, operations, quality management, project management and service delivery.',
  credentials: [
    { title: 'Certified Facility Manager (CFM)', date: 'May 2022' },
    { title: 'Associate Member, Global Institute of Project Management', date: 'May 2022' },
    { title: 'QA/QC · ISO QMS Certified', date: 'June 2023' },
    { title: 'Data Analysis Workshop, Centre for Management Development', date: 'Nov 2019' },
  ],
};

export const bookingOptions = {
  propertyTypes: [
    'Home / apartment', 'Office', 'Hotel / hospitality', 'Restaurant / café', 'Salon / spa',
    'Retail store', 'Estate / building', 'Construction site', 'Other',
  ],
  timeWindows: ['Morning', 'Afternoon', 'Flexible'],
  frequencies: ['One-time', 'Weekly', 'Every two weeks', 'Monthly', 'Ongoing contract'],
};
