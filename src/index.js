require("dotenv").config();
const readline = require("readline");
const { chatWithLlama3 } = require("./services/llamaService");
const { chatWithStreamLlama3 } = require("./services/llamaStreamService");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let chatFunction;

function askPreference() {
  return new Promise((resolve) => {
    rl.question("Do you prefer streaming responses? (yes/no): ", (answer) => {
      const preference = answer.trim().toLowerCase();
      if (preference === "yes" || preference === "y") {
        chatFunction = chatWithStreamLlama3;
      } else {
        chatFunction = chatWithLlama3;
      }
      resolve();
    });
  });
}

async function startChat() {
  await askPreference();
  console.log(
    'Start chatting with Llama 3! Type "exit" to end the conversation.'
  );
  rl.setPrompt("You: ");
  rl.prompt();

  rl.on("line", async (line) => {
    const userMessage = line.trim();
    if (userMessage.toLowerCase() === "exit") {
      rl.close();
      return;
    }
    try {
      const response = await chatFunction({
        userMessage,
        max_gen_len: 100,
        temperature: 0.5,
        top_p: 0.9,
      });
      if (chatFunction === chatWithLlama3) {
        console.log(`Llama 3: ${response}`);
      }
    } catch (error) {
      console.error("An error occurred during the chat:", error);
    }
    rl.prompt();
  }).on("close", () => {
    console.log("Conversation ended.");
    process.exit(0);
  });
}

startChat();
