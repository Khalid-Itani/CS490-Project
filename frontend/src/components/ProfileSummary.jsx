import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import defaultAvatar from "../assets/default-avatar.png";
import "./ProfileForm.css"; 

const ProfileSummary = () => {
  const [profileData, setProfileData] = useState(null);
  const [employmentHistory, setEmploymentHistory] = useState([]);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("profileData"));
    const storedEmployment = JSON.parse(localStorage.getItem("employmentHistory")) || [];
    setProfileData(storedProfile);
    setEmploymentHistory(storedEmployment);
  }, []);

  if (!profileData) {
    return <p>No profile data found. Please fill out your profile first.</p>;
  }

  return (
    <div className="profile-summary-container">
      <h1>{profileData.fullName}'s Professional Profile</h1>

      <div className="summary-section">
        {profileData.profilePicture ? (
  <img
    src={profileData.profilePicture}
    alt="Profile"
    className="summary-avatar"
  />
) : (
  <img
    src={defaultAvatar}
    alt="Default Avatar"
    className="summary-avatar"
  />
)}

        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Phone:</strong> {profileData.phone}</p>
        <p><strong>Location:</strong> {profileData.location}</p>
        <p><strong>Headline:</strong> {profileData.title}</p>
        <div className="summary-section">
  <strong>Bio:</strong>
  <p className="summary-bio">{profileData.bio}</p>
</div>

        <p><strong>Industry:</strong> {profileData.industry}</p>
        <p><strong>Experience Level:</strong> {profileData.experience}</p>
      </div>

      <h2>Employment History</h2>
      {employmentHistory.length === 0 ? (
        <p>No employment records yet.</p>
      ) : (
        employmentHistory.map((job, index) => (
          <div key={index} className="job-entry">
            <h3>{job.title} @ {job.company}</h3>
            <p>{job.location}</p>
            <p>
              {job.startDate} → {job.current ? "Present" : job.endDate}
            </p>
            <p>{job.description}</p>
          </div>
        ))
        
      )}
      <button
        className="back-btn"
        onClick={() => {
          localStorage.removeItem("profileData");
          localStorage.removeItem("employmentHistory");
          window.location.href = "/profile/edit";
        }}
      >
        Back to Edit Profile
      </button>
      <button
        className="btn btn--danger"
        style={{ marginLeft: 12, marginTop: 12 }}
        onClick={() => window.location.href = "/delete-account"}
      >
        Delete Account
      </button>

    </div>
  );
};

export default ProfileSummary;
