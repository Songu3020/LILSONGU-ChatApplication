import { sendMessage } from "../../src/services/messages";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("sendMessage", () => {
  it("adds a message document to the conversation's messages subcollection", async () => {
    (collection as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: "msg1" });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    await sendMessage("conv1", "user1", "Hello!");

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        senderId: "user1",
        text: "Hello!",
      })
    );
  });

  it("updates the conversation's lastMessageText and lastMessageAt", async () => {
    (collection as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: "msg1" });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    await sendMessage("conv1", "user1", "Hello!");

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lastMessageText: "Hello!",
      })
    );
  });
});