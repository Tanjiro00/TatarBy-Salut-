let recordingIntervalId;
let recording = false;
console.log('hello')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    // Start a periodic check to request data
    // recordingIntervalId = setInterval(() => {
      recording = true;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] !== undefined)
        chrome.tabs.sendMessage(tabs[0].id, { action: 'requestData' });
      });
    // }, 5000); // Check every 5 seconds

    recordingIntervalId = setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] !== undefined && recording)
        chrome.tabs.sendMessage(tabs[0].id, { action: 'saveData' });
      });
    }, 5000); // Check every 5 seconds

    // // Schedule the stop recording
    // setTimeout(() => {
    //   clearInterval(recordingIntervalId);
    //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //     chrome.tabs.sendMessage(tabs[0].id, { action: 'stopRecording' });
    //   });
    // }, 10000); // Stop after 10 seconds
  }

  if (message.action === 'dataAvailable') {
    // Handle the data (e.g., save it)
    console.log('Data available:', message.data.size);
  }

  if (message.action === 'stopRecording') {
    recording = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] !== undefined)
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stopData' });
    });
  }

  if (message.action === 'uploadAudio') {
    const audioURL = message.audioURL;
    fetch(audioURL)
      .then(response => response.blob())
      .then(audioBlob => {
        console.log(audioBlob)
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'audio.ogg');
        fetch('http://192.168.221.121:3000/postAudio', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Upload successful:', data);
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('Error uploading recording:', error);
      sendResponse({ success: false, error });
    });
      })

    
    // Log the contents of the FormData object
    // fetch('http://45.89.190.212:3000/postAudio', {
    //       method: 'POST',
    //       body: formData
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //       console.log('Upload successful:', data);
    //       sendResponse({ success: true, data });
    //     })
    //     .catch(error => {
    //       console.error('Error uploading recording:', error);
    //       sendResponse({ success: false, error });
    //     });
    

    

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
