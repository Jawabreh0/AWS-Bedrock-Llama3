require("dotenv").config();
const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

let conversationHistory = [];

async function chatWithStreamLlama3({
  userMessage,
  max_gen_len,
  temperature,
  top_p,
}) {
  conversationHistory.push({ role: "user", content: userMessage });

  let prompt = "<|begin_of_text|>";
  conversationHistory.forEach((message) => {
    const roleTag = message.role === "user" ? "user" : "assistant";
    prompt += `<|start_header_id|>${roleTag}<|end_header_id|>\n${message.content}\n<|eot_id|>\n`;
  });
  prompt += "<|start_header_id|>assistant<|end_header_id|>\n";

  const requestPayload = {
    prompt,
    max_gen_len,
    temperature,
    top_p,
  };

  const request = new InvokeModelWithResponseStreamCommand({
    modelId: "meta.llama3-70b-instruct-v1:0",
    body: JSON.stringify(requestPayload),
    contentType: "application/json",
  });

  try {
    const response = await client.send(request);
    let responseText = "";

    for await (const event of response.body) {
      const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      if (chunk.generation) {
        process.stdout.write(chunk.generation);
        responseText += chunk.generation;
      }
    }

    conversationHistory.push({ role: "assistant", content: responseText });
    return responseText;
  } catch (error) {
    console.error("Error invoking Llama 3:", error);
    throw error;
  }
}

module.exports = { chatWithStreamLlama3 };
