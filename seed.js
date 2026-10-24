require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const { disconnectDB } = connectDB;
const { isProd } = require("./config/env");

const User = require("./models/User");
const Course = require("./models/Course");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Material = require("./models/Materials");
const Announcement = require("./models/AnnouncementSchema");
const Quiz = require("./models/Quiz");
const QuizSubmission = require("./models/QuizSubmission");
const Schedule = require("./models/Schedule");

const seedData = require("./seedData.json");

const seedDatabase = async () => {
  try {
    console.log("--- Starting Database Seeding ---");

    // Clear existing collections
    await Promise.all([
      User.deleteAll(),
      Course.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Material.deleteMany({}),
      Announcement.deleteMany({}),
      Quiz.deleteMany({}),
      QuizSubmission.deleteMany({}),
      Schedule.deleteMany({}),
    ]);
    console.log("Cleared existing database collections.");

    // 1. Seed Users (Hash password123 for all users)
    // Demo accounts all share one password. Override it with SEED_PASSWORD (recommended outside of local development).
    const seedPassword = process.env.SEED_PASSWORD || "password123";
    if (!process.env.SEED_PASSWORD && isProd) {
      console.warn("WARNING: SEED_PASSWORD is not set, so every demo account uses the password 'password123'.");
    }
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash(seedPassword, salt);

    const userDocs = seedData.users.map((u) => ({
      _id: u.id,
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash: defaultHashedPassword,
      role: u.role,
      status: u.status || "approved",
      avatar: u.avatar,
      title: u.title || "",
      bio: u.bio || "",
      department: u.department || "School of Design & Creative Arts",
      studentId: u.studentId || `CU-2026-000`,
      phone: u.phone || "",
      joinedDate: u.joinedDate || "October 2026",
      points: u.points ?? 0,
      gpa: u.gpa ?? "N/A",
      streakDays: u.streakDays ?? 0,
      studyHours: u.studyHours ?? 0,
      enrolledCourseIds: u.enrolledCourseIds || [],
      assignedCourseIds: u.assignedCourseIds || [],
      registrationNotes: u.registrationNotes || "",
    }));

    await User.insertMany(userDocs);
    console.log(`Seeded ${userDocs.length} users with credentials.`);

    // 2. Seed Courses
    const courseDocs = seedData.courses.map((c) => ({
      _id: c.id,
      code: c.code,
      title: c.title,
      category: c.category || "General",
      instructorId: c.instructorId,
      instructorName: c.instructorName,
      instructorAvatar: c.instructorAvatar,
      level: c.level || "Beginner level",
      duration: c.duration || "8 Weeks",
      totalLessons: c.totalLessons || 6,
      completedLessons: c.completedLessons || 0,
      progress: c.progress || 0,
      studentsCount: c.studentsCount || 0,
      rating: c.rating || 5.0,
      color: c.color || "#1e3f33",
      badge: c.badge || "Popular",
      thumbnail: c.thumbnail,
      description: c.description,
      schedule: c.schedule,
      room: c.room,
      syllabus: c.syllabus || [],
      customLessons: c.customLessons || {},
      students: [],
      teacher: c.instructorId,
    }));

    await Course.insertMany(courseDocs);
    console.log(`Seeded ${courseDocs.length} courses with full syllabus & modules.`);

    // 3. Seed Assignments
    const assignmentDocs = seedData.assignments.map((a) => ({
      _id: a.id,
      courseId: a.courseId,
      courseName: a.courseName,
      title: a.title,
      description: a.description,
      publishedAt: a.publishedAt,
      dueDate: a.dueDate,
      dueTime: a.dueTime || "11:59 PM",
      duration: a.duration || "2 hours",
      maxScore: a.maxScore || 100,
      totalPoints: a.maxScore || 100,
      priority: a.priority || "Medium",
      priorityColor: a.priorityColor || "gold",
      status: a.status || "Pending",
      rubric: a.rubric || [],
      submissionTypes: a.submissionTypes || ["image", "pdf", "link"],
      unitIdx: a.unitIdx,
      createdBy: "usr-3",
    }));

    await Assignment.insertMany(assignmentDocs);
    console.log(`Seeded ${assignmentDocs.length} assignments with rubrics.`);

    // 4. Seed Submissions
    const submissionDocs = seedData.submissions.map((s) => ({
      _id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignmentTitle,
      courseId: s.courseId,
      studentId: s.studentId,
      studentName: s.studentName,
      studentAvatar: s.studentAvatar,
      submissionDate: s.submissionDate,
      submissionType: s.linkUrl ? "link" : s.fileName ? "file" : "text",
      content: s.content || "",
      linkUrl: s.linkUrl || "",
      fileName: s.fileName || "",
      fileSize: s.fileSize || "",
      fileUrl: s.fileUrl || "",
      status: s.status || "Submitted",
      score: s.score,
      maxScore: s.maxScore || 100,
      feedback: s.feedback || "",
      rubricScores: s.rubricScores || null,
      gradedBy: s.gradedBy,
      gradedAt: s.gradedAt,
    }));

    await Submission.insertMany(submissionDocs);
    console.log(`Seeded ${submissionDocs.length} submissions.`);

    // 5. Seed Quizzes
    const quizDocs = seedData.quizzes.map((q) => ({
      _id: q.id,
      courseId: q.courseId,
      courseName: q.courseName,
      unitIdx: q.unitIdx || 0,
      title: q.title,
      description: q.description,
      dueDate: q.dueDate,
      dueTime: q.dueTime || "11:59 PM",
      duration: q.duration || "20 minutes",
      timeLimitMinutes: q.timeLimitMinutes || 20,
      passingScorePercent: q.passingScorePercent || 70,
      totalPoints: q.totalPoints || 40,
      status: q.status || "Active",
      publishedAt: q.publishedAt || "2026-10-15",
      questions: q.questions || [],
    }));

    await Quiz.insertMany(quizDocs);
    console.log(`Seeded ${quizDocs.length} quizzes with question banks.`);

    // 6. Seed Quiz Submissions
    if (seedData.quizSubmissions && seedData.quizSubmissions.length > 0) {
      const qSubDocs = seedData.quizSubmissions.map((qs) => ({
        _id: qs.id,
        quizId: qs.quizId,
        quizTitle: qs.quizTitle,
        courseId: qs.courseId,
        studentId: qs.studentId,
        studentName: qs.studentName,
        studentAvatar: qs.studentAvatar,
        submittedAt: qs.submittedAt,
        answers: qs.answers || {},
        score: qs.score,
        maxScore: qs.maxScore,
        percentage: qs.percentage,
        passed: qs.passed,
        timeSpent: qs.timeSpent,
      }));
      await QuizSubmission.insertMany(qSubDocs);
      console.log(`Seeded ${qSubDocs.length} quiz submissions.`);
    }

    // 7. Seed Materials
    const materialDocs = seedData.materials.map((m) => ({
      _id: m.id,
      courseId: m.courseId,
      courseTitle: m.courseTitle,
      title: m.title,
      type: m.type,
      size: m.size,
      unitIdx: m.unitIdx,
      downloads: m.downloads || 0,
      uploadDate: m.uploadDate || "2026-10-15",
      uploadedBy: m.uploadedBy || "Instructor",
      downloadUrl: m.downloadUrl || "#",
      description: m.description || "",
    }));

    await Material.insertMany(materialDocs);
    console.log(`Seeded ${materialDocs.length} learning materials.`);

    // 8. Seed Announcements
    const announcementDocs = seedData.announcements.map((a) => ({
      _id: a.id,
      courseId: a.courseId,
      courseName: a.courseName,
      title: a.title,
      authorName: a.authorName,
      authorRole: a.authorRole,
      authorAvatar: a.authorAvatar,
      date: a.date,
      content: a.content,
      pinned: a.pinned || false,
      priority: a.priority || "Normal",
      isRead: a.isRead || false,
      replies: a.replies || [],
    }));

    await Announcement.insertMany(announcementDocs);
    console.log(`Seeded ${announcementDocs.length} announcements.`);

    // 9. Seed Schedules
    const scheduleDocs = [];
    if (seedData.schedules) {
      for (const [userId, sched] of Object.entries(seedData.schedules)) {
        scheduleDocs.push({
          _id: userId,
          userId,
          title: sched.title,
          items: sched.items || [],
        });
      }
    }
    if (seedData.globalSchedule) {
      scheduleDocs.push({
        _id: "global",
        userId: "global",
        title: "Global Studio Timetable",
        items: seedData.globalSchedule,
      });
    }

    await Schedule.insertMany(scheduleDocs);
    console.log(`Seeded ${scheduleDocs.length} schedules.`);

    console.log("--- Database Seeding Complete ---");
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
};

// If run directly from command line
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log("Exiting seed script successfully.");
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;
