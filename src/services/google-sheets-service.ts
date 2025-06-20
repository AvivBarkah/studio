
'use server';

import { google, type sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import type { ApplicationFormData, ReviewApplicationOutput } from '@/types';

// Define the structure of the data to be sent to Google Sheets
// This helps in type-checking and structuring the data passed to appendToSpreadsheet
export interface SheetRowData {
  applicationId: string;
  submissionTimestamp: string; // ISO string e.g. new Date().toISOString()
  personalDetails: ApplicationFormData['personalDetails'];
  academicHistory: ApplicationFormData['academicHistory'];
  parentGuardianInfo: ApplicationFormData['parentGuardianInfo'];
  applicationStatus: string;
  aiReviewSummary?: string;
  aiNeedsHumanAttention?: boolean;
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;
const GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;

async function getAuth() {
  console.log("Attempting to get Google Sheets authentication...");
  if (!GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING) {
    console.error("GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING is not set in environment variables.");
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING is not set in environment variables. Please provide the content of your service account JSON key.");
  }
  
  let credentials;
  try {
    credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING);
    console.log("Successfully parsed GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING.");
  } catch (e: any) {
    console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", e.message);
    throw new Error(`Failed to parse service account credentials. Ensure it's a valid JSON string. Error: ${e.message}`);
  }

  if (!credentials.client_email || !credentials.private_key) {
    console.error("Service account credentials JSON is missing client_email or private_key.");
    throw new Error("Service account credentials JSON is missing client_email or private_key.");
  }

  try {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log("Google Sheets JWT auth object created successfully.");
    return auth;
  } catch (e: any) {
    console.error("Error creating JWT auth object:", e.message);
    throw new Error(`Failed to create JWT auth object. Error: ${e.message}`);
  }
}

const sheets = google.sheets('v4');

// IMPORTANT: The order of values in this array MUST match the header row in your Google Sheet.
// Suggested Header Row (Ensure this matches your sheet exactly):
// Application ID, Submission Date, Full Name, NISN, Gender, Birth Place, Birth Date, Address, Phone Number,
// Previous School, Graduation Year, Average Score, Father's Name, Father's Occupation, Mother's Name, Mother's Occupation,
// Guardian's Name, Guardian's Occupation, Parent/Guardian Phone, Application Status, AI Review Summary, AI Needs Human Attention
function mapDataToRow(data: SheetRowData): any[] {
  return [
    data.applicationId,
    new Date(data.submissionTimestamp).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    data.personalDetails.fullName,
    data.personalDetails.nisn || '',
    data.personalDetails.gender,
    data.personalDetails.birthPlace,
    data.personalDetails.birthDate ? new Date(data.personalDetails.birthDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    data.personalDetails.address,
    data.personalDetails.phoneNumber || '',
    data.academicHistory.previousSchool,
    data.academicHistory.graduationYear,
    data.academicHistory.averageScore !== undefined && data.academicHistory.averageScore !== null ? data.academicHistory.averageScore : '',
    data.parentGuardianInfo.fatherName,
    data.parentGuardianInfo.fatherOccupation || '',
    data.parentGuardianInfo.motherName,
    data.parentGuardianInfo.motherOccupation || '',
    data.parentGuardianInfo.guardianName || '',
    data.parentGuardianInfo.guardianOccupation || '',
    data.parentGuardianInfo.parentPhoneNumber,
    data.applicationStatus,
    data.aiReviewSummary || '',
    data.aiNeedsHumanAttention !== undefined && data.aiNeedsHumanAttention !== null ? (data.aiNeedsHumanAttention ? 'Ya' : 'Tidak') : '',
  ];
}

export async function appendToSpreadsheet(data: SheetRowData): Promise<void> {
  console.log(`Attempting to append data to Google Sheet for Application ID: ${data.applicationId}`);
  if (!SPREADSHEET_ID || !SHEET_NAME) {
    console.warn("Spreadsheet ID (SPREADSHEET_ID) or Sheet Name (SHEET_NAME) is not configured in environment variables. Skipping Google Sheets append.");
    return; 
  }
  console.log(`Using SPREADSHEET_ID: ${SPREADSHEET_ID}, SHEET_NAME: ${SHEET_NAME}`);

  try {
    const auth = await getAuth();
    const valuesToAppend = [mapDataToRow(data)];
    console.log("Data mapped to row for Google Sheets:", JSON.stringify(valuesToAppend));

    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME, 
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: valuesToAppend,
      },
      auth: auth,
    };

    console.log("Sending request to Google Sheets API...");
    await sheets.spreadsheets.values.append(request);
    console.log('Data appended to Google Sheet successfully for Application ID:', data.applicationId);
  } catch (error: any) {
    console.error(`Error appending data to Google Sheet for Application ID: ${data.applicationId}. Error: ${error.message}`, error.stack);
    // Log the error but do not throw to prevent breaking the main application flow.
    // User experience should not be blocked if Sheets integration fails.
  }
}
