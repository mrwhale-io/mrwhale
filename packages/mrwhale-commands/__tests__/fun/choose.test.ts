import { choose } from "../../src/commands/fun";

describe("choose", () => {
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should ask the user to pass in options when no options are passed", () => {
    const result = choose.action([]);

    expect(result).toEqual("No choices have been passed.");
  });

  it("should ask the user to pass more options when less than 2 options are passed", () => {
    const result = choose.action(["Whale"]);

    expect(result).toEqual("Please pass two or more choices.");
  });

  it("should choose one of the options", () => {
    const choices = ["Apple", "Orange"];
    const response =
      choose.responses[Math.floor(Math.random() * choose.responses.length)];
    const choice = choices[Math.floor(Math.random() * choices.length)];

    const result = choose.action(choices);

    expect(result).toEqual(`${response.replace(/<<CHOICE>>/g, choice)}`);
  });
});
