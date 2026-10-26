export type SectionKey = 'about' | 'work' | 'ai' | 'oss' | 'stack';

export const SECTIONS: { key: SectionKey; label: string; href: string; color: string }[] = [
  { key: 'about', label: 'About', href: '/#hero', color: 'blue' },
  { key: 'work', label: 'Selected work', href: '/#work', color: 'purple' },
  { key: 'ai', label: 'AI & Claude', href: '/#ai', color: 'orange' },
  { key: 'oss', label: 'Open source', href: '/#oss', color: 'green' },
  { key: 'stack', label: 'Stack', href: '/#stack', color: 'teal' },
];
