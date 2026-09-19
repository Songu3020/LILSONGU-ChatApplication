import { createUserIfNotExists, getUser, getUserByPhoneNumber } from "../../src/services/users";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("../../src/services/firebase", () => ({
  db: {},
}));

describe("createUserIfNotExists", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user document if one does not already exist", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    await createUserIfNotExists("user1", "+19075551234");

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "user1",
        phoneNumber: "+19075551234",
      }),
    );
  });

  it("does not overwrite an existing user document", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    await createUserIfNotExists("user1", "+19075551234");

    expect(setDoc).not.toHaveBeenCalled();
  });
});

describe("getUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the user data if the document exists", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: "user1",
        phoneNumber: "+19075551234",
        displayName: "Alice",
      }),
    });

    const result = await getUser("user1");

    expect(result).toEqual({
      id: "user1",
      phoneNumber: "+19075551234",
      displayName: "Alice",
    });
  });

  it("returns null if the user does not exist", async () => {
    (doc as jest.Mock).mockReturnValue({});
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

    const result = await getUser("user1");

    expect(result).toBeNull();
  });
});

describe("getUserByPhoneNumber", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the user if a matching phone number is found", async () => {
    (collection as jest.Mock).mockReturnValue({});
    (query as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "user2",
          data: () => ({
            phoneNumber: "+19075551234",
            displayName: "Bob",
          }),
        },
      ],
    });

    const result = await getUserByPhoneNumber("+19075551234");

    expect(result).toEqual({
      id: "user2",
      phoneNumber: "+19075551234",
      displayName: "Bob",
    });
  });

  it("returns null if no matching user is found", async () => {
    (collection as jest.Mock).mockReturnValue({});
    (query as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

    const result = await getUserByPhoneNumber("+10000000000");

    expect(result).toBeNull();
  });
});
