document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. AI Evaluator script is running.");

    const evaluationForm = document.getElementById('evaluation-form');
    const fileInput = document.getElementById('file-upload');
    const submitButton = document.getElementById('submit-btn');

    const textPlaceholder = document.getElementById('text-placeholder');
    const textOutputWrapper = document.getElementById('text-output-wrapper');
    const extractedTextOutput = document.getElementById('extracted-text-output');

    const evaluationOutputWrapper = document.getElementById('evaluation-output-wrapper');
    const evaluationOutput = document.getElementById('evaluation-output');

    const fileNameDisplay = document.getElementById('file-name-display');
    const dropZone = document.getElementById('file-drop-zone');

    let extractedTextContent = null;
    let extractedQnA = null;

    // --- File drop-zone handling ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('file-drop-zone-active'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('file-drop-zone-active'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            fileInput.files = files; 
            fileNameDisplay.textContent = `Selected file: ${file.name}`;
        }
    }

    // --- Form submission ---
evaluationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log("Form submission triggered.");

    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to extract text from.");
        console.warn("Submit clicked without a file.");
        return;
    }

    console.log(`File selected: ${file.name}, Type: ${file.type}`);
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "Extracting text with AI...";

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/v1/evaluator/ocr", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to extract text");
        const result = await response.json();

        extractedTextContent = result.text;

        // Show extracted text preview
        extractedTextOutput.textContent = extractedTextContent.trim()
            ? extractedTextContent
            : "[No text could be extracted from the document.]";

        textPlaceholder.classList.add('hidden');
        textOutputWrapper.classList.remove('hidden');

        // Parse JSON for Q&A; fallback if not JSON
        try {
            extractedQnA = JSON.parse(extractedTextContent);
        } catch {
            extractedQnA = [
                { question: "Student Submission", answer: extractedTextContent }
            ];
        }

        submitButton.innerHTML = 'Text Extraction Complete';
        submitButton.disabled = false;

        console.log("Text extraction successful. Ready for evaluation.");
    } catch (error) {
        console.error('Error during file processing:', error);
        alert('An error occurred while extracting text. Check the console.');

        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        textPlaceholder.classList.remove('hidden');
        textOutputWrapper.classList.add('hidden');
        extractedTextContent = null;
        extractedQnA = null;
    }
});


// --- Handle submission of extracted text ---
submitExtractedTextButton.addEventListener('click', async () => {
    if (!extractedQnA || !extractedTextContent) {
        alert("No extracted text available to submit.");
        console.warn("Submission clicked without extracted text.");
        return;
    }

    const originalButtonText = submitExtractedTextButton.innerHTML;
    submitExtractedTextButton.disabled = true;
    submitExtractedTextButton.innerHTML = "Submitting data...";

    try {
        const response = await fetch("/api/v1/evaluator/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ extractedQnA }), // send parsed Q&A or raw text
        });

        if (!response.ok) throw new Error("Failed to save data");

        // Optional: get ID or confirmation from backend
        const result = await response.json();
        console.log("Data saved successfully:", result);

        // Redirect to results page
        window.location.href = "/results";
    } catch (error) {
        console.error("Error during submission:", error);
        alert("An error occurred while submitting the extracted text. Check the console.");

        submitExtractedTextButton.innerHTML = originalButtonText;
        submitExtractedTextButton.disabled = false;
    }
});





})
