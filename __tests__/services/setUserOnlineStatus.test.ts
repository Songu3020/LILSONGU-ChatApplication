import { setUserOnlineStatus } from "../../src/services/users";
import { doc, setDoc } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("setUserOnlineStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets isOnline to true without a lastSeen update", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    await setUserOnlineStatus("user1", true);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isOnline: true }),
      { merge: true }
    );
  });

  it("sets isOnline to false along with a lastSeen timestamp", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    await setUserOnlineStatus("user1", false);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isOnline: false, lastSeen: expect.any(Number) }),
      { merge: true }
    );
  });
});