import * as LucideIcons from 'lucide-react';

// Create a type-safe mapping of icon names to Lucide components
export const iconMap: Record<string, any> = {
  play: LucideIcons.Play,
  code: LucideIcons.Code,
  split: LucideIcons.Split,
  rss: LucideIcons.Rss,
  'git-branch': LucideIcons.GitBranch,
  'git-merge': LucideIcons.GitMerge,
  // Add more icons as needed
};

// Default icon if the specified icon is not found
export const defaultIcon = LucideIcons.Component;
