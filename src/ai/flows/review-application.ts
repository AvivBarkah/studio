'use server';

/**
 * @fileOverview An AI-powered tool that reviews online application forms and advises administrators on completeness and legibility.
 *
 * - reviewApplication - A function that handles the application review process.
 * - ReviewApplicationInput - The input type for the reviewApplication function.
 * - ReviewApplicationOutput - The return type for the reviewApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewApplicationInputSchema = z.object({
  formData: z.record(z.any()).describe('The application form data as a JSON object.'),
  documentDataUris: z
    .array(z.string())
    .describe(
      'An array of data URIs for uploaded documents, each including a MIME type and Base64 encoding. Expected format: [\