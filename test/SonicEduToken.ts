import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SonicEduToken + CourseCompletionTracker", function () {
    let owner: any;
    let student: any;
    let token: any;
    let tracker: any;

    const rewardAmount = ethers.parseEther("100");
    const initialSupply = 1_000_000n * 10n ** 18n;

    beforeEach(async function () {
        [owner, student] = await ethers.getSigners();

        // Deploy token
        const Token = await ethers.getContractFactory("SonicEduToken");
        token = await Token.deploy(initialSupply, owner.address);
        await token.waitForDeployment();

        // Deploy tracker
        const Tracker = await ethers.getContractFactory("CourseCompletionTracker");
        tracker = await Tracker.deploy(await token.getAddress());
        await tracker.waitForDeployment();

        // Owner approve tracker to spend tokens
        await token
        .connect(owner)
        .approve(await tracker.getAddress(), ethers.parseEther("1000"));
    });

    it("should mint initial supply to owner", async function () {
        const bal = await token.balanceOf(owner.address);
        expect(bal).to.equal(initialSupply);
    });

    it("should set correct owner", async function () {
        expect(await token.owner()).to.equal(owner.address);
    });

    it("full flow: add course, mark completion, claim reward", async function () {
        // Add course
        await expect(tracker.addCourse(rewardAmount))
        .to.emit(tracker, "CourseCreated")
        .withArgs(0, rewardAmount);
        // Caller is not the owner
        await expect(tracker.connect(student).addCourse(rewardAmount))
        .to.be.revertedWithCustomError(tracker, "OwnableUnauthorizedAccount")
        .withArgs(student.address);

        // Mark completion
        await expect(tracker.markCompletion(0, student.address))
        .to.emit(tracker, "CourseCompleted")
        .withArgs(0, student.address, true, false);

        // Claim reward
        await expect(tracker.connect(student).claimReward(0))
        .to.emit(tracker, "RewardClaimed")
        .withArgs(0, student.address, rewardAmount);
        // Claim reward twice
        await expect(tracker.connect(student).claimReward(0))
        .to.be.revertedWith("Already claimed");

        // Verify student balance after claiming
        const studentBal = await token.balanceOf(student.address);
        expect(studentBal).to.equal(rewardAmount);
    });
});
