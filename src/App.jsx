import React, { useState, useEffect } from 'react';

const ScrumMasterRota = () => {
  // Load team members from localStorage
  let members = JSON.parse(localStorage.getItem("Members")) || [];
  const [teamMembers, setTeamMembers] = useState(members);
  
  const [newMemberName, setNewMemberName] = useState('');
  const [currentScrumMaster, setCurrentScrumMaster] = useState(null);
  
  // Get or create a reference start date (always a Monday)
  const getStartDate = () => {
    // Try to get the start date from localStorage
    const savedStartDate = localStorage.getItem("RotationStartDate");
    if (savedStartDate) {
      return new Date(savedStartDate);
    }
    
    // If no saved date exists, create a reference date (first Monday of current year)
    const currentYear = new Date().getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1); // January 1st
    
    // Adjust to the first Monday of the year
    const dayOfWeek = firstDayOfYear.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToAdd = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
    firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd);
    
    // Save this reference date
    localStorage.setItem("RotationStartDate", firstDayOfYear.toISOString());
    return firstDayOfYear;
  };
  
  // Calculate current scrum master based on the week number since start date
  useEffect(() => {
    if (teamMembers.length === 0) {
      setCurrentScrumMaster(null);
      return;
    }
    
    const startDate = getStartDate();
    const today = new Date();
    
    // Calculate the weeks since the start date, ensuring we align with Mondays
    // Get the most recent Monday
    const currentMonday = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    currentMonday.setDate(today.getDate() - daysSinceMonday);
    currentMonday.setHours(0, 0, 0, 0); // Set to midnight for accurate calculation
    
    // Calculate whole weeks between the start date and the current Monday
    const timeDiff = currentMonday.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);
    
    // Use modulo to find the position in the rotation
    const index = weeksDiff % teamMembers.length;
    setCurrentScrumMaster(teamMembers[index]);
  }, [teamMembers]);
  
  // Update localStorage whenever teamMembers changes
  useEffect(() => {
    localStorage.setItem("Members", JSON.stringify(teamMembers));
  }, [teamMembers]);
  
  const addTeamMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember = {
      id: teamMembers.length ? Math.max(...teamMembers.map(m => m.id)) + 1 : 1,
      name: newMemberName.trim()
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
  };
  
  const removeTeamMember = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };
  
  const getCurrentWeekDates = () => {
    const today = new Date();
    
    // Calculate the Monday of the current week
    const daysSinceMonday = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday);
    
    // Calculate the Sunday of the current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };
  
  // Function to reset the rotation start date to the current Monday
  // const resetRotation = () => {
  //   const today = new Date();
  //   // Find the current Monday
  //   const daysSinceMonday = (today.getDay() + 6) % 7;
  //   const currentMonday = new Date(today);
  //   currentMonday.setDate(today.getDate() - daysSinceMonday);
  //   currentMonday.setHours(0, 0, 0, 0);
    
  //   localStorage.setItem("RotationStartDate", currentMonday.toISOString());
  //   // Force re-render to update current scrum master
  //   setTeamMembers([...teamMembers]);
  // };
  
  return (
    <div className="container">
      <h1 className="header">Scrum Master Rotation</h1>
      
      <div className="current-scrum-master-card">
        <h2 className="current-scrum-master-title">Current Scrum Master</h2>
        <div className="week-label">Week of {getCurrentWeekDates()}</div>
        {currentScrumMaster ? (
          <div className="current-scrum-master-name">{currentScrumMaster.name}</div>
        ) : (
          <div className="no-members-message">Please add team members to generate rotation</div>
        )}
        {/* <button onClick={resetRotation} className="reset-button">
          Reset Rotation to This Week
        </button> */}
      </div>
      
      <div>
        <div className="card">
          <h2 className="card-title">Team Members</h2>
          
          <div>
            <div className="input-container">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter team member name"
                className="input"
              />
              <button
                onClick={addTeamMember}
                className="add-button"
              >
                Add
              </button>
            </div>
          </div>
          
          {teamMembers.length > 0 ? (
            <ul className="list">
              {teamMembers.map(member => (
                <li key={member.id} className="list-item">
                  <span>{member.name}</span>
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No team members added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrumMasterRota;