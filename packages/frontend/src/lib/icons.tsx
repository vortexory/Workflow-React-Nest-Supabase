import { 
  LucideIcon,
  Boxes,
  PlayCircle,
  Rss,
  BrainCircuit,
  GitMerge,
  SplitSquareVertical,
  Code2,
  SplitSquareHorizontal
} from 'lucide-react';

export const nodeIcons: Record<string, LucideIcon> = {
  'manual-trigger': PlayCircle,
  'function': Code2,
  'split-batches': SplitSquareHorizontal,
  'rss-feed': Rss,
  'openai': BrainCircuit,
  'merge': GitMerge,
  'if': SplitSquareVertical,
};

export const categoryIcons: Record<string, LucideIcon> = {
  'Trigger': PlayCircle,
  'Input': Rss,
  'Transform': Code2,
  'Organization': Boxes,
};
