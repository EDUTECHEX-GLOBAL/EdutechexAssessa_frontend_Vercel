// D:\EdutechexAssessa\frontend\src\components\TryforFree.js
import React from "react";
import Assessalogo from "../../assets/assessaai_logo2.png";

const TryforFree = () => {
  const handleOptionClick = (path) => {
    const absolutePath = `${window.location.origin}${path}`;
    window.open(absolutePath, "_blank");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        textAlign: "center",
        padding: "10px",
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
      }}
    >
      <img
        src={Assessalogo}
        style={{ width: "150px", height: "auto", marginBottom: "20px" }}
        alt="Assessa AI Logo"
      />

      <h2
        style={{
          marginBottom: "30px",
          color: "#00796b",
          fontSize: "1.0rem",
        }}
      >
        Choose how you'd like to continue:
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "450px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <button
          style={{
            backgroundColor: "#7F56D9",
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          onClick={() => handleOptionClick("/study-assistant")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          📚 AI-Enhanced Educational Resources
        </button>

        <button
          style={{
            backgroundColor: "#009688",
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          onClick={() => handleOptionClick("/study-recommendation")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🤖 AI-Powered Study Recommendations
        </button>
      </div>
    </div>
  );
};

export default TryforFree;