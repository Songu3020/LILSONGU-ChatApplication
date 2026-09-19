import { subscribeToConversations } from "../../src/services/conversations";
import { onSnapshot, collection, query, where } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("subscribeToConversations", () => {
  it("calls the callback with conversations from the snapshot", () => {
    const fakeConversation = {
      id: "conv1",
      type: "direct",
      participantIds: ["user1", "user2"],
      lastMessageText: "hi",
      lastMessageAt: 1000,
    };

    const fakeSnapshot = {
      docs: [
        {
          id: "conv1",
          data: () => ({
            type: "direct",
            participantIds: ["user1", "user2"],
            lastMessageText: "hi",
            lastMessageAt: 1000,
          }),
        },
      ],
    };

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback(fakeSnapshot);
      return jest.fn();
    });

    const mockCallback = jest.fn();
    subscribeToConversations("user1", mockCallback);

    expect(mockCallback).toHaveBeenCalledWith([fakeConversation]);
  });
});