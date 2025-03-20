import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkflows } from "../lib/api";
import { IWorkflow } from "@workflow-automation/common";

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [activeStates, setActiveStates] = useState<{ [key: string]: boolean }>({});
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({});

  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data);

      const initialStates = data.reduce((acc: { [key: string]: boolean }, workflow: IWorkflow) => {
        acc[workflow.id] = workflow.active ?? false;
        return acc;
      }, {} as { [key: string]: boolean });

      setActiveStates(initialStates);
    } catch (error) {
      console.error("Error loading workflows:", error);
    }
  };

  const toggleActive = (id: string) => {
    setActiveStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMenu = (id: string) => {
    setMenuOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <button
          onClick={() => navigate("/editor")}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Create New
        </button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer bg-background relative"
          >
            <div>
              <h2 className="font-medium">{workflow.name}</h2>
              <p className="text-sm text-muted-foreground">
                Created {new Date(workflow.createdAt!).toLocaleDateString()}
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {workflow.nodes.length} nodes
            </div>

            <div className="flex items-center text-[#909298] gap-3">
              <p className="border-2 text-[12px] px-1 border-[#909298] rounded-[4px]">
                Owned by me
              </p>

              {/* Toggle Active Button */}
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive(workflow.id);
                }}
              >
                <p>{activeStates[workflow.id] ? "Active" : "Inactive"}</p>
                <div
                  className={`w-[30px] h-[15px] relative p-[1px] rounded-[10px] transition-all ${
                    activeStates[workflow.id] ? "bg-green-500" : "bg-[#909298]"
                  }`}
                >
                  <div
                    className={`w-[13px] h-[13px] bg-white rounded-full absolute top-[1px] transition-all ${
                      activeStates[workflow.id] ? "right-[1px]" : "left-[1px]"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Ellipsis Button for Dropdown */}
              <div
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(workflow.id);
                }}
              >
                <svg
                  className="w-[10px] h-[10px] cursor-pointer"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 192 512"
                >
                  <path
                    fill="#d9dde7"
                    d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"
                  />
                </svg>

                {/* Dropdown Menu */}
                {menuOpen[workflow.id] && (
                  <div className="absolute right-0 top-6 w-40 bg-white shadow-md rounded-lg border z-10">
                    <ul className="text-sm">
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/editor/${workflow.id}`)}
                      >
                        Open
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Share
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Duplicate
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Move
                      </li>
                      <li className="px-4 py-2 text-red-500 hover:bg-red-100 cursor-pointer">
                        Delete
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {workflows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No workflows yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
