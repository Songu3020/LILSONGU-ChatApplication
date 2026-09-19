import {
  sendVerificationCode,
  confirmVerificationCode,
} from "../../src/services/auth";
import { signInWithPhoneNumber } from "firebase/auth";

jest.mock("firebase/auth");
jest.mock("../../src/services/firebase", () => ({
  auth: {},
}));

describe("sendVerificationCode", () => {
  it("calls Firebase's signInWithPhoneNumber with the phone number and verifier", async () => {
    const mockConfirmationResult = { verificationId: "fake-id-123" };
    (signInWithPhoneNumber as jest.Mock).mockResolvedValue(
      mockConfirmationResult,
    );

    const fakeAppVerifier = {} as any;
    const result = await sendVerificationCode("+19075551234", fakeAppVerifier);

    expect(signInWithPhoneNumber).toHaveBeenCalledWith(
      expect.anything(),
      "+19075551234",
      fakeAppVerifier,
    );
    expect(result).toBe(mockConfirmationResult);
  });
});

describe("confirmVerificationCode", () => {
  it("calls confirm on the confirmation result with the code and returns the user", async () => {
    const fakeUser = { uid: "abc123", phoneNumber: "+19075551234" };
    const mockConfirm = jest.fn().mockResolvedValue({ user: fakeUser });
    const fakeConfirmationResult = { confirm: mockConfirm } as any;

    const result = await confirmVerificationCode(
      fakeConfirmationResult,
      "123456",
    );

    expect(mockConfirm).toHaveBeenCalledWith("123456");
    expect(result).toBe(fakeUser);
  });
});
