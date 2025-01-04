import { ship } from "../../src/commands/fun";

describe("Ship Command", () => {
  describe("action function", () => {
    it("should return a valid ShipResult object for two users", () => {
      const result = ship.action("Alice", "Bob");

      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("shipName");
      expect(result).toHaveProperty("percent");
      expect(result).toHaveProperty("prediction");
      expect(result).toHaveProperty("breakdown");
      expect(result).toHaveProperty("randomFact");
      expect(result).toHaveProperty("emojiScale");
    });

    it("should throw an error if the first user is missing", () => {
      expect(() => ship.action("", "Bob")).toThrow("First user is missing.");
    });

    it("should throw an error if the second user is missing", () => {
      expect(() => ship.action("Alice", "")).toThrow("Second user is missing.");
    });

    it("should be case-insensitive and trim inputs", () => {
      const result = ship.action("  Alice  ", "BOB ");
      expect(result.shipName).toBe("AliceB");
    });
  });
});
