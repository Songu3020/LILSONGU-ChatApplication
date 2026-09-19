import { signInWithPhoneNumber, ConfirmationResult, User, signOut } from "firebase/auth";
import {auth} from "./firebase";

export async function sendVerificationCode(
    phoneNumber:string,
    appVerifier:any
    ): Promise<ConfirmationResult>{
        return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    }


export async function confirmVerificationCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> {
  const result = await confirmationResult.confirm(code);
  return result.user;
}    

export async function logout(): Promise<void>{
  await signOut(auth);
}