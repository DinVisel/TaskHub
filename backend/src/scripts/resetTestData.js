import "dotenv/config.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Offer from "../models/Offer.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";

const TEST_PASSWORD = "TestPass123!";
const TEST_USERS = [
        "carla.client@example.com",
        "jane.worker@example.com",
        "noah.worker@example.com",
        "amelia.admin@example.com",
];

const LOADTEST_TASK_FILTER = {
        $or: [
                { title: { $regex: /sample task/i } },
                { description: { $regex: /k6 load testing/i } },
        ],
};

const daysAgo = (days) => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - days);
        return date;
};

async function removeTasks(taskIds) {
        if (!taskIds.length) return 0;

        await Promise.all([
                Offer.deleteMany({ taskId: { $in: taskIds } }),
                Message.deleteMany({ taskId: { $in: taskIds } }),
                Review.deleteMany({ taskId: { $in: taskIds } }),
        ]);

        const { deletedCount = 0 } = await Task.deleteMany({ _id: { $in: taskIds } });
        return deletedCount;
}

async function removeUsersAndRelatedData(userIds) {
        if (!userIds.length) return { removedUsers: 0, removedTasks: 0 };

        const relatedTasks = await Task.find({
                $or: [
                        { postedBy: { $in: userIds } },
                        { assignedTo: { $in: userIds } },
                        { completedBy: { $in: userIds } },
                ],
        }).select("_id");

        const taskIds = [
                ...new Set(relatedTasks.map((task) => task._id.toString())),
        ].map((id) => new mongoose.Types.ObjectId(id));

        const removedTasks = await removeTasks(taskIds);

        await Promise.all([
                Offer.deleteMany({ applicantId: { $in: userIds } }),
                Message.deleteMany({
                        $or: [
                                { senderId: { $in: userIds } },
                                { receiverId: { $in: userIds } },
                        ],
                }),
                Review.deleteMany({
                        $or: [
                                { reviewerId: { $in: userIds } },
                                { reviewedUserId: { $in: userIds } },
                        ],
                }),
        ]);

        const { deletedCount = 0 } = await User.deleteMany({ _id: { $in: userIds } });
        return { removedUsers: deletedCount, removedTasks };
}

async function purgeLoadtestData() {
        const loadtestUsers = await User.find({ email: { $regex: /^loadtest\+/i } }).select(
                "_id"
        );
        const loadtestUserIds = loadtestUsers.map((user) => user._id);

        const userRemoval = await removeUsersAndRelatedData(loadtestUserIds);

        const loadtestTasks = await Task.find(LOADTEST_TASK_FILTER).select("_id");
        const loadtestTaskIds = loadtestTasks.map((task) => task._id);
        const taskRemovalCount = await removeTasks(loadtestTaskIds);

        return {
                removedUsers: userRemoval.removedUsers,
                removedTasks: userRemoval.removedTasks + taskRemovalCount,
        };
}

