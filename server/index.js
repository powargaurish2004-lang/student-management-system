/* global process */
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.MONGODB_URI || !jwtSecret) {
  console.warn("[v0] Set MONGODB_URI and JWT_SECRET before starting the API.");
}

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "20kb" }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 30 },
  age: { type: Number, required: true, min: 1, max: 120 },
  course: { type: String, required: true, enum: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"] },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });
studentSchema.index({ userId: 1, name: 1, age: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);

const formatStudent = (student) => ({
  id: student._id.toString(), name: student.name, age: student.age, course: student.course,
  status: student.status, dateAdded: student.createdAt.toLocaleDateString(), createdAt: student.createdAt.getTime(),
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try { req.userId = jwt.verify(token, jwtSecret).userId; next(); }
  catch { return res.status(401).json({ message: "Session expired. Please sign in again." }); }
};

const validateStudent = ({ name, age, course }) => {
  if (!name?.trim() || !course || !Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120) return "Enter a valid name, age, and course.";
  if (name.trim().length > 30) return "Name cannot exceed 30 characters.";
  return null;
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !/^\\S+@\\S+\\.\\S+$/.test(email || "") || !password || password.length < 8) return res.status(400).json({ message: "Use a name, valid email, and password with at least 8 characters." });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with that email already exists." });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { res.status(500).json({ message: "Unable to create account.", error: error.code === 11000 ? "Email already exists." : undefined }); }
});

app.post("/api/auth/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) return res.status(401).json({ message: "Incorrect email or password." });
  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/students", auth, async (req, res) => res.json((await Student.find({ userId: req.userId }).sort({ createdAt: -1 })).map(formatStudent)));
app.post("/api/students", auth, async (req, res) => {
  const message = validateStudent(req.body); if (message) return res.status(400).json({ message });
  try { res.status(201).json(formatStudent(await Student.create({ ...req.body, age: Number(req.body.age), userId: req.userId }))); }
  catch (error) { res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? "A student with the same name and age already exists." : "Unable to add student." }); }
});
app.put("/api/students/:id", auth, async (req, res) => {
  const message = validateStudent(req.body); if (message) return res.status(400).json({ message });
  const student = await Student.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { ...req.body, age: Number(req.body.age) }, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ message: "Student not found." }); res.json(formatStudent(student));
});
app.patch("/api/students/:id/status", auth, async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, userId: req.userId }); if (!student) return res.status(404).json({ message: "Student not found." });
  student.status = student.status === "Active" ? "Inactive" : "Active"; await student.save(); res.json(formatStudent(student));
});
app.delete("/api/students/:id", auth, async (req, res) => { const deleted = await Student.findOneAndDelete({ _id: req.params.id, userId: req.userId }); if (!deleted) return res.status(404).json({ message: "Student not found." }); res.status(204).end(); });

app.use((error, _req, res) => { console.error("[v0] API error", error); res.status(500).json({ message: "Internal server error." }); });

mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`))).catch((error) => { console.error("[v0] MongoDB connection failed", error.message); process.exit(1); });

export default app;
