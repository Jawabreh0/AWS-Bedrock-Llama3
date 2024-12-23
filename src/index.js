require("dotenv").config();
const readline = require("readline");
const { chatWithLlama3 } = require("./services/llamaService");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You: ",
});

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
  try {
    const response = await chatWithLlama3(userMessage);
    console.log(`Llama 3: ${response}`);
  } catch (error) {
    console.error("An error occurred during the chat:", error);
  }
  rl.prompt();
}).on("close", () => {
  console.log("Conversation ended.");
  process.exit(0);
});
