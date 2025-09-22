document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. AI Evaluator script is running.");

  const fileInput = document.getElementById("file-upload");
  const extractTXTsubmitButton = document.getElementById("submit-btn");
  const submitExtractedBtn = document.getElementById("submit-extracted-btn");

  const textPlaceholder = document.getElementById("text-placeholder");
  const textOutputWrapper = document.getElementById("text-output-wrapper");
  const extractedTextOutput = document.getElementById("extracted-text-output");

  const fileNameDisplay = document.getElementById("file-name-display");
  const dropZone = document.getElementById("file-drop-zone");

  const studentName = document.getElementById("studentName");
  const rollNo = document.getElementById("rollNo");

  let extractedTextContent = null;
  let extractedQnA = null;
  const modifiedQnA = document.getElementById("extracted-text-output");

  // --- Drag & Drop setup ---
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add("file-drop-zone-active"), false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove("file-drop-zone-active"), false);
  });

  dropZone.addEventListener("drop", handleDrop, false);
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));

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

  // --- Extract Text ---
  extractTXTsubmitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      alert("Please select a file to extract text from.");
      return;
    }

    const originalButtonText = extractTXTsubmitButton.innerHTML;
    extractTXTsubmitButton.disabled = true;
    extractTXTsubmitButton.innerHTML = "Extracting text with AI...";

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

      extractedTextOutput.textContent = extractedTextContent.trim()
        ? extractedTextContent
        : "[No text could be extracted from the document.]";

      textPlaceholder.classList.add("hidden");
      textOutputWrapper.classList.remove("hidden");

      try {
        extractedQnA = JSON.parse(extractedTextContent);
      } catch {
        extractedQnA = [{ question: "Student Submission", answer: extractedTextContent }];
      }

      extractTXTsubmitButton.innerHTML = "Text Extraction Complete";
    } catch (error) {
      console.error("Error during file processing:", error);
      alert("An error occurred while extracting text. Check the console.");

      extractTXTsubmitButton.innerHTML = originalButtonText;
      textPlaceholder.classList.remove("hidden");
      textOutputWrapper.classList.add("hidden");
      extractedTextContent = null;
      extractedQnA = null;
    } finally {
      extractTXTsubmitButton.disabled = false;
    }
  });

  // --- Submit Extracted Text ---
  submitExtractedBtn.addEventListener("click", async () => {
    if (!modifiedQnA.innerText.trim()) {
      alert("No extracted text available to submit.");
      return;
    }


    const originalButtonText = submitExtractedBtn.innerHTML;
    submitExtractedBtn.disabled = true;
    submitExtractedBtn.innerHTML = "Submitting data...";

    const payload = {
      studentName: studentName.value,
      rollNo: rollNo.value,
      modifiedQnA: modifiedQnA.innerText,
    };

    try {
      const response = await fetch("/api/v1/evaluator/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save data");

      const result = await response.json();
      console.log("Data saved successfully:", result);

      window.location.href = result.redirect;
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while submitting the extracted text.");
    } finally {
      submitExtractedBtn.innerHTML = originalButtonText;
      submitExtractedBtn.disabled = false;
    }
  });
});
