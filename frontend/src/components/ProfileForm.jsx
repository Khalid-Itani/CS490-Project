import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import defaultAvatar from "../assets/default-avatar.png";
import "./ProfileForm.css";

const ProfileForm = () => {
  const [currentView, setCurrentView] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    industry: "",
    experience: "",
  });

  const [employment, setEmployment] = useState({
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: ""
});

  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(defaultAvatar);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [employmentError, setEmploymentError] = useState("");
  const [employmentSuccess, setEmploymentSuccess] = useState("");
  const [descCount, setDescCount] = useState(0);
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);



  const industries = ["Technology", "Finance", "Education", "Healthcare", "Retail", "Other"];
  const experienceLevels = ["Entry", "Mid", "Senior", "Executive"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "bio") {
      setCharCount(value.length);
      if (value.length > 499) return;
        setFormData({ ...formData, [name]: value.slice(0, 500) });
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.title) newErrors.title = "Professional title is required";
    if (!formData.industry) newErrors.industry = "Please select an industry";
    if (!formData.experience) newErrors.experience = "Please select experience level";
    return newErrors;
  };

const handleSubmit = (e) => {
  e.preventDefault();

  // Example of your existing validation logic
  if (!formData.fullName || !formData.email || !formData.phone || !formData.location) {
    setErrorMessage("Please fill in all required fields.");
    return;
  }

  console.log("Profile Info Saved:", formData);
  setCurrentView("employment");
};


  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      bio: "",
      industry: "",
      experience: "",
    });
    setErrors({});
    setCharCount(0);
    setSaved(false);
  };

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  setErrorMessage("");

  if (!file) return;

  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    setErrorMessage("Invalid file type. Please upload JPG, PNG, or GIF.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setErrorMessage("File too large. Max size is 5 MB.");
    return;
  }

  try {
    setUploadProgress(20);

    const options = { maxWidthOrHeight: 200, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);

    setUploadProgress(70);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setUploadProgress(100);
    };
    reader.readAsDataURL(compressedFile);

    setSelectedImage(compressedFile);
  } catch (error) {
    setErrorMessage("Error processing the image. Please try again.");
  }
};

const handleReplace = () => {
  document.getElementById("fileUpload").click();
};

const handleRemove = () => {
  setSelectedImage(null);
  setPreview(defaultAvatar);
  setUploadProgress(0);
  setErrorMessage("");
};

