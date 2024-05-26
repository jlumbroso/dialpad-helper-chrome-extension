import React, { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import "./App.css";

function App() {
  const [callInfo, setCallInfo] = useState(null);
  const [callDict, setCallDict] = useState<any[]>([]);

  // useEffect(() => {
  //   const messageListener = (message: { action: string; data: any; }, sender: any, sendResponse: any) => {
  //     if (message.action === 'updateCallInfo') {
  //       setCallInfo(message.data);
  //     }
  //   };
  // 
  //   chrome.runtime.onMessage.addListener(messageListener);
  // 
  //   // Cleanup the listener when the component unmounts
  //   return () => {
  //     chrome.runtime.onMessage.removeListener(messageListener);
  //   };
  // }, []);

  // Use useEffect to load snippets from local storage when the component mounts
  useEffect(() => {
    chrome.storage.local.get('dialpadCallDictionary', (result) => {
      const calls = Object.values(result["dialpadCallDictionary"]);
      if (calls === undefined) {
        // If 'snippets' key doesn't exist in local storage, set the initial state with the sample snippet
        setCallDict([]);
      } else {
        // If 'snippets' key exists in local storage, set the state with the stored snippets
        setCallDict(calls);
      }
    });
  }, []);



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

  const downloadFile = (url, fileName) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  return (
    <div className="App">
      <h1>Dialpad Call Downloader</h1>
      <button onClick={fetchCallInfo}>Fetch Call Information</button>
      {callDict
        .sort((a, b) => new Date(a.timestamp.start_datetime) - new Date(b.timestamp.start_datetime))
        .map((call) => {
          const dateString = call.timestamp.start_datetime.split("T")[0];
          const startTimeString = call.timestamp.start_string.replace(" ", "").replace(":", "");
          const endTimeString = call.timestamp.end_string.replace(" ", "").replace(":", "");
          const nameString = call.name.replace(" ", "_");
          const filename = `${dateString}_${startTimeString}-${endTimeString}_${nameString}.mp3`;

          return (
            <div key={call.id} className="call-item">
              <span className="call-name">{call.name}</span>
              <span className="call-date">{call.timestamp.date_string}</span>
              <span className="call-time">
                {call.timestamp.start_string} - {call.timestamp.end_string}
              </span>
              <span className="call-duration">{call.timestamp.duration_min} min</span>
              <div className="call-actions">
                {call.url ? (
                  <button
                    className="download-button"
                    onClick={() => downloadFile(call.url, filename)}
                    title="Download Recording"
                  >
                    💾
                  </button>
                ) : (
                  <span className="download-button disabled" title="No Recording Available">
                    💾
                  </span>
                )}
                <a
                  href={`https://dialpad.com/callhistory/callreview/${call.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Call Review"
                >
                  🔗
                </a>
              </div>
            </div>
          );
        })}
      <div>
        <h2>Call Information</h2>
        <pre>{JSON.stringify(callDict, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
