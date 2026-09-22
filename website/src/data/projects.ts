import { ProjectItem } from "../types";

export const projectsData: ProjectItem[] = [
  {
    "id": "apex-logistics",
    "title": "Apex Global Logistics Portal",
    "category": "Business Websites",
    "client": "Apex Global Freight Ltd.",
    "description": "Corporate business website with real-time consignment tracking, responsive booking calculators, and custom Gutenberg performance blocks.",
    "techStack": [
      "WordPress",
      "TypeScript",
      "Tailwind CSS",
      "REST API",
      "Cloudflare CDN"
    ],
    "metrics": "0.6s Load Time • 3x Inquiries",
    "featuredImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    "overview": "A modernized global shipping enterprise portal replacing legacy slow infrastructure with a dynamic, multi-lingual WordPress setup engineered for instant consignment tracking and rapid freight quotation.",
    "challenge": "Apex Global Freight operated on a 7-year-old monolithic portal with 4.8s page load times, poor mobile responsiveness, and zero CRM synchronization, leading to high inquiry drop-off rates and excessive manual quote calculations.",
    "solution": "Plexivia engineered a bespoke WordPress solution featuring headless-grade API endpoints, custom lightweight Gutenberg blocks, real-time container tracking widgets, and automatic CRM dispatch via webhooks.",
    "keyFeatures": [
      "Interactive real-time shipment tracking widget",
      "Instant freight volume & route quote generator",
      "Automated CRM lead dispatch & quotation routing",
      "Multi-region global CDN deployment (<600ms TTFB)",
      "100% Mobile-first responsive booking calculator",
      "Bilingual content architecture (English & Arabic)"
    ],
    "results": [
      {
        "label": "Page Load Speed",
        "value": "0.6s"
      },
      {
        "label": "Lead Inquiries",
        "value": "+300%"
      },
      {
        "label": "Mobile Bounce Rate",
        "value": "-62%"
      },
      {
        "label": "Lighthouse Performance",
        "value": "98/100"
      }
    ],
    "duration": "4 Weeks",
    "year": "2025"
  },
  {
    "id": "lumina-luxe",
    "title": "Lumina Luxe Sustainable Fashion",
    "category": "eCommerce Stores",
    "client": "Lumina Luxe Brand",
    "description": "High-converting flagship Shopify 2.0 storefront featuring 3D product previews, dynamic bundle builders, and one-click checkout.",
    "techStack": [
      "Shopify",
      "Liquid",
      "JavaScript",
      "Tailwind CSS",
      "Klaviyo"
    ],
    "metrics": "+184% Conversion • .2M GMV",
    "featuredImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
    "overview": "A bespoke sustainable apparel flagship store engineered to maximize mobile checkout speed, visual storytelling, and average order value (AOV) across global markets.",
    "challenge": "Lumina Luxe was struggling with high cart abandonment rates (81%), bloated third-party Shopify apps causing slow mobile rendering, and an inability to showcase dynamic bundle discounts effectively.",
    "solution": "We rebuilt their entire storefront with clean native Liquid and Tailwind CSS, replacing 12 heavy third-party apps with high-speed custom code, adding instant slide-out cart drawers, swatch selectors, and personalized cross-sells.",
    "keyFeatures": [
      "Sub-second cart drawer & instant slide-out checkout",
      "Custom visual swatch & dynamic variant selector",
      "Multi-currency & automatic localization engine",
      "Dynamic bundle & tiered discount calculator",
      "Direct Instagram feed & verified UGC review sync",
      "Automated abandoned checkout recovery funnels"
    ],
    "results": [
      {
        "label": "Conversion Rate",
        "value": "+184%"
      },
      {
        "label": "Annual GMV",
        "value": ".2M+"
      },
      {
        "label": "Average Order Value (AOV)",
        "value": "+38%"
      },
      {
        "label": "Mobile Checkout Speed",
        "value": "0.8s"
      }
    ],
    "duration": "3 Weeks",
    "year": "2025"
  },
  {
    "id": "novaflow-crm",
    "title": "NovaFlow Cloud Operations ERP",
    "category": "Web Applications",
    "client": "NovaFlow Tech Systems",
    "description": "Scalable SaaS web application for collaborative project management, real-time telemetry metrics, and team resource scheduling.",
    "techStack": [
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "TypeScript",
      "Tailwind CSS"
    ],
    "metrics": "15,000+ Active Users • 99.99% Uptime",
    "featuredImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    "overview": "Enterprise cloud dashboard with sub-100ms API response times, role-based access control (RBAC), and dynamic interactive SVG charts for enterprise engineering workflows.",
    "challenge": "NovaFlow required a high-concurrency cloud control plane capable of handling thousands of real-time WebSocket telemetry streams without UI freeze or state synchronization bottlenecks.",
    "solution": "Plexivia architected a modular Next.js and Node.js microservice architecture with optimistic UI updates, virtualized Kanban boards, automated PDF report generators, and Stripe subscription billing.",
    "keyFeatures": [
      "Real-time WebSocket event streaming & notifications",
      "Virtualized Kanban, Gantt, and tabular data views",
      "Role-based granular permission matrices (RBAC)",
      "Automated high-res PDF & CSV analytics export",
      "Stripe recurring subscription & usage-based metering",
      "Encrypted client API key vault & audit trail logs"
    ],
    "results": [
      {
        "label": "Active Daily Users",
        "value": "15,000+"
      },
      {
        "label": "Platform Uptime",
        "value": "99.99%"
      },
      {
        "label": "Average API Latency",
        "value": "<85ms"
      },
      {
        "label": "Data Processing Speed",
        "value": "4x Faster"
      }
    ],
    "duration": "6 Weeks",
    "year": "2025"
  },
  {
    "id": "pulsehealth-portal",
    "title": "PulseCare Telehealth Diagnostic Suite",
    "category": "Custom Digital Solutions",
    "client": "PulseCare Medical Network",
    "description": "Custom HIPAA-compliant digital solution connecting verified practitioners with patients through encrypted video consults and scheduling.",
    "techStack": [
      "Next.js",
      "TypeScript",
      "Node.js",
      "WebRTC",
      "Tailwind CSS",
      "PostgreSQL"
    ],
    "metrics": "100% HIPAA Compliant • 4.9★ App Rating",
    "featuredImage": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    "overview": "A patient-first healthcare ecosystem replacing cumbersome paper workflows with instant online consultation scheduling, peer-to-peer WebRTC video, and secure digital prescription records.",
    "challenge": "PulseCare needed to modernize their telehealth infrastructure to comply with stringent HIPAA encryption standards while guaranteeing crystal-clear video quality on low-bandwidth rural connections.",
    "solution": "We engineered an adaptive bitrate WebRTC consultation suite with end-to-end encryption, automated SMS/WhatsApp appointment reminders, digital prescription signatures, and unified doctor scheduling.",
    "keyFeatures": [
      "End-to-end encrypted WebRTC peer-to-peer video",
      "Automated SMS, WhatsApp & Email reminders",
      "Digital prescription issuance & pharmacy dispatch",
      "Multi-clinic scheduling & doctor availability calendar",
      "Full HIPAA compliance & audit logging security",
      "One-click patient health record history access"
    ],
    "results": [
      {
        "label": "Regulatory Compliance",
        "value": "100% HIPAA"
      },
      {
        "label": "Patient Satisfaction",
        "value": "4.9 / 5.0"
      },
      {
        "label": "No-Show Rate",
        "value": "-74%"
      },
      {
        "label": "Consultation Setup Time",
        "value": "<5 Seconds"
      }
    ],
    "duration": "5 Weeks",
    "year": "2025"
  }
];
