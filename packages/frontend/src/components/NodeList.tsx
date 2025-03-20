import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getNodes } from "../lib/api";
import { iconMap, defaultIcon } from "../lib/icons";
import { Search } from "lucide-react";

interface NodeDefinition {
  type: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  inputs: Array<{
    name: string;
    type: string;
    required?: boolean;
  }>;
  outputs: Array<{
    name: string;
    type: string;
  }>;
  properties: Array<{
    name: string;
    type: string;
    required?: boolean;
    default?: any;
  }>;
}

export function NodeList() {
  const [nodes, setNodes] = useState<NodeDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await getNodes();
        setNodes(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch nodes:", error);
        setError("Failed to load nodes. Please try again later.");
      }
    };

    fetchNodes();
  }, []);

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    node: NodeDefinition
  ) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(node));
    event.dataTransfer.effectAllowed = "move";
  };

  const getNodesByCategory = () => {
    const categories: Record<string, NodeDefinition[]> = {};
    nodes.forEach((node) => {
      const category = node.type.split("/")[0] || "Uncategorized";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(node);
    });
    return categories;
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const nodeCategories = getNodesByCategory();

  return (
    <div className="w-64 border-l border-border bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Node List</h2>
      </div>
      <div className="relative p-4">
        <Search className="absolute left-7 top-6 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-6">
          {Object.entries(nodeCategories).map(([category, categoryNodes]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-semibold capitalize">{category}</h3>
              <div className="grid grid-cols-1 gap-2">
                {categoryNodes
                  .filter((node) =>
                    node.displayName.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((node) => {
                    const Icon = node.icon && iconMap[node.icon] ? iconMap[node.icon] : defaultIcon;
                    return (
                      <div
                        key={node.type}
                        className="flex items-center gap-3 p-2 rounded-md border border-border bg-background cursor-move hover:bg-accent/50 transition-colors"
                        draggable
                        onDragStart={(e) => onDragStart(e, node)}
                        title={node.description}
                      >
                        <Icon size={20} style={{ color: node.color || "#64748b" }} />
                        <span className="text-sm">{node.displayName}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
