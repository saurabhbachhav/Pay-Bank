"use server";
import { cookies } from "next/headers";
import { createSessionClient, createAdminClient } from "../appwrite";
import { ID } from "node-appwrite";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const response = await account.createEmailPasswordSession(email, password);

    // Set the session cookie manually
    const cookiesInstance = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    cookiesInstance.set("appwrite-session", response.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
    });

    return parseStringify(response);
  } catch (error) {
    console.log("Error : ", error);
    throw new Error("Sign-in failed");
  }
};


export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;
  try {
    // Create a User account
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    // Create the session
    const session = await account.createEmailPasswordSession(email, password);
    // Set the session cookie
    const cookiesInstance = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    cookiesInstance.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.log("Error during sign-up:", error);
    throw new Error("Sign-up failed");
  }
};

export async function getLoggedInUser() {
  
  try {

    const { account } = await createSessionClient();
    // console.log(account);
    const user = await account.get();
    return parseStringify(user);
  } catch (error) {
    console.error("Error getting logged-in user:", error);
    return null;
  }
}

// export const logoutAccount = async () => {
//   try {
//     const { account } = await createSessionClient();
//     await account.deleteSession("current");

//     const cookiesObject = await cookies(); // Await the promise
//     if (cookiesObject && typeof cookiesObject.delete === "function") {
//       cookiesObject.delete("appwrite-session");
//       return true;
//     } else {
//       console.warn("Cookies object does not support delete.");
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     throw error;
//   }
// };
export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    // Invalidate the session on the server first
    await account.deleteSession("current");

    // Only after server confirmation, delete the client-side cookie
    cookies().delete("appwrite-session");

    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error; // Handle logout errors appropriately
  }
};




