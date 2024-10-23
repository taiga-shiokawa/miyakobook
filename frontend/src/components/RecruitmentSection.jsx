import { useState } from "react";
import { Link } from "react-router-dom";

const RecruitmentSection = () => {
  const [showSection, setShowSection] = useState(true);

  const handleNoClick = () => {
    setShowSection(false);
  };

  if (!showSection) {
    return null; // セクションを非表示にする
  }

  return (
    <div className="p-4 mb-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">求人を掲載したい</h2>
      <Link to="/company-info">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">
        はい
      </button>
      </Link>
      <button 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2"
        onClick={handleNoClick}
      >
        いいえ
      </button>
    </div>
  );
};

export default RecruitmentSection;