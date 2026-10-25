import type { ResumeInput } from "./schema.ts";

// Edit this content, then run pnpm --filter @acme/resume pdf.
export default {
  name: "Robert Molina",
  target: "STAFF FULL-STACK SOFTWARE ENGINEER",
  contact: {
    email: "rmolinamir@gmail.com",
    location: "Orlando, FL",
    website: "https://www.robertmolina.dev",
  },
  summary:
    "I'm a staff full-stack software engineer building checkout products, cloud services, and shared engineering platforms. I lead architecture decisions, mentor engineers, and build shared tools used across teams. My work spans quality, performance, domain-driven design, and AI-assisted development.",
  roles: [
    {
      company: "PayPal",
      location: "Remote",
      title: "Staff Software Engineer (MTS1)",
      dates: "Feb 2025 - Present",
      bullets: [
        "Shipped new checkout experiences across frontend and Node.js/GraphQL services. Single-click Pay in 4 generated $23M annualized incremental total payment volume (TPV) and lifted checkout conversion 11\u00a0basis\u00a0points. Cashback-card recommendations represented approximately\u00a0$14M annualized TPV.",
        "Led technical delivery of a PayPal buy now, pay later (BNPL)-only checkout flow for Google's Pixel launch. The flow represents an estimated\u00a0$2.16M in annualized TPV.",
        "Architected and built a TypeScript analytics framework and integrated it into multiple PayPal applications. Added OpenTelemetry adapters, self-service event documentation, and machine-readable schemas that AI agents can access for downstream triage and analysis.",
        "Implemented region-based code splitting, automatic chunk discovery, and selective prefetching in a shared feature-flags SDK. Reduced bundle sizes by approximately\u00a010-20%, depending on region, by excluding features unavailable in that region.",
        "Built Web Devtools that multiple organizations within PayPal use. Published agent skills for AI-assisted Next.js integration. Wrote onboarding guides and mentored engineers across frontend and backend delivery.",
      ],
    },
    {
      company: "PayPal",
      location: "Remote",
      title: "Senior Software Engineer",
      dates: "Sep 2023 - Feb 2025",
      bullets: [
        "Led technical decisions for a Next.js checkout rewrite across performance, personalization, and reliability. Reduced P95 first-page load time from over\u00a0six\u00a0seconds to about\u00a0three\u00a0seconds through server-side processing and streaming.",
        "Built and maintained checkout web servers and backend-for-frontend (BFF) services. Integrated authentication, protected routes, and session management for all PayPal Checkout experiences.",
        "Delivered last-used payment method recommendations, including an ad-blocker compatibility fix. The feature reached full rollout in 2025.",
      ],
    },
    {
      company: "Olympusat",
      location: "West Palm Beach, FL",
      title: "Software Engineer",
      dates: "Feb 2020 - Sep 2023",
      bullets: [
        "Built an internal Node.js SDK that reduced third-party vendor integration time from months to two weeks.",
        "Built event-driven services following Domain-Driven Design principles. The services processed thousands of events daily. Used idempotent handlers, dead-letter queues, event replay, and transactional outboxes.",
        "Designed GraphQL and REST APIs with OpenAPI specifications, schema governance, and versioning. Built reusable React microfrontends that multiple teams used.",
        "Automated deployments of serverless services on AWS with AWS CDK. Added monitoring through CloudWatch and Elasticsearch.",
      ],
      pageBreak: true,
    },
    {
      company: "BridgeforBillions",
      location: "Remote",
      title: "Software Engineer",
      dates: "Apr 2019 - Feb 2020",
      bullets: [
        "Served as a founding engineer and delivered application, mentor-matching, and market-testing workflows for entrepreneurs.",
        "Built React and Redux interfaces and Python APIs with Django REST Framework, delivering features from requirements through production. Added Sentry for error monitoring.",
      ],
    },
    {
      company: "Servify",
      location: "Remote",
      title: "Junior Software Engineer (Intern)",
      dates: "Sep 2018 - Apr 2019",
      bullets: [
        "Built React applications with Redux and Redux-Saga and backend services with Node.js on Google Cloud Platform.",
        "Integrated OAuth 2.0 Authorization Code flows with Proof Key for Code Exchange (PKCE).",
      ],
    },
    {
      company: "Bonpreu Foods",
      location: "Fort Lauderdale, FL",
      title: "Junior Software Engineer (Intern)",
      dates: "Jun 2018 - Sep 2018",
      bullets: [
        "Built an e-commerce application with MongoDB, Express, React, and Node.js. Integrated Stripe payments, subscriptions, billing webhooks, Cloudinary media services, and transactional email.",
      ],
    },
    {
      company: "Unilever",
      location: "Carabobo, Venezuela",
      title: "Industrial Engineer",
      dates: "Mar 2017 - Jun 2018",
      bullets: [
        "Automated manufacturing reports and dashboards for plant leadership. Analyzed downtime and Overall Equipment Efficiency (OEE) to identify production issues.",
      ],
    },
  ],
  skills: [
    {
      label: "Languages",
      items: "TypeScript, JavaScript, Python, Java, SQL.",
    },
    {
      label: "Frontend",
      items: "React, Next.js, Tailwind CSS, Redux, Storybook.",
    },
    {
      label: "Backend",
      items:
        "Node.js, NestJS, Django REST Framework, Spring Boot, GraphQL, tRPC.",
    },
    {
      label: "Databases",
      items:
        "PostgreSQL, MySQL, Amazon Aurora, Amazon DynamoDB, MongoDB, Redis.",
    },
    {
      label: "Cloud and platforms",
      items:
        "AWS, Google Cloud Platform (GCP), AWS CDK, GitHub Actions, Jenkins, Harness.",
    },
    {
      label: "Testing and observability",
      items:
        "Vitest, Jest, Playwright, Mock Service Worker (MSW), Datadog, OpenTelemetry, Sentry.",
    },
  ],
  education: {
    date: "Jul 2017",
    degree: "Bachelor of Mechanical Engineering",
    location: "Valencia, Carabobo, Venezuela",
    school: "University of José Antonio Páez",
    thesis:
      "Thesis: Developed a predictive model in Python and MATLAB to analyze how weld defects affect tensile strength in AISI 1010 steel.",
  },
} satisfies ResumeInput;
