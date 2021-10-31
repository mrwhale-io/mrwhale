import { coin } from "../../src/commands/fun";

describe("coin", () => {
  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should return heads", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.6);
    const result = coin.action();

    expect(result).toBe("🎲 Heads!");
  });

  it("should return tails", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.4);
    const result = coin.action();

    expect(result).toBe("🎲 Tails!");
  });
});
