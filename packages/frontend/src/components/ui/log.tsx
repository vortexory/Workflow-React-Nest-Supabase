import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { getExecutionLogs } from "../../lib/api";
// import { IWorkflow } from "@workflow-automation/common";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Filter } from "lucide-react";
interface Execution {
  id: string;
  workflowId: string;
  status: "running" | "completed" | "failed" | "stopped";
  nodeResults: Record<string, any>;
  createdAt: string;
  endTime: string;
  startTime: string;
}

const LogScreen = () => {
  const { id } = useParams();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadExecutions();
  }, [id]);

  const loadExecutions = async () => {
    try {
      const data = await getExecutionLogs(id!);
      setExecutions(data);
    } catch (error) {
      console.error("Error loading executions:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "Succeeded in";
      case "failed":
        return "Error in";
      case "running":
        return "Running in";
      case "stopped":
        return "Stopped in";
      default:
        return null;
    }
  };
  const getDuration = (execution: Execution) => {
    if (!execution.startTime || !execution.endTime) return "0.001s"; // Ensure both timestamps exist
    const durationInSeconds = (
      (new Date(execution.endTime).getTime() -
        new Date(execution.startTime).getTime()) /
      1000
    ).toFixed(3);
    return `${durationInSeconds}s`;
  };

  console.log(executions, "asdlfjlasjdlfjalsjdflk");

  return (
    <div className="w-[400px] h-full">
      {/* Log screen */}
      <div
        id="Log"
        className={`w-full h-full bg-gradient-to-l bg-white border-2 py-4 pl-2 z-20 `}
      >
        {/* Left sidebar with execution history */}
        <div className="w-full h-full bg-muted/10">
          <h2 className="text-[20px] font-semibold text-gray-500">
            Executions
          </h2>
          <div className="flex items-center space-x-4">
            {/* Auto Refresh Checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="w-4 h-4 accent-red-500"
              />
              <span className="text-gray-700 font-medium">Auto refresh</span>
            </label>

            {/* Filters Button */}
            <button className="flex items-center space-x-2 border px-3 py-1.5 rounded-md shadow-sm text-gray-700 hover:bg-gray-100">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(90vh-100px)] mt-[10px]">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className={`px-4 border-l-[5px] flex justify-between items-center py-2 hover:bg-[lightblue] cursor-pointer ${
                  execution.status === "completed"
                    ? "border-green-500"
                    : execution.status === "failed"
                      ? "border-red-500"
                      : ""
                }`}
              >
                <div>
                  <div className="text-[16px] font-semibold text-gray-900">
                    {`${format(new Date(execution.createdAt), "d MMM")} at ${format(new Date(execution.createdAt), "HH:mm:ss")}`}
                  </div>
                  <div
                    className={`text-xs ${execution.status === "failed" ? "text-red-500" : "text-gray-500"}`}
                  >
                    {getStatusIcon(execution.status)} {getDuration(execution)}
                  </div>
                </div>
                <div className="flex">
                  {execution.status === "failed" && (
                    <svg
                      className="svg-inline--fa fa-redo fa-w-16 _medium_1pnjy_9 h-[14px] w-[14px] mr-1"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="redo"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        className=""
                        fill="#ff7461"
                        d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"
                      ></path>
                    </svg>
                  )}
                  <svg
                    className="svg-inline--fa fa-flask fa-w-14 _icon_1hja4_67 _manual_1hja4_83 el-tooltip__trigger el-tooltip__trigger w-[14px] h-[14px]"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="flask"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      className=""
                      fill="#525356"
                      d="M437.2 403.5L320 215V64h8c13.3 0 24-10.7 24-24V24c0-13.3-10.7-24-24-24H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h8v151L10.8 403.5C-18.5 450.6 15.3 512 70.9 512h306.2c55.7 0 89.4-61.5 60.1-108.5zM137.9 320l48.2-77.6c3.7-5.2 5.8-11.6 5.8-18.4V64h64v160c0 6.9 2.2 13.2 5.8 18.4l48.2 77.6h-172z"
                    ></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogScreen;
