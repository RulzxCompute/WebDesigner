export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export type ElementType =
  | 'section'
  | 'container'
  | 'grid'
  | 'heading'
  | 'text'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'link'
  | 'divider'
  | 'spacer'
  | 'icon';

export interface StyleProps {
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  background?: string;
  backgroundImage?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  gridColumns?: string;
  gridRows?: string;
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  borderRadius?: string;
  opacity?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  objectFit?: string;
  flexWrap?: string;
  maxWidthInner?: string;
}

export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'fadeUp'
  | 'fadeDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'hoverLift'
  | 'hoverGlow';

export interface ElementAnimation {
  type: AnimationType;
  duration?: string;
  delay?: string;
  easing?: string;
}

export interface ElementProps {
  href?: string;
  src?: string;
  alt?: string;
  level?: number;
  icon?: string;
  openInNewTab?: boolean;
}

export interface ElementNode {
  id: string;
  type: ElementType;
  name: string;
  content?: string;
  props: ElementProps;
  styles: Record<Breakpoint, StyleProps>;
  animation?: ElementAnimation;
  children: ElementNode[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  root: ElementNode[];
}

export interface ProjectTheme {
  primaryColor: string;
  fontFamily: string;
  background: string;
  textColor: string;
}

export interface ProjectSettings {
  siteTitle: string;
  siteDescription: string;
  favicon?: string;
}

export interface WebDesignerProject {
  version: number;
  name: string;
  pages: Page[];
  theme: ProjectTheme;
  assets: string[];
  settings: ProjectSettings;
  updatedAt: string;
}

export interface ExportedFile {
  path: string;
  content: string;
}
