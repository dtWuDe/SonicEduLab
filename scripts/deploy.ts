import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
const [owner, student] = await ethers.getSigners();

const initialSupply = 1_000_000n * 10n ** 18n;

// // 1. Deploy SonicEduToken
const Token = await ethers.getContractFactory("SonicEduToken");
const token = await Token.deploy(initialSupply, owner.address);
await token.waitForDeployment();
console.log("SonicEduToken deployed at:", await token.getAddress());

// // 2. Deploy CourseCompletionTracker
const Tracker = await ethers.getContractFactory("CourseCompletionTracker");
const tracker = await Tracker.deploy(await token.getAddress());
await tracker.waitForDeployment();
console.log("CourseCompletionTracker deployed at:", await tracker.getAddress());

// // Owner approve tracker to spend tokens
await token
.connect(owner)
.approve(await tracker.getAddress(), ethers.parseEther("100"));

// // 3. Owner adds a new course
const rewardAmount = ethers.parseEther("100");
const addCourseTx = await tracker.addCourse(
    rewardAmount
);

const courseId = 0; // for test purpose
await addCourseTx.wait();
console.log(`Course added with ${rewardAmount} reward token`);

// // 4. Owner marks student as complete
const markTx = await tracker.markCompletion(courseId, student.address);
await markTx.wait();
console.log(`Student marked complete for course ${courseId}`);

// // 5. Student claims reward
const trackerAsStudent = tracker.connect(student);
const claimTx = await trackerAsStudent.claimReward(courseId);
await claimTx.wait();
console.log(`Student claimed reward for course ${courseId}`);

// // 6. Log final balance
const finalBalance = await token.balanceOf(student.address);
    console.log("Student final token balance:", ethers.formatEther(finalBalance));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