const handleEmploymentSubmit = () => {
  const { title, company, startDate, endDate, current } = employment;

  // Validation
  if (!title || !company || !startDate) {
    setEmploymentError("Please fill in all required fields (Title, Company, Start Date).");
    return;
  }

  if (!current && endDate && new Date(startDate) > new Date(endDate)) {
    setEmploymentError("Start date cannot be after end date.");
    return;
  }

  let updatedList = [...employmentHistory];

  if (editingIndex !== null) {
    // Update existing entry
    updatedList[editingIndex] = employment;
    setEditingIndex(null);
  } else {
    // Add new entry
    updatedList.unshift(employment); // newest first
  }

  setEmploymentHistory(updatedList);
  setEmployment({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  setEmploymentSuccess("Employment entry saved successfully!");
  setEmploymentError("");
  setDescCount(0);
};


const handleEmploymentCancel = () => {
  setEmployment({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: ""
  });
  setDescCount(0);
  setEmploymentError("");
  setEmploymentSuccess("");
};

const handleEditEmployment = (index) => {
  setEmployment(employmentHistory[index]);
  setEditingIndex(index);
  setEmploymentError("");
  setEmploymentSuccess("");
};

const handleDeleteEmployment = (index) => {
  if (window.confirm("Are you sure you want to delete this entry?")) {
    const updatedList = employmentHistory.filter((_, i) => i !== index);
    setEmploymentHistory(updatedList);
  }
};

const handleFinish = () => {

  localStorage.setItem("profileData", JSON.stringify(formData));
  localStorage.setItem("employmentHistory", JSON.stringify(employmentHistory));

  window.location.href = "/summary";
};



  return (
<div className="profile-container">
  {currentView === "profile" && (
    <>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-picture-section">
          <img src={preview} alt="Profile Preview" className="profile-preview" />
          <div className="upload-buttons">
            <input
              type="file"
              id="fileUpload"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            {!selectedImage && (
              <label htmlFor="fileUpload" className="upload-label">
                Upload Picture
              </label>
            )}
            {selectedImage && (
              <>
                <button type="button" onClick={handleReplace} className="replace-btn">
                  Replace
                </button>
                <button type="button" onClick={handleRemove} className="remove-btn">
                  Remove
                </button>
              </>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>

        <label>*Full Name:</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />

        <label>*Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>*Phone:</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />

        <label>*Location (City, State):</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} />

        <label>Professional Headline/Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} />

        <label>Brief Bio (max 500 chars):</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} />
        <div className="char-count">{charCount}/500 characters</div>

        <label>Industry:</label>
        <select name="industry" value={formData.industry} onChange={handleChange}>
          <option value="">-- Select Industry --</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        <label>Experience Level:</label>
        <select name="experience" value={formData.experience} onChange={handleChange}>
          <option value="">-- Select Level --</option>
          {experienceLevels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>

        <div className="button-group">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
        </div>

        {saved && <p className="success">✅ Profile saved successfully!</p>}
      </form>
    </>
  )}

  {currentView === "employment" && (
    <>
      <h1>Employment History</h1>

      <form
        className="employment-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleEmploymentSubmit();
        }}
      >
        <label>Job Title *</label>
        <input
          type="text"
          value={employment.title}
          onChange={(e) => setEmployment({ ...employment, title: e.target.value })}
          required
        />

        <label>Company Name *</label>
        <input
          type="text"
          value={employment.company}
          onChange={(e) => setEmployment({ ...employment, company: e.target.value })}
          required
        />

        <label>Location</label>
        <input
          type="text"
          value={employment.location}
          onChange={(e) => setEmployment({ ...employment, location: e.target.value })}
        />

        <div className="date-row">
          <div>
            <label>Start Date *</label>
            <input
              type="date"
              value={employment.startDate}
              onChange={(e) => setEmployment({ ...employment, startDate: e.target.value })}
              required
            />
          </div>

          {!employment.current && (
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={employment.endDate}
                onChange={(e) => setEmployment({ ...employment, endDate: e.target.value })}
              />
            </div>
          )}
        </div>
        

        <div className="current-position">
  <input
    type="checkbox"
    id="currentPosition"
    checked={employment.current}
    onChange={(e) =>
      setEmployment({ ...employment, current: e.target.checked, endDate: "" })
    }
  />
  <label htmlFor="currentPosition">Current Position</label>
</div>
        <label>Job Description</label>
        <textarea
          maxLength={1000}
          value={employment.description}
          onChange={(e) => {
            setEmployment({ ...employment, description: e.target.value });
            setDescCount(e.target.value.length);
          }}
          placeholder="Describe your role and responsibilities..."
        />
        <p>{descCount}/1000 characters</p>

        {employmentError && <p className="error">{employmentError}</p>}
        {employmentSuccess && <p className="success">{employmentSuccess}</p>}

        <div className="button-group">
          <button type="submit" className="save-btn">Save Entry</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => handleEmploymentCancel()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => setCurrentView("profile")}
          >
            ← Back
          </button>

          <button
  type="button"
  className="finish-btn"
  onClick={handleFinish}
>
  Finish
</button>

        </div>
      </form>
      <h3>Employment History</h3>
<div className="employment-list">
  {employmentHistory.length === 0 ? (
    <p>No employment history added yet.</p>
  ) : (
    employmentHistory.map((job, index) => (
      <div
        key={index}
        className={`employment-entry ${job.current ? "current-role" : "past-role"}`}
      >
        <div className="employment-header">
          <h4>{job.title}</h4>
          <p className="company">{job.company}</p>
          <p className="dates">
            {job.startDate} – {job.current ? "Present" : job.endDate || "N/A"}
          </p>
          <p className="location">{job.location}</p>
        </div>

        <p className="description">{job.description}</p>

        <div className="button-group">
          <button
            type="button"
            className="edit-btn"
            onClick={() => handleEditEmployment(index)}
          >
            Edit
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => handleDeleteEmployment(index)}
          >
            Delete
          </button>
        </div>
      </div>
    ))
  )}
</div>

    </>
  )}
</div>

  );
};

export default ProfileForm;
