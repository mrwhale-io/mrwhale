import { roll } from "../../src/commands/fun";

describe("roll", () => {
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should roll random dice value", () => {
    const result = roll.action([]);

    expect(result).toEqual(`🎲 You rolled a 1`);
  });

  it("should roll random dice value within range of passed number", () => {
    const result = roll.action(["50"]);

    expect(result).toEqual(`🎲 You rolled a 7`);
  });

  it("should roll the correct number of dice", () => {
    const result = roll.action(["5 d10"]);

    expect(result).toEqual(`🎲 You rolled a 2,2,2,2,2`);
  });
});
