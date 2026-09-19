import { createGroupConversation } from "../../src/services/conversations";
import { getUserByPhoneNumber } from "../../src/services/users";
import { collection, addDoc } from "firebase/firestore";

jest.mock("../../src/services/users");
jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("createGroupConversation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a group conversation with all found participants", async () => {
    (getUserByPhoneNumber as jest.Mock)
      .mockResolvedValueOnce({ id: "user2", phoneNumber: "+1111111111", displayName: "Bob" })
      .mockResolvedValueOnce({ id: "user3", phoneNumber: "+2222222222", displayName: "Carol" });

    (collection as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: "group1" });

    const result = await createGroupConversation(
      "user1",
      ["+1111111111", "+2222222222"],
      "Weekend Trip"
    );

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: "group",
        name: "Weekend Trip",
        participantIds: ["user1", "user2", "user3"],
      })
    );
    expect(result).toBe("group1");
  });

  it("skips phone numbers with no matching account", async () => {
    (getUserByPhoneNumber as jest.Mock)
      .mockResolvedValueOnce({ id: "user2", phoneNumber: "+1111111111", displayName: "Bob" })
      .mockResolvedValueOnce(null);

    (collection as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: "group1" });

    const result = await createGroupConversation(
      "user1",
      ["+1111111111", "+9999999999"],
      "Weekend Trip"
    );

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        participantIds: ["user1", "user2"],
      })
    );
    expect(result).toBe("group1");
  });
});