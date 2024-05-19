// src/content.js

const extensionLogo = document.createElement('div');
extensionLogo.id = 'extension-logo';
extensionLogo.style.display = 'none';
extensionLogo.style.position = 'absolute';
extensionLogo.style.zIndex = '9999';
extensionLogo.style.cursor = 'pointer';
extensionLogo.innerHTML = '<img src="https://i.ibb.co/B2zKfDH/logo.png" alt="Tatar.Translate" width="32" height="32">';
document.body.appendChild(extensionLogo);

const speakerDiv = document.createElement('div');
  
speakerDiv.innerHTML = '<p></p>';

speakerDiv.style.position = 'fixed';
speakerDiv.style.bottom = '0';
// speakerDiv.style.left = '20vw';
speakerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
speakerDiv.style.color = 'white';
speakerDiv.style.padding = '6px';
speakerDiv.style.textAlign = 'start';
speakerDiv.style.zIndex = '9999';
speakerDiv.style.display = 'none';
speakerDiv.style.marginLeft = 'auto';
speakerDiv.style.marginRight = 'auto';
speakerDiv.style.fontSize = '30px';

// speakerDiv.style.width = '60vw';


document.body.appendChild(speakerDiv);


function positionLogo(selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  extensionLogo.style.top = `${rect.bottom + window.scrollY}px`;
  extensionLogo.style.left = `${rect.left + window.scrollX}px`;
}

var isEnabled = true;
var isEnabled1 = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setIsEnabled') {
    if (request.isEnabled) {
      isEnabled = true;
    } else {
      isEnabled = false;
      extensionLogo.style.display = 'none';
      textBlock.style.display = 'none'; 
    }
  }
  if (request.action === 'setIsEnabled1') {
    console.log(request.isEnabled1)
    if (request.isEnabled1) {
      isEnabled1 = true;
      speakerDiv.style.display = 'block';
      chrome.runtime.sendMessage({ action: 'startRecording' });

    } else {
      isEnabled1 = false;
      speakerDiv.style.display = 'none';
      chrome.runtime.sendMessage({ action: 'stopRecording' });
      
    }
  }
});


document.addEventListener('selectionchange', () => {
  console.log(window.getSelection())
  const selection = window.getSelection();
  if (selection.toString().trim() !== '' && isEnabled) {
    positionLogo(selection);
    extensionLogo.style.display = 'block';
  } else {
    extensionLogo.style.display = 'none';
    textBlock.style.display = 'none';
  }
});


const textBlock = document.createElement('div');
textBlock.id = 'text-block';
textBlock.style.display = 'none';
textBlock.style.position = 'absolute';
textBlock.style.zIndex = '9999';
textBlock.style.backgroundColor = 'white';
textBlock.style.color = 'black';
textBlock.style.border = '1px solid black';
textBlock.style.padding = '10px';
document.body.appendChild(textBlock);

function positionTextBlock(selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const width = rect.width;
  console.log(width);
  textBlock.style.top = `${rect.bottom + window.scrollY + 10}px`;
  textBlock.style.left = `${rect.left + window.scrollX}px`;
  textBlock.style.width = width < 120 ? '120px' : `${width}px`;
}


extensionLogo.addEventListener('click', async () => {
  const selection = window.getSelection();
  if (selection.toString().trim()!== '') {
    try {
      const response = await fetch(`https://translate.tatar/translate?lang=0&text=${selection.toString()}`);
      const xml = await response.text(); // Assuming the response is XML
      console.log(xml)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      
      const translationNode = xmlDoc.getElementsByTagName("translation")[0];
      console.log(translationNode)
      const translationText = translationNode? translationNode.textContent : '';
      
      console.log(translationText)
      if (translationNode)
        textBlock.textContent = translationText;
      else textBlock.textContent = xml;

      if (textBlock.textContent == '' || !textBlock.textContent) {
        textBlock.style.color = "red";
        textBlock.textContent = 'При переводе произошла ошибка!'
      }
      textBlock.style.color = "black"
      positionTextBlock(selection);
      textBlock.style.display = 'block';
    } catch (error) {
      console.error('Failed to fetch translation:', error);
      textBlock.textContent = 'Error fetching translation.';
      positionTextBlock(selection);
      textBlock.style.display = 'block';
    }
  }
});


window.addEventListener('load', function() {

  if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/watch')) {
    console.log(12345)
    let button = document.createElement('button');
    button.style.zIndex = 9999;
    button.innerText = 'Activate Subtitles';
    button.style.position = 'absolute'
    button.onclick = function() {
    };
    const video = this.document.getElementsByTagName('video')[0]
    const rect = video.getBoundingClientRect();
    button.style.top = `${rect.top + window.scrollY + 20}px`
    button.style.left = `${rect.left + (rect.right - rect.left) / 2}px`
    console.log(rect.bottom)
    this.document.body.append(button);
  }
});

function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

async function sendAudioBlob(audioBlob) {
  const arrayBuffer = await blobToArrayBuffer(audioBlob);
  
}

let audioChunks = [];
var translatedText = [];

async function startRecording() {
  console.log('i was called for recording')
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { type: 'audio/ogg; codecs=opus', audioBitsPerSecond: 16000 });
    console.log(recorder.audioBitsPerSecond);

    recorder.start();

    console.log('Recording started.');

    recorder.ondataavailable = function(event) {
      audioChunks.push(event.data);
    }

    recorder.onerror = function(error) {
      console.error('Error recording audio:', error);
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'saveData') {
        recorder.stop();
        const audioBlob = new Blob(audioChunks, { type: 'audio/ogg' });
        const audioURL = URL.createObjectURL(audioBlob);
        chrome.runtime.sendMessage({ action: 'uploadAudio', audioURL }, response => {
          if (response.success) {
            translatedText += ' ' + response.data;
            if (translatedText.length > 100) {translatedText = response.data;}
            console.log('Upload response:', response.data);
            speakerDiv.textContent = translatedText;
            console.log(speakerDiv.textContent.length)
          } else {
            console.error('Upload failed:', response.error);
          }
        });
        recorder.start();
        audioChunks = [];
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'stopData') {
        console.log('stopped recording')
        recorder.stop();
        audioChunks = [];
      }
    });
  } catch (error) {
    console.error('Failed to start recording:', error);
  }

  
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'requestData') {
    startRecording();
  }
});