async function seedTestDataset() {
        const existingTestUsers = await User.find({ email: { $in: TEST_USERS } }).select("_id");
        const existingTestUserIds = existingTestUsers.map((user) => user._id);
        await removeUsersAndRelatedData(existingTestUserIds);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

        const [client, workerJane, workerNoah, adminUser] = await User.create([
                {
                        name: "Carla Client",
                        email: "carla.client@example.com",
                        role: "USER",
                        passwordHash,
                        phone: "+1-555-0100",
                        identification: "ID-CARLA-001",
                        location: {
                                city: "New York",
                                coordinates: { lat: 40.7128, lng: -74.006 },
                        },
                        preferences: {
                                categories: ["Cleaning", "Repair", "Programming"],
                                radiusKm: 30,
                        },
                        walletBalance: 210,
                        transactions: [
                                {
                                        type: "add",
                                        amount: 500,
                                        description: "Initial wallet top-up",
                                        createdAt: daysAgo(14),
                                },
                                {
                                        type: "spend",
                                        amount: -200,
                                        description: "Payment for task: Develop personal portfolio site",
                                        createdAt: daysAgo(6),
                                },
                                {
                                        type: "spend",
                                        amount: -90,
                                        description: "Payment for task: Weekly apartment cleaning",
                                        createdAt: daysAgo(2),
                                },
                        ],
                },
                {
                        name: "Jane Worker",
                        email: "jane.worker@example.com",
                        role: "USER",
                        passwordHash,
                        phone: "+1-555-0115",
                        identification: "ID-JANE-002",
                        bio: "Full-stack developer helping clients build polished products.",
                        location: {
                                city: "Brooklyn",
                                coordinates: { lat: 40.6782, lng: -73.9442 },
                        },
                        rating: 4.9,
                        completedTasks: 18,
                        walletBalance: 520,
                        transactions: [
                                {
                                        type: "receive",
                                        amount: 520,
                                        description: "Payment received for task: Develop personal portfolio site",
                                        createdAt: daysAgo(5),
                                },
                        ],
                        preferences: {
                                categories: ["Programming", "Tutoring"],
                                radiusKm: 15,
                        },
                },
                {
                        name: "Noah Worker",
                        email: "noah.worker@example.com",
                        role: "USER",
                        passwordHash,
                        phone: "+1-555-0128",
                        identification: "ID-NOAH-003",
                        bio: "Reliable handyman available for evening and weekend jobs.",
                        location: {
                                city: "Jersey City",
                                coordinates: { lat: 40.7178, lng: -74.0431 },
                        },
                        rating: 4.7,
                        completedTasks: 42,
                        walletBalance: 280,
                        transactions: [
                                {
                                        type: "receive",
                                        amount: 360,
                                        description: "Payment received for task: Weekly apartment cleaning",
                                        createdAt: daysAgo(2),
                                },
                                {
                                        type: "spend",
                                        amount: -80,
                                        description: "Supplies restock",
                                        createdAt: daysAgo(1),
                                },
                        ],
                        preferences: {
                                categories: ["Cleaning", "Repair", "Delivery"],
                                radiusKm: 20,
                        },
                },
                {
                        name: "Amelia Admin",
                        email: "amelia.admin@example.com",
                        role: "ADMIN",
                        passwordHash,
                        phone: "+1-555-0199",
                        location: {
                                city: "Remote",
                        },
                        walletBalance: 0,
                        transactions: [],
                },
        ]);

        const [openTask, inProgressTask, completedTask] = await Task.create([
                {
                        title: "Mount 65-inch TV",
                        description:
                                "Need assistance mounting a 65-inch TV on a drywall surface and hiding the cables.",
                        category: "Repair",
                        price: 120,
                        budget: 120,
                        status: "open",
                        postedBy: client._id,
                        location: {
                                address: "Manhattan, NY",
                                coordinates: { lat: 40.758, lng: -73.9855 },
                        },
                        commissionRate: 0.12,
                },
                {
                        title: "Weekly apartment cleaning",
                        description:
                                "Looking for a reliable cleaner for a 2-bedroom apartment each Saturday morning.",
                        category: "Cleaning",
                        price: 90,
                        budget: 90,
                        status: "in_progress",
                        postedBy: client._id,
                        assignedTo: workerNoah._id,
                        paid: true,
                        location: {
                                address: "Brooklyn, NY",
                                coordinates: { lat: 40.6782, lng: -73.9442 },
                        },
                        commissionRate: 0.1,
                },
                {
                        title: "Develop personal portfolio site",
                        description:
                                "Need a responsive portfolio built with Next.js including blog and contact form.",
                        category: "Programming",
                        price: 600,
                        budget: 650,
                        status: "completed",
                        postedBy: client._id,
                        assignedTo: workerJane._id,
                        completedBy: workerJane._id,
                        completedAt: daysAgo(4),
                        paid: true,
                        location: {
                                address: "Remote work",
                        },
                        commissionRate: 0.15,
                },
        ]);

        await Offer.create([
                {
                        taskId: openTask._id,
                        applicantId: workerJane._id,
                        message:
                                "Experienced with home theater setups. I can bring mounting hardware if needed.",
                        amount: 130,
                        status: "pending",
                },
                {
                        taskId: openTask._id,
                        applicantId: workerNoah._id,
                        message: "Can complete the job in under an hour and ensure cable management.",
                        amount: 125,
                        status: "pending",
                },
                {
                        taskId: inProgressTask._id,
                        applicantId: workerNoah._id,
                        message: "Ready to take this on as a recurring Saturday appointment.",
                        amount: 90,
                        status: "accepted",
                },
        ]);

        await Message.create([
                {
                        taskId: inProgressTask._id,
                        senderId: client._id,
                        receiverId: workerNoah._id,
                        content: "Hi Noah! Can we shift this week's cleaning to Sunday morning?",
                        createdAt: daysAgo(1),
                },
                {
                        taskId: inProgressTask._id,
                        senderId: workerNoah._id,
                        receiverId: client._id,
                        content: "Sunday works great for me. I'll arrive at 9am.",
                        createdAt: daysAgo(1),
                },
                {
                        taskId: completedTask._id,
                        senderId: workerJane._id,
                        receiverId: client._id,
                        content: "The portfolio site is live. Let me know if any tweaks are needed!",
                        createdAt: daysAgo(5),
                },
        ]);

        await Review.create([
                {
                        taskId: completedTask._id,
                        reviewerId: client._id,
                        reviewedUserId: workerJane._id,
                        rating: 5,
                        comment:
                                "Fantastic work! The site looks great and was delivered ahead of schedule.",
                        createdAt: daysAgo(3),
                },
        ]);

        return {
                users: [client, workerJane, workerNoah, adminUser],
                tasks: [openTask, inProgressTask, completedTask],
                testPassword: TEST_PASSWORD,
        };
}

async function main() {
        try {
                        await connectDB();

                        const purgeSummary = await purgeLoadtestData();
                        console.log(
                                `Removed ${purgeSummary.removedUsers} load-test users and ${purgeSummary.removedTasks} related tasks.`
                        );

                        const dataset = await seedTestDataset();
                        console.log(
                                `Seeded test dataset with ${dataset.users.length} users and ${dataset.tasks.length} tasks.`
                        );
                        console.table(
                                dataset.users.map((user) => ({
                                        name: user.name,
                                        email: user.email,
                                        role: user.role,
                                }))
                        );
                        console.log(`Shared test password: ${dataset.testPassword}`);
        } catch (err) {
                        console.error("Failed to reset test data:", err);
                        process.exitCode = 1;
        } finally {
                        await mongoose.connection.close();
        }
}

main();
