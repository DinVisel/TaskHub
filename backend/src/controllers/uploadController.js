import { supabase } from "../utils/supabaseClient.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "uploads/" }); // temp folder

export const uploadMiddleware = upload.single("file");

// POST /api/upload
export const uploadFile = asyncHandler(async (req, res, next) => {
	if (!req.file) return next(new AppError("No file uploaded", 400));

	const filePath = req.file.path;
	const fileExt = req.file.originalname.split(".").pop();
	const fileName = `${Date.now()}.${fileExt}`;

	const { data, error } = await supabase.storage
		.from("taskhub-files")
		.upload(fileName, fs.createReadStream(filePath), {
			contentType: req.file.mimetype,
			duplex: "half",
		});

	fs.unlinkSync(filePath); // cleanup

	if (error) return next(new AppError(error.message, 500));

	const publicUrl = supabase.storage.from("taskhub-files").getPublicUrl(fileName)
		.data.publicUrl;

	res.status(200).json({
		success: true,
		url: publicUrl,
	});
});
