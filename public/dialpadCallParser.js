function waitForElement(selector) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element.parentNode.parentNode); // Assuming you always want the grandparent
            }
        }, 100);
    });
}

async function handleButtonClicks() {
    const buttonWithSvg = document.querySelector('button svg[data-name="Download"]').parentNode.parentNode;
    if (!document.querySelector('button svg[data-name="Link 2"]')) {
        buttonWithSvg.click(); // Trigger the potential creation of new elements
        const buttonInsideSpan = await waitForElement('button svg[data-name="Link 2"]');
        buttonInsideSpan.click();
        buttonWithSvg.click(); // Optionally click the first button again if needed
    }
}



function scrapeFormattedDate() {
    // Use querySelector to find the span element by its data-qa attribute
    const dateElement = document.querySelector('span[data-qa="formatted-date"]');
    
    // Check if the element exists
    if (dateElement) {
        console.log('Date information found:', dateElement.textContent);
        return dateElement.textContent; // Return the text content of the element
    } else {
        console.error('No date information element found');
        return null; // Return null if the element does not exist
    }
}

function parseDateTimeInfo(dataString) {
    // Splitting the string into date and time parts
    const [datePart, timePart] = dataString.split('@');
    const date_string = datePart.trim();
    const [times] = timePart.split('•');
    const [start_string, end_string] = times.split('—').map(time => time.trim());

    // Creating Date objects for the start and end times
    const start_datetime_str = `${date_string} ${start_string}`;
    const end_datetime_str = `${date_string} ${end_string}`;
    const start_datetime = new Date(start_datetime_str);
    const end_datetime = new Date(end_datetime_str);

    // Calculating the duration in minutes
    const duration_min = (end_datetime - start_datetime) / (1000 * 60);

    // Structured data object
    return {
        date_string: date_string,
        start_string: start_string,
        end_string: end_string,
        duration_min: duration_min,
        start_datetime: start_datetime.toISOString() // Returning the datetime in ISO format
    };
}

function scrapeCallerName() {
    // Use querySelector to find the span element by its class
    const callerNameElement = document.querySelector('.base-call-description__caller-info--name');
    
    // Check if the element exists
    if (callerNameElement) {
        console.log('Caller name found:', callerNameElement.textContent);
        return callerNameElement.textContent; // Return the text content of the element
    } else {
        console.error('No caller name element found');
        return null; // Return null if the element does not exist
    }
}

function scrapeParsedDate() {
    return parseDateTimeInfo(scrapeFormattedDate());
}

function getCallId() {
    const tabUrl = window.location.href;
    const urlPattern = /^https:\/\/dialpad\.com\/callhistory\/callreview\/(\d+)\?$/;
    const match = tabUrl.match(urlPattern);

    if (!match) {
        console.error('Error: Not on a valid Dialpad call review URL.');
        return;
    }

    // Extract call ID from the URL
    const callId = match[1];
    
    return callId;
}


async function handleButtonClicks() {
    const buttonWithSvg = document.querySelector('button svg[data-name="Download"]').parentNode.parentNode;
    if (!document.querySelector('button svg[data-name="Link 2"]')) {
        buttonWithSvg.click(); // Trigger the potential creation of new elements
        const buttonInsideSpan = await waitForElement('button svg[data-name="Link 2"]');
        buttonInsideSpan.click();
        buttonWithSvg.click(); // Optionally click the first button again if needed
    }
}

async function collectCallInformation() {
    window.focus();
    
    // Trigger the URL generation of the call to the clipboard
    await handleButtonClicks();
    
    // Fetch call ID
    const callId = getCallId();
    if (!callId) {
        return;
    }
    
    // Scrape the caller name
    const callerName = scrapeCallerName();
    
    // Scrape additional temporal metadata
    const callerTimestamp = scrapeParsedDate();
    
    // Extract the contents of the clipboard (adapt to Chrome Extension <= instruction)
    const callURL = navigator.clipboard.readText();
    
    // Put it all together in a record
    const callerRecord = {
        "id": callId,
        "name": callerName,
        "timestamp": callerTimestamp,
        "url": callURL
    };

    console.log(callerRecord);

    return callerRecord;
}

// Ensure this function is either exposed as a global or handle message passing from the background
window.collectCallInformation = collectCallInformation;  // Expose it as a global function

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "collectCallInformation") {
      collectCallInformation()
        .then(response => sendResponse({success: true, data: response}))
        .catch(error => sendResponse({success: false, error: error.toString()}));
      return true;  // indicate async response
    }
  });
  