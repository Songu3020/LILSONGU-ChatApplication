import { subscribeToMessages } from "../../src/services/messages";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("subscribeToMessages", () => {
  it("calls the callback with messages from the snapshot, ordered by time", () => {
    const fakeMessage = {
      id: "msg1",
      conversationId: "conv1",
      senderId: "user1",
      text: "Hello!",
      createdAt: 1000,
    };

    const fakeSnapshot = {
      docs: [
        {
          id: "msg1",
          data: () => ({
            senderId: "user1",
            text: "Hello!",
            createdAt: 1000,
          }),
        },
      ],
    };

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback(fakeSnapshot);
      return jest.fn();
    });

    const mockCallback = jest.fn();
    subscribeToMessages("conv1", mockCallback);

    expect(mockCallback).toHaveBeenCalledWith([
      { id: "msg1", conversationId: "conv1", senderId: "user1", text: "Hello!", createdAt: 1000 },
    ]);
  });
});