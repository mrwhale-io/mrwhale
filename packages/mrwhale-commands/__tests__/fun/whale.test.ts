import { whale } from "../../src/commands/fun";

describe("whale", () => {
  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should return a whale face", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5);
    const size = 5;

    const result = whale.action(size);

    expect(result).toEqual(" ͡⎚_____ ͡⎚");
  });
});
