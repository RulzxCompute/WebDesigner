import type { Page, WebDesignerProject } from '../types';
import { uid } from '../utils';
import { createElement } from '../elements/definitions';
import { TEMPLATES } from '../templates';

const STORAGE_KEY = 'webdesigner.project.v1';

export function defaultProject(): WebDesignerProject {
  const tpl = TEMPLATES[2].buildPage();
  const home: Page = { ...tpl, id: uid('page'), name: 'Home', slug: 'index' };
  return {
    version: 1,
    name: 'My Website',
    pages: [home],
    theme: {
      primaryColor: '#4f46e5',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#ffffff',
      textColor: '#111827',
    },
    assets: [],
    settings: {
      siteTitle: 'My Website',
      siteDescription: 'Built with WebDesigner — fast static website.',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function blankProject(): WebDesignerProject {
  const section = createElement('section', { name: 'Hero' });
  const box = createElement('container', { name: 'Content' });
  box.children = [
    createElement('heading', { name: 'Heading', content: 'Hello world', props: { level: 1 } }),
    createElement('paragraph', { name: 'Paragraph', content: 'Start building your page. Add sections from the left panel.' }),
    createElement('button', { name: 'Button', content: 'Click me' }),
  ];
  section.children = [box];
  return {
    version: 1,
    name: 'Untitled Website',
    pages: [
      {
        id: uid('page'),
        name: 'Home',
        slug: 'index',
        title: 'Untitled Website',
        description: '',
        root: [section],
      },
    ],
    theme: {
      primaryColor: '#4f46e5',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#ffffff',
      textColor: '#111827',
    },
    assets: [],
    settings: { siteTitle: 'Untitled Website', siteDescription: '' },
    updatedAt: new Date().toISOString(),
  };
}

export function saveLocal(project: WebDesignerProject): { ok: boolean; error?: string } {
  try {
    const payload = JSON.stringify({ ...project, updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save to this browser.' };
  }
}

export function loadLocal(): WebDesignerProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WebDesignerProject;
    if (!Array.isArray(data.pages) || !data.pages.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function parseProjectFile(text: string): { ok: boolean; project?: WebDesignerProject; error?: string } {
  try {
    const data = JSON.parse(text) as WebDesignerProject;
    if (!data || !Array.isArray(data.pages)) return { ok: false, error: 'That file is not a valid .webdesigner project (missing pages).' };
    return { ok: true, project: data };
  } catch {
    return { ok: false, error: 'Could not read that file. Make sure it is a .webdesigner JSON export.' };
  }
}

export function serializeProject(project: WebDesignerProject): string {
  return JSON.stringify(project, null, 2);
}
