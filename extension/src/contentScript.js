// src/content.js

// Create the extension logo element
const extensionLogo = document.createElement('div');
extensionLogo.id = 'extension-logo';
extensionLogo.style.display = 'none';
extensionLogo.style.position = 'absolute';
extensionLogo.style.zIndex = '9999';
extensionLogo.style.cursor = 'pointer';
extensionLogo.innerHTML = '<img src="https://i.ibb.co/xzGjyjJ/logo.jpg" alt="123" width="64" height="64">';
document.body.appendChild(extensionLogo);

// Function to position the logo below the selected text
function positionLogo(selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  extensionLogo.style.top = `${rect.bottom + window.scrollY}px`;
  extensionLogo.style.left = `${rect.left + window.scrollX}px`;
}

var isEnabled = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setIsEnabled') {
    if (request.isEnabled) {
      isEnabled = true;
      // Re-enable the extension's behavior
    } else {
      isEnabled = false;
      // Disable the extension's behavior
      extensionLogo.style.display = 'none'; // Optionally hide the logo immediately
      textBlock.style.display = 'none'; // And the text block
    }
  }
});

// function handleSelectionChange() {
//   console.log(window.getSelection())
//   const selection = window.getSelection();
//   if (selection.toString().trim() !== '') {
//     positionLogo(selection);
//     extensionLogo.style.display = 'block';
//   } else {
//     extensionLogo.style.display = 'none';
//     textBlock.style.display = 'none';
//   }
// }

// handleSelectionChange();

// Event listener for text selection
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

// src/content.js

// Create the text block element
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

// Function to position the text block below the selected line
function positionTextBlock(selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const width = rect.width;
  console.log(width);
  textBlock.style.top = `${rect.bottom + window.scrollY + 10}px`;
  textBlock.style.left = `${rect.left + window.scrollX}px`;
  textBlock.style.width = width < 120 ? '120px' : `${width}px`;
}

// Event listener for logo click
// extensionLogo.addEventListener('click', () => {
//   const selection = window.getSelection();
//   if (selection.toString().trim() !== '') {
//     textBlock.textContent = 'Переведенный текст';
//     positionTextBlock(selection);
//     textBlock.style.display = 'block';
//   }
// });

extensionLogo.addEventListener('click', async () => {
  const selection = window.getSelection();
  if (selection.toString().trim()!== '') {
    try {
      // Replace 'YOUR_ENDPOINT_URL' with the actual URL of your endpoint
      const response = await fetch(`https://translate.tatar/translate?lang=0&text=${selection.toString()}`);
      const xml = await response.text(); // Assuming the response is XML
      console.log(xml)
      // Parse the XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      
      // Extract the translation
      const translationNode = xmlDoc.getElementsByTagName("translation")[0];
      console.log(translationNode)
      const translationText = translationNode? translationNode.textContent : '';
      
      // Use the extracted translation
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
      // Handle error (e.g., show a default message or retry)
      textBlock.textContent = 'Error fetching translation.';
      positionTextBlock(selection);
      textBlock.style.display = 'block';
    }
  }
});


// src/content.js