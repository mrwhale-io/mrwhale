import { calculate } from "../../src/commands/useful";

describe("calculate", () => {
  it("should calculate expression", () => {
    const result = calculate.action("sin(45 deg) ^ 2");

    expect(result).toEqual("0.4999999999999999");
  });

  it("should ask to enter a calculation if expression is empty", () => {
    const result = calculate.action("");

    expect(result).toEqual("Please enter a calculation.");
  });
});
