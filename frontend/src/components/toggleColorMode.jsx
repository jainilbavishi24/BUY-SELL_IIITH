import React, { useState, useEffect } from "react";
import { } from "react-icons/fa";


const ToggleColorMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("color-mode") === "dark"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = "#1a202c"; 
      document.body.style.color = "#ffffff";
    } else {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000"; 
    }
    localStorage.setItem("color-mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleColorMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <button onClick={toggleColorMode}>
      {isDarkMode ? <FaMoon/> : <FaSun/>}
    </button>
  );
};

export default ToggleColorMode;
