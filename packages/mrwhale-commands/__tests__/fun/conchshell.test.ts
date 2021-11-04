import { conchshell } from "../../src/commands/fun";

describe("conchshell", () => {
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should say to ask a question when empty value is passed", () => {
    const result = conchshell.action("");

    expect(result).toBe("Ask the magic conch shell a question.");
  });

  it("should return a random answer", () => {
    const question = "Are you are a whale?";
    const result = conchshell.action(question);

    expect(result).toBe("🐚 I don't think so.");
  });

  it("should answer '🐚 Maybe someday.' when MARRIED_REGEX is matched", () => {
    const question = "Will I ever get married?";
    const result = conchshell.action(question);

    expect(result).toBe("🐚 Maybe someday.");
  });

  it("should answer '🐚 Nothing.' when WHAT_TO_DO_REGEX is matched", () => {
    const question = "What should we do to get out of the kelp forest?";
    const result = conchshell.action(question);

    expect(result).toBe("🐚 Nothing.");
  });
});
