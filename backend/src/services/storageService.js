import { createClient } from "@supabase/supabase-js";
import AppError from "../utils/appError.js";

// Initialize Supabase client
// Use service role key for backend operations to bypass RLS if needed
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.warn("⚠️ Supabase credentials missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "uploads"; // Ensure this bucket exists in Supabase

export const uploadFile = async (fileBuffer, fileName, mimeType) => {
	if (!supabaseUrl || !supabaseKey) {
		throw new AppError("Storage service not configured", 500);
	}

	// Generate a unique path: timestamp_random_filename
	const uniqueFileName = `${Date.now()}_${Math.random()
		.toString(36)
		.substring(7)}_${fileName.replace(/\s+/g, "-")}`;

	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(uniqueFileName, fileBuffer, {
			contentType: mimeType,
			upsert: false,
		});

	if (error) {
		console.error("Supabase Upload Error:", error);
		throw new AppError("Failed to upload image", 500);
	}

	// Get public URL
	const { data: publicUrlData } = supabase.storage
		.from(BUCKET_NAME)
		.getPublicUrl(uniqueFileName);

	return publicUrlData.publicUrl;
};
