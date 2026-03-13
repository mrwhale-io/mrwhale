import { conchshell } from "../../src/commands/fun";

describe("ConchShell Command", () => {
  // Mock Math.random for consistent testing
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5); // Always returns the middle response
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return a default response for a valid question", () => {
    const question = "Is this a valid question?";
    const response = conchshell.action(question);

    expect(response).toMatch(/^🐚 .+/); // Ensures response starts with a shell emoji
  });

  it("should handle 'what to do' questions correctly", () => {
    const question = "What should I do?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Nothing.");
  });

  it("should respond appropriately to 'Will I get married?' questions", () => {
    const question = "Will I ever get married?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Maybe someday.");
  });

  it("should handle 'or' questions correctly", () => {
    const question = "Pizza or Tacos?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Neither.");
  });

  it("should respond with 'Follow your heart' for life advice questions", () => {
    const question = "How should I make this decision?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Follow your heart.");
  });



  it("should handle 'treasure' questions with a custom response", () => {
    const question = "Where is the treasure?";
    const response = conchshell.action(question);

    expect(response).toBe(
      "🐚 Treasure? You mean my secret stash? Keep dreaming."
    );
  });

  it("should handle 'whale' questions with a custom response", () => {
    const question = "What about Mr. Whale?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Mr. Whale is wise and wonderful. Trust his guidance.");
  });

  it("should reject empty questions", () => {
    const question = "";
    const response = conchshell.action(question);

    expect(response).toBe(
      "🐚 You must ask the magic conch shell a question, like 'Will I find treasure?'"
    );
  });

  it("should reject overly long questions", () => {
    const question = "A".repeat(201); // 201 characters long
    const response = conchshell.action(question);

    expect(response).toBe(
      "🐚 Your question is too long. The conch is confused. Try a shorter question."
    );
  });

  it("should return a personality response 15% of the time", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.1); // Simulate a personality response
    const question = "Am I cool?";
    const response = conchshell.action(question);

    expect(response).toMatch(/^🐚 .+/); // Starts with the shell emoji
    expect(response).toMatch(/(Why do you bother me|feeling mysterious|ocean spirits)/); // Matches personality responses
  });

  it("should handle case-insensitive input", () => {
    const question = "wHaT sHoUlD I dO?";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Nothing.");
  });

  it("should handle inputs with extra spaces gracefully", () => {
    const question = "    Will I ever   get   married?    ";
    const response = conchshell.action(question);

    expect(response).toBe("🐚 Maybe someday.");
  });
});
