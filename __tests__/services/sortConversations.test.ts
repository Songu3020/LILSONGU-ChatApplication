import { sortConversationsByRecent } from "../../src/services/conversations";
import { Conversation } from "../../src/types";

describe("sortConversationsByRecent", () => {
  it("sorts conversations with the most recent lastMessageAt first", () => {
    const older: Conversation = {
      id: "1",
      type: "direct",
      participantIds: ["a", "b"],
      lastMessageText: "hi",
      lastMessageAt: 1000,
    };

    const newer: Conversation = {
      id: "2",
      type: "direct",
      participantIds: ["a", "c"],
      lastMessageText: "hey",
      lastMessageAt: 2000,
    };

    const result = sortConversationsByRecent([older, newer]);

    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("1");
  });
});