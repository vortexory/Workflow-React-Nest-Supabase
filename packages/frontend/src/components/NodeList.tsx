import { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { getNodes } from '../lib/api';
import { Component } from 'lucide-react';
import { nodeIcons, categoryIcons } from '../lib/icons';
import { INodeType } from '@workflow-automation/common';

export function NodeList() {
  const [nodes, setNodes] = useState<INodeType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await getNodes();
        setNodes(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
        setError('Failed to load nodes. Please try again later.');
      }
    };

    fetchNodes();
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: INodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType.type,
      displayName: nodeType.displayName,
      description: nodeType.description,
      icon: nodeType.icon,
      color: nodeType.color,
      inputs: nodeType.inputs,
      outputs: nodeType.outputs,
      properties: nodeType.properties,
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodesByCategory = () => {
    const categories: Record<string, INodeType[]> = {};
    nodes.forEach(node => {
      const category = node.type.split('/')[0] || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(node);
    });
    return categories;
  };

  return (
    <div className="w-64 border-l border-border bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Node List</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-6">
          {error ? (
            <p className="text-sm text-destructive p-2">{error}</p>
          ) : nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">Loading nodes...</p>
          ) : (
            Object.entries(getNodesByCategory()).map(([category, categoryNodes]) => {
              const CategoryIcon = categoryIcons[category] || Component;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon size={14} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
                  </div>
                  <div className="space-y-1">
                    {categoryNodes.map((node) => {
                      const Icon = nodeIcons[node.type] || Component;
                      return (
                        <div
                          key={node.type}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 shadow-sm cursor-move hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          draggable
                          onDragStart={(e) => onDragStart(e, node)}
                        >
                          <Icon size={14} className="text-primary shrink-0" />
                          <span className="text-sm truncate">{node.displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
