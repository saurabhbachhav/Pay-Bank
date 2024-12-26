"use server";
import { cookies } from "next/headers";
import { createSessionClient, createAdminClient } from "../appwrite";
import { ID } from "node-appwrite";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { Languages } from "lucide-react";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

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

export const signUp = async ({password , ...userData}: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  let newUserAccount;

  try {
    // Create a User account
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) {
      throw new Error("Error crating user");
    }

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: "personal",
    });
    // console.log("Bro Your dwollaCustomerUrlis here ::: Comming Here >>>>>");
    // console.log(dwollaCustomerUrl);
    if (!dwollaCustomerUrl)
      throw new Error("Error IN Creating Dwolla Customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const nreUsre = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
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

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user?.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);
    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.log("Error in CreateLink :", error);
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    );
    return parseStringify(bankAccount);
  } catch (error) {
    console.log("Error: ", error);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const accountResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountResponse.data.accounts[0];

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(
      request
    );
    const processorToken = processorTokenResponse.data.processor_token;

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user?.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error;

    await createBankAccount({
      userId: user?.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");
    return {
      publicTokenExchange: "Complete",
    };
  } catch (error) {
    console.error("An error occurred while creating exchanging token :", error);
  }
};
