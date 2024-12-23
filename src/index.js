const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// Initialize the Bedrock Runtime client
const client = new BedrockRuntimeClient({ region: "us-west-2" });

// Set the model ID for Meta's Llama 3
const modelId = "meta.llama3-70b-instruct-v1:0";

// Function to send a message to Llama 3 and receive a response
async function chatWithLlama3(userMessage) {
  // Format the prompt for Llama 3
  const prompt = `
  <|begin_of_text|><|start_header_id|>user<|end_header_id|>
  ${userMessage}
  <|eot_id|>
  <|start_header_id|>assistant<|end_header_id|>
  `;

  // Prepare the request payload
  const requestPayload = {
    prompt,
    max_gen_len: 512,
    temperature: 0.5,
    top_p: 0.9,
  };

  // Create the request
  const request = new InvokeModelCommand({
    modelId,
    body: JSON.stringify(requestPayload),
    contentType: "application/json",
  });

  try {
    // Send the request to Bedrock Runtime
    const response = await client.send(request);

    // Parse and extract the response text
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText = responseBody.generation || "No response generated.";

    console.log("Llama 3 Response:", responseText);
  } catch (error) {
    console.error("Error invoking Llama 3:", error);
  }
}

// Example usage
const userMessage =
  'Describe the purpose of a "hello world" program in one line.';
chatWithLlama3(userMessage);
