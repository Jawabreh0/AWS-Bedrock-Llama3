require("dotenv").config();
const readline = require("readline");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-west-2",
});

let conversationHistory = [];

async function chatWithLlama3_1({
  userMessage,
  maxGenLen = 100,
  temperature = 0.5,
  topP = 0.9,
}) {
  conversationHistory.push({ role: "user", content: userMessage });

  const functionDefinition = {
    functions: [
      {
        name: "fetchData",
        description: "Fetches data from a specified URL.",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to fetch data from.",
            },
          },
          required: ["url"],
        },
      },
    ],
  };

  const prompt = {
    system: functionDefinition,
    conversation: conversationHistory,
  };

  const requestPayload = {
    prompt: JSON.stringify(prompt),
    max_gen_len: maxGenLen,
    temperature,
    top_p: topP,
  };

  const request = new InvokeModelCommand({
    modelId: "meta.llama3-70b-instruct-v1:0",
    body: JSON.stringify(requestPayload),
    contentType: "application/json",
  });

  try {
    const response = await client.send(request);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText = responseBody.generation || "No response generated.";

    conversationHistory.push({ role: "assistant", content: responseText });

    if (responseBody.function_call) {
      const { function_name, arguments: functionArgs } =
        responseBody.function_call;
      console.log(
        `Model is requesting to call function: ${function_name} with arguments: ${JSON.stringify(
          functionArgs
        )}`
      );

      let functionResult;
      if (function_name === "fetchData") {
        const { url } = functionArgs;
        functionResult = await fetchDataFromAPI(url);
      } else {
        functionResult = `Function ${function_name} is not implemented.`;
      }

      conversationHistory.push({
        role: "function",
        content: JSON.stringify(functionResult),
      });

      return await chatWithLlama3_1({ userMessage: functionResult });
    }

    return responseText;
  } catch (error) {
    console.error("Error invoking Llama 3.1:", error);
    throw error;
  }
}

async function fetchDataFromAPI(url) {
  console.log(`Fetching data from ${url}`);
  // Implement your data fetching logic here, e.g., using axios or node-fetch
  // For demonstration, returning a mock response
  return { data: `Fetched data from ${url}` };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You: ",
});

console.log(
  'Start chatting with Llama 3.1! Type "exit" to end the conversation.'
);
rl.prompt();

rl.on("line", async (line) => {
  const userMessage = line.trim();
  if (userMessage.toLowerCase() === "exit") {
    rl.close();
    return;
  }
  try {
    const response = await chatWithLlama3_1({ userMessage });
    console.log(`Llama 3.1: ${response}`);
  } catch (error) {
    console.error("An error occurred during the chat:", error);
  }
  rl.prompt();
}).on("close", () => {
  console.log("Conversation ended.");
  process.exit(0);
});
