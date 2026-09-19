import { findOrCreateConversation } from "../../src/services/conversations";
import { getUserByPhoneNumber } from "../../src/services/users";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

jest.mock("../../src/services/users");
jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("findOrCreateConversation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null if the target phone number has no account", async () => {
    (getUserByPhoneNumber as jest.Mock).mockResolvedValue(null);

    const result = await findOrCreateConversation("user1", "+10000000000");

    expect(result).toBeNull();
  });

  it("creates a new conversation if the user exists but no conversation is found", async () => {
    (getUserByPhoneNumber as jest.Mock).mockResolvedValue({
      id: "user2",
      phoneNumber: "+19075551234",
      displayName: "Bob",
    });
    (collection as jest.Mock).mockReturnValue({});
    (query as jest.Mock).mockReturnValue({});
    (where as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
    (addDoc as jest.Mock).mockResolvedValue({ id: "newConv1" });

    const result = await findOrCreateConversation("user1", "+19075551234");

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: "direct",
        participantIds: ["user1", "user2"],
      })
    );
    expect(result).toBe("newConv1");
  });
});