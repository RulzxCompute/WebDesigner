import type { ElementNode, Page } from '../types';
import { uid } from '../utils';
import { createElement } from '../elements/definitions';

function pageBase(name: string, slug: string, title: string, description: string, root: ElementNode[]): Page {
  return { id: uid('page'), name, slug, title, description, root };
}

function navHeader(brand: string): ElementNode {
  const section = createElement('section', {
    name: 'Header',
    styles: {
      desktop: { background: '#ffffff', borderBottom: '1px solid #e5e7eb', paddingTop: '16px', paddingBottom: '16px', width: '100%' },
      tablet: {},
      mobile: {},
    },
  });
  const box = createElement('container', {
    name: 'Header Wrap',
    styles: {
      desktop: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as never,
      tablet: {},
      mobile: {},
    },
  });
  box.children = [
    createElement('heading', {
      name: 'Brand',
      content: brand,
      props: { level: 3 },
      styles: { desktop: { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '0px' }, tablet: {}, mobile: {} },
    }),
    createElement('button', {
      name: 'Header CTA',
      content: 'Contact',
      props: { href: '#contact' },
      styles: {
        desktop: { background: '#111827', color: '#fff', borderRadius: '8px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', fontSize: '14px' },
        tablet: {},
        mobile: {},
      },
    }),
  ];
  section.children = [box];
  return section;
}

function hero(title: string, subtitle: string, cta: string): ElementNode {
  const section = createElement('section', {
    name: 'Hero',
    styles: {
      desktop: { background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)', paddingTop: '88px', paddingBottom: '88px', textAlign: 'center', width: '100%' },
      tablet: {},
      mobile: { paddingTop: '56px', paddingBottom: '56px' },
    },
  });
  const box = createElement('container', { name: 'Hero Content' });
  box.children = [
    createElement('heading', {
      name: 'Hero Heading',
      content: title,
      props: { level: 1 },
      styles: { desktop: { fontSize: '52px', fontWeight: '800', color: '#0f172a', textAlign: 'center' }, tablet: { fontSize: '40px' }, mobile: { fontSize: '30px' } },
      animation: { type: 'fadeUp', duration: '0.7s', delay: '0s', easing: 'ease-out' },
    }),
    createElement('paragraph', {
      name: 'Hero Sub',
      content: subtitle,
      styles: { desktop: { fontSize: '18px', color: '#475569', textAlign: 'center', marginBottom: '28px' }, tablet: {}, mobile: {} },
      animation: { type: 'fadeUp', duration: '0.7s', delay: '0.1s', easing: 'ease-out' },
    }),
    createElement('button', {
      name: 'Hero CTA',
      content: cta,
      props: { href: '#contact' },
      styles: { desktop: { background: '#4f46e5', color: '#fff', borderRadius: '12px', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', fontWeight: '700' }, tablet: {}, mobile: {} },
    }),
  ];
  section.children = [box];
  return section;
}

function twoCol(title: string, body: string, img: string): ElementNode {
  const section = createElement('section', { name: 'About' });
  const box = createElement('container', {
    name: 'About Wrap',
    styles: { desktop: { display: 'grid', gridColumns: '1fr 1fr', gap: '40px', alignItems: 'center' } as never, tablet: {}, mobile: { gridColumns: '1fr' } as never },
  });
  box.children = [
    createElement('container', {
      name: 'About Text',
      children: [
        createElement('heading', { name: 'About Title', content: title, props: { level: 2 } }),
        createElement('paragraph', { name: 'About Body', content: body }),
      ],
    }),
    createElement('image', { name: 'About Image', props: { src: img, alt: title } }),
  ];
  section.children = [box];
  return section;
}

function featuresRow(): ElementNode {
  const section = createElement('section', { name: 'Features', styles: { desktop: { background: '#ffffff', width: '100%' }, tablet: {}, mobile: {} } });
  const box = createElement('container', { name: 'Features Wrap' });
  const grid = createElement('grid', { name: 'Feature Grid' });
  grid.children = [
    { icon: 'zap', t: 'Fast', d: 'Static output loads instantly anywhere.' },
    { icon: 'palette', t: 'Designed', d: 'Clean layout with full style control.' },
    { icon: 'mobile', t: 'Responsive', d: 'Looks great on desktop and mobile.' },
  ].map((f, i) =>
    createElement('container', {
      name: `Card ${i + 1}`,
      styles: { desktop: { border: '1px solid #e5e7eb', borderRadius: '14px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', background: '#f8fafc' }, tablet: {}, mobile: {} },
      children: [
        createElement('icon', { name: `Icon ${i + 1}`, props: { icon: f.icon } }),
        createElement('heading', { name: `Card H ${i + 1}`, content: f.t, props: { level: 3 }, styles: { desktop: { fontSize: '20px' }, tablet: {}, mobile: {} } }),
        createElement('paragraph', { name: `Card P ${i + 1}`, content: f.d }),
      ],
    }),
  );
  box.children = [createElement('heading', { name: 'Features Title', content: 'Why choose us', props: { level: 2 } }), grid];
  section.children = [box];
  return section;
}

function footer(): ElementNode {
  const section = createElement('section', { name: 'Footer', styles: { desktop: { background: '#0f172a', paddingTop: '32px', paddingBottom: '32px', width: '100%' }, tablet: {}, mobile: {} } });
  const box = createElement('container', { name: 'Footer Wrap' });
  box.children = [
    createElement('text', { name: 'Footer Text', content: '© 2026 — Built with WebDesigner', styles: { desktop: { color: '#cbd5e1', textAlign: 'center', fontSize: '14px' }, tablet: {}, mobile: {} } }),
  ];
  section.children = [box];
  return section;
}

export interface TemplateMeta {
  key: string;
  label: string;
  description: string;
  buildPage: () => Page;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    key: 'personal-portfolio',
    label: 'Personal Portfolio',
    description: 'Photo, bio, and selected work',
    buildPage: () =>
      pageBase('Home', 'index', 'Alex Morgan — Designer', 'Personal portfolio', [
        navHeader('Alex Morgan'),
        hero('Hi, I am Alex — I design calm, clear interfaces', 'Product designer based in Berlin. I help startups ship websites people love.', 'View my work'),
        twoCol('About me', 'I have spent 8 years crafting websites, brands, and design systems. Currently open for freelance projects.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop'),
        featuresRow(),
        footer(),
      ]),
  },
  {
    key: 'dev-portfolio',
    label: 'Developer Portfolio',
    description: 'Projects, stack, contact',
    buildPage: () =>
      pageBase('Home', 'index', 'Jane Dev — Software Engineer', 'Developer portfolio', [
        navHeader('jane.dev'),
        hero('I build fast, accessible web apps', 'Full-stack developer specializing in React, TypeScript, and static sites.', 'See projects'),
        featuresRow(),
        twoCol('About', 'I love open source, clean code, and shipping. Find me on GitHub.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop'),
        footer(),
      ]),
  },
  {
    key: 'product-landing',
    label: 'Product Landing Page',
    description: 'Hero, features, CTA',
    buildPage: () =>
      pageBase('Home', 'index', 'Acme — Ship faster', 'Product landing page', [
        navHeader('Acme'),
        hero('Ship your product faster', 'Acme gives your team everything needed to launch in days, not months.', 'Try it free'),
        featuresRow(),
        twoCol('Built for speed', 'Static hosting, instant deploys, and analytics-ready pages.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop'),
        footer(),
      ]),
  },
  {
    key: 'business-landing',
    label: 'Simple Business Landing',
    description: 'Services + contact',
    buildPage: () =>
      pageBase('Home', 'index', 'Bright Studio — Creative Agency', 'Business landing', [
        navHeader('Bright Studio'),
        hero('We help local businesses grow online', 'Websites, branding, and marketing that actually convert visitors into customers.', 'Get a quote'),
        featuresRow(),
        footer(),
      ]),
  },
  {
    key: 'event',
    label: 'Event Page',
    description: 'Date, schedule, RSVP',
    buildPage: () =>
      pageBase('Home', 'index', 'DesignConf 2026', 'Event page', [
        navHeader('DesignConf'),
        hero('DesignConf 2026 — Sept 12, Jakarta', 'One day of talks, workshops, and networking for designers and makers.', 'Get tickets'),
        twoCol('About the event', 'Join 500+ designers for a full day of inspiration, practical workshops, and new friends.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop'),
        featuresRow(),
        footer(),
      ]),
  },
  {
    key: 'bio-link',
    label: 'Personal Profile / Bio',
    description: 'Links + profile',
    buildPage: () =>
      pageBase('Home', 'index', '@you — links', 'Bio links page', [
        (() => {
          const s = createElement('section', { name: 'Bio', styles: { desktop: { textAlign: 'center', paddingTop: '64px', width: '100%' }, tablet: {}, mobile: {} } });
          const b = createElement('container', { name: 'Bio Wrap', styles: { desktop: { maxWidth: '480px' }, tablet: {}, mobile: {} } });
          b.children = [
            createElement('image', { name: 'Avatar', props: { src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80&auto=format&fit=crop', alt: 'Avatar' }, styles: { desktop: { width: '120px', height: '120px', borderRadius: '9999px', marginLeft: 'auto', marginRight: 'auto' }, tablet: {}, mobile: {} } }),
            createElement('heading', { name: 'Name', content: '@yourname', props: { level: 1 }, styles: { desktop: { fontSize: '28px', textAlign: 'center' }, tablet: {}, mobile: {} } }),
            createElement('paragraph', { name: 'Bio', content: 'Designer • Writer • Maker', styles: { desktop: { textAlign: 'center' }, tablet: {}, mobile: {} } }),
            createElement('button', { name: 'Link 1', content: 'My portfolio', props: { href: '#' } }),
            createElement('spacer', { name: 'Gap' }),
            createElement('button', { name: 'Link 2', content: 'Follow on X', props: { href: '#' }, styles: { desktop: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }, tablet: {}, mobile: {} } }),
          ];
          s.children = [b];
          return s;
        })(),
        footer(),
      ]),
  },
];

export function getTemplate(key: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.key === key);
}
