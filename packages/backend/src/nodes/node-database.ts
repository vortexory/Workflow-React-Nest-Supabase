import * as vm from 'vm';
import * as Parser from 'rss-parser';

interface Context{
  currentIndex: number;
  noItemsLeft: boolean;
}

// Sample context object
const sampleContext: Context = {
  currentIndex: 0,
  noItemsLeft: false,
};

// Example usage of sampleContext
console.log("Sample Context:", sampleContext);

export const nodeDatabase: Record<string,{ execute: (data: any) => Promise<any> }> = {
  "trigger/executeTrigger": {
    execute: async (data) => {
        const isTriggerEnabled = data.settings.triggerEnabled ?? true;
      console.log("Executing Trigger Node:", data);
      if(!isTriggerEnabled) {
        return { success: true, output: null };
      }else{
        return { success: true, output: "Triggered" };
      }
      
    },
  },
  "transform/function": {
    execute: async (data) => {
      console.log("Executing Function Node:", data);
      // Simulate function execution
      if (!data.settings?.code) {
        throw new Error("No code provided for Function Node");
      }
      const input = data.input || {};
      const sandbox = {input, result:null, console} 
      const code = "result = [\n  {\n    json: {\n      url: \"https://dev.to/feed/n8n\"\n    }\n  },\n  {\n    json: {\n      url: \"https://medium.com/feed/n8n-io\"\n    }\n  }\n];";
      // const code = data.settings.code;
      const context = vm.createContext(sandbox) 
      try {
       new Function(code);
       vm.runInContext(code, context);   
       if(sandbox.result){
        return { success: true, output: sandbox.result };
         }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  "input/rssFeedRead": {
  execute: async (data) => {
    console.log("Executing in RssFeedRead Node:", data);
    const parser = new Parser();
    const limit = data.settings?.limit || 10;

    // Create an array to store the results for each input
    const results = [];

    // Iterate over each input in the data.input array
    for (let i = 0; i < data.input.length; i++) {
      const input = data.input[i];
      
      // Extract the URL from the current input
      // const url = input.json.url;
      const url = "https://dev.to/feed/n8n";

      // Parse the feed for the current URL
      const feed = await parser.parseURL(url);

      // Slice the feed items and map them
      const feeds = feed.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content,
      }));

      // Add the result with the "input arrangement number"
      results.push({
        inputIndex: i,  // This is the "arrangement number" (index)
        feeds,
      });
    }
    const output = results

    // Return the results with the success status
    return { success: true, output, context:data.context };
  },
},

 "organization/splitInBatches": {
  execute: async (data) => {
    console.log("Executing Split in Batches Node:", data);


    const batchSize = data.settings?.batchSize || 10;
    const input = data.input || []; // Input array
    const context: Context = data.context || { currentIndex: 0, noItemsLeft: false }; // Initialize context if not provided
    if (!Array.isArray(input)) {
      throw new Error("Input must be an array for Split in Batches Node");
    }

    // Get the current batch based on the currentIndex
    const batch = input.slice(context.currentIndex, context.currentIndex + 1);
    console.log("Current Batch:", batch);
    // Check if this is the last batch
    const noItemsLeft = context.currentIndex + batchSize >= input.length;
   

    // Update context
    const updatedContext: Context = {
      currentIndex: context.currentIndex + batchSize-1,
      noItemsLeft,
    };
    return {
      success: true,
      output: batch, // Current batch
      context: updatedContext, // Updated context
    };
  },
},
  "transform/mergeData": {
    execute: async (data) => {
      console.log("Executing Merge Data Node:", data);

      const inputs = data.input || [];
      const properties = data.settings || {};
      const mergeType = properties.mergeType || "combine";
      console.log(mergeType);

      // Validate inputs
      if (!Array.isArray(inputs) || inputs.length === 0) {
        throw new Error('Input "inputs" must be a non-empty array.');
      }

      // Validate mergeType
      if (!['combine', 'overwrite'].includes(mergeType)) {
        throw new Error('Invalid "mergeType". Allowed values are "combine" or "overwrite".');
      }

      let output;
      if (mergeType === 'combine') {
        if (inputs.every(item => Array.isArray(item))) {
          console.log("You are faced in Combine mode!");
          output = inputs.flat();
        } else if (inputs.every(item => typeof item === 'object' && !Array.isArray(item))) {
          console.log("You are in another types")
          // Combine objects
          output = inputs.reduce((acc, item) => {
            for (const key in item) {
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(item[key]);
            }
            return acc;
          }, {});
        } else {
          throw new Error('For "combine", all inputs must be arrays or objects.');
        }
      } else if (mergeType === 'overwrite') {
        // For "overwrite", return the last input
        output = inputs[inputs.length - 1];
      }
      return { success: true, output: output };
    }
    
  },
 "transform/if": {
  execute: async (data) => {
    console.log("Executing IF Node:", data);
    
    // Get condition and input from data
    const condition = data.settings?.condition || "false"; // Default to "false" if not provided
    

    if (!condition || typeof condition !== "string") {
      throw new Error("Invalid or missing condition for IF Node.");
    }

    // Context initialization for handling evaluation state
    const context = data.context || { currentIndex: 0, noItemsLeft: false };

    // Extract the current input item based on context

    const currentItem = data.input[0];
    // Guard against out-of-bound errors
    if (!currentItem) {
      return {
        success: true,
        output: null,
        context: { ...context, noItemsLeft: true }, // Update context to signal completion
      };
    }
    try {
      const result = true

      const updatedContext = {
        currentIndex: context.currentIndex + 1,
        noItemsLeft: context.currentIndex + 1 >= data.input.length,
      };
      // Return based on condition evaluation
      if (result) {
        return { success: true, output: currentItem, condition: true,  context: updatedContext };
      } else {
        return { success: true, output: currentItem, condition: false, context: updatedContext };
      }
    } catch (error) {
      return { success: false, error: `Error evaluating condition: ${error.message}` };
    }
  },
}
}