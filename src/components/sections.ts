export type SectionKey = 'about' | 'work' | 'ai' | 'oss' | 'experience' | 'cv';

export const SECTIONS: { key: SectionKey; label: string; href: string; color: string }[] = [
  { key: 'about', label: 'About', href: '/#hero', color: 'blue' },
  { key: 'work', label: 'Selected work', href: '/#work', color: 'purple' },
  { key: 'ai', label: 'AI & Claude', href: '/#ai', color: 'orange' },
  { key: 'oss', label: 'Open source', href: '/#oss', color: 'green' },
  { key: 'experience', label: 'Experience', href: '/#experience', color: 'pink' },
  { key: 'cv', label: 'CV', href: '/cv/', color: 'teal' },
];
