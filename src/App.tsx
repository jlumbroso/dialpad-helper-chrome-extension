import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [callInfo, setCallInfo] = useState(null);

  const fetchCallInfo = async () => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || !tabs[0]) {
          console.error("No active tab found");
          return;
        }
        else
          chrome.tabs.sendMessage(tabs[0].id, { action: "collectCallInformation" });
      });
    }
  };

  return (
    <div className="App">
      <h1>Starter Extension</h1>
      <button onClick={fetchCallInfo}>Fetch Call Information</button>
      {callInfo && <div>
        <p>Call ID: {callInfo.id}</p>
        <p>Caller Name: {callInfo.name}</p>
        <p>Timestamp: {callInfo.timestamp}</p>
        <p>URL: {callInfo.url}</p>
      </div>}
    </div>
  );
}

export default App;
