// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./SonicEduToken.sol";

contract CourseCompletionTracker is Ownable {
    
    SonicEduToken public SET;

    constructor(address tokenAddress) Ownable(SonicEduToken(tokenAddress).owner()) {
        SET = SonicEduToken(tokenAddress);
    }
    // coud be extend 
    struct Course {
        uint256 reward;
    }

    struct Marker {
        bool completed;
        bool claimed;
    }

    // CourseId -> Course
    mapping(uint256 => Course) public courses;
    // Course -> Student
    mapping(uint256 => mapping(address => Marker)) public courseToStudent;
 
    event CourseCreated(uint256 indexed courseId, uint256 reward);
    event CourseCompleted(uint256 indexed courseId, address student, bool completed, bool claimed);
    event RewardClaimed(uint256 indexed courseId, address indexed student, uint reward);


    uint256 nextCourseId;
    // registers a new course
    function addCourse(uint256 rewardAmount) public onlyOwner {
        courses[nextCourseId] = Course(rewardAmount);
        emit CourseCreated(nextCourseId, rewardAmount); // Write log
        nextCourseId++;
    }

    //  records that a specific student has completed a specific course
    function markCompletion(uint256 courseId, address student) public onlyOwner {
        courseToStudent[courseId][student] = Marker(true, false);
        emit CourseCompleted(courseId, student, true, false);
    }

    function claimReward(uint256 courseId) external {
        Marker storage m = courseToStudent[courseId][msg.sender];

        require(m.completed, "Course not completed");
        require(!m.claimed, "Already claimed");

        m.claimed = true;
        uint256 reward = courses[courseId].reward;

        require(
            SET.transferFrom(owner(), msg.sender, reward),
            "Transfer failed"
        );

        emit RewardClaimed(courseId, msg.sender, reward);
    }
}