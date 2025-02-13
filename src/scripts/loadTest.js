import http from "k6/http";
import { check, sleep } from "k6";
import { randomItem } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Sample test data
const testMessages = [
  "Hello, how are you?",
  "What's the weather like?",
  "Tell me a story",
  "What's your favorite color?",
  "Can you help me with something?",
];

const characters = [
  "Sherlock Holmes",
  "Harry Potter",
  "Iron Man",
  "Batman",
  "Spider-Man",
];

export const options = {
  vus: 50, // Number of virtual users
  duration: "10s", // Test duration
};

export default function () {
  const url = "http://localhost:3002/chat"; // Change to your API URL

  // Select random character and message
  const randomCharacter = randomItem(characters);
  const randomMessage = randomItem(testMessages);

  const payload = JSON.stringify({
    character: randomCharacter,
    user_message: randomMessage,
    clientId: `user-${Math.floor(Math.random() * 1000)}`, // Random client ID
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Send request
  const res = http.post(url, payload, params);

  // Validate response
  check(res, {
    "Status is 200": (r) => r.status === 200,
    "Response time is below 1000ms": (r) => r.timings.duration < 1000,
  });

  // Wait a bit before sending another request
  sleep(1);
}
