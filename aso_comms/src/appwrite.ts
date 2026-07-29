// 1. Add 'Teams' to the import list
import { Client, Databases, Storage, Account, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

// 2. Initialize the Teams service
export const teams = new Teams(client);

// IDs from .env
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
export const REPAIRS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const COMPLAINTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COMPLAINTS_COLLECTION_ID;

// 3. Export ID and Query for use in other files
export { ID, Query } from 'appwrite';

// 4. The Staff Check Function
export const getIsStaff = async () => {
  try {
    const teamList = await teams.list();
    const staffTeamId = import.meta.env.VITE_APPWRITE_STAFF_TEAM_ID;

    // Check if the user is in the team with the ID from your .env
    return teamList.teams.some(team => team.$id === staffTeamId);
  } catch (error) {
    console.error("Staff check error:", error);
    return false;
  }
};