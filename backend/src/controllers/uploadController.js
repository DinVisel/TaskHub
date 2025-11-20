import multer from "multer";
import { uploadFile } from "../services/storageService.js";
import AppError from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new AppError("Not an image! Please upload only images.", 400), false);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadImage = asyncHandler(async (req, res) => {
	if (!req.file) {
		throw new AppError("No file uploaded", 400);
	}

	const file = req.file;
	const publicUrl = await uploadFile(
		file.buffer,
		file.originalname,
		file.mimetype
	);

	res.status(201).json({
		status: "success",
		url: publicUrl,
	});
});
