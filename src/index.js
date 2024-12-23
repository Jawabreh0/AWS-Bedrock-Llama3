require("dotenv").config();
const readline = require("readline");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You: ",
});

let conversationHistory = [];

async function chatWithLlama3(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  let prompt = "<|begin_of_text|>";
  conversationHistory.forEach((message) => {
    const roleTag = message.role === "user" ? "user" : "assistant";
    prompt += `<|start_header_id|>${roleTag}<|end_header_id|>\n${message.content}\n<|eot_id|>\n`;
  });
  prompt += "<|start_header_id|>assistant<|end_header_id|>\n";

  const requestPayload = {
    prompt,
    max_gen_len: 512,
    temperature: 0.5,
    top_p: 0.9,
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
    console.log(`Llama 3: ${responseText}`);
    conversationHistory.push({ role: "assistant", content: responseText });
  } catch (error) {
    console.error("Error invoking Llama 3:", error);
  }
}

console.log(
  'Start chatting with Llama 3! Type "exit" to end the conversation.'
);
rl.prompt();

rl.on("line", async (line) => {
  const userMessage = line.trim();
  if (userMessage.toLowerCase() === "exit") {
    rl.close();
    return;
  }
  await chatWithLlama3(userMessage);
  rl.prompt();
}).on("close", () => {
  console.log("Conversation ended.");
  process.exit(0);
});
