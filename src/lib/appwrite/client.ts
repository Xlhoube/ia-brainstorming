import { Client, Databases, Account } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6ad53e750013ac9f2271';

export const appwriteClient = new Client();

if (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  appwriteClient.setEndpoint(endpoint).setProject(projectId);
}

export const appwriteDatabases = new Databases(appwriteClient);
export const appwriteAccount = new Account(appwriteClient);

export const APPWRITE_CONFIG = {
  endpoint,
  projectId,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ia_brainstorming',
  collectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'debates',
};
