import { ship } from "../../src/commands/fun";

describe("ship", () => {
  it("should ship two given users", () => {
    const firstUser = "Mr. Whale";
    const secondUser = "Mrs. Whale";

    const result = ship.action(firstUser, secondUser);

    expect(result).toBe("💘 There's a 80% match between Mr. Whale and Mrs. Whale 💘");
  });

  it("should return message saying first user is missing", () => {
    const firstUser = "";
    const secondUser = "Mrs. Whale";

    const result = ship.action(firstUser, secondUser);

    expect(result).toBe("First user is missing.");
  });

  it("should return message saying second user is missing", () => {
    const firstUser = "Mr. Whale";
    const secondUser = "";

    const result = ship.action(firstUser, secondUser);

    expect(result).toBe("Second user is missing.");
  });
});
