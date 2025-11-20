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

// Debug: Check if bucket exists
(async () => {
	try {
		const { data, error } = await supabase.storage.listBuckets();
		if (error) {
			console.error("❌ Supabase Storage Error: Failed to list buckets:", error);
		} else {
			console.log("✅ Supabase Buckets:", data.map((b) => b.name));
			const bucketExists = data.find((b) => b.name === BUCKET_NAME);
			if (!bucketExists) {
				console.error(`⚠️ Bucket '${BUCKET_NAME}' does not exist! Please create it.`);
			} else {
				console.log(`✅ Bucket '${BUCKET_NAME}' found.`);
			}
		}
	} catch (err) {
		console.error("❌ Supabase Connection Error:", err.message);
	}
})();

export const uploadFile = async (fileBuffer, fileName, mimeType) => {
	if (!supabaseUrl || !supabaseKey) {
		throw new AppError("Storage service not configured", 500);
	}

	// Generate a unique path: timestamp_random_filename
	const uniqueFileName = `${Date.now()}_${Math.random()
		.toString(36)
		.substring(7)}_${fileName.replace(/\s+/g, "-")}`;

	console.log(`Uploading to ${BUCKET_NAME}/${uniqueFileName}...`);

	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(uniqueFileName, fileBuffer, {
			contentType: mimeType,
			upsert: false,
		});

	if (error) {
		console.error("Supabase Upload Error:", error);
		throw new AppError("Failed to upload image: " + error.message, 500);
	}

	// Get public URL
	const { data: publicUrlData } = supabase.storage
		.from(BUCKET_NAME)
		.getPublicUrl(uniqueFileName);

	console.log("Upload successful:", publicUrlData.publicUrl);
	return publicUrlData.publicUrl;
};
