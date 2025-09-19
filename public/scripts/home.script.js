document.addEventListener('DOMContentLoaded', () => {
    // Select the form by its ID
    const evaluationForm = document.getElementById('evaluation-form');

    // Add a submit event listener to the form
    evaluationForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior (which reloads the page)
        event.preventDefault();

        // 1. Get references to all the form inputs
        const studentNameInput = document.getElementById('studentName');
        const rollNoInput = document.getElementById('rollNo');
        const referenceInput = document.getElementById('reference');
        const fileInput = document.getElementById('file-upload');

        // 2. Create a new FormData object
        // This object is designed to handle form data, especially for file uploads.
        const formData = new FormData();

        // 3. Append the data from the form to the FormData object
        // The first argument is the 'key' (like in a JSON object), which your server will use to access the data.
        // The second argument is the 'value'.
        formData.append('studentName', studentNameInput.value);
        formData.append('rollNo', rollNoInput.value);
        formData.append('reference', referenceInput.value);
        
        // For files, we need to get the file object from the input's `files` collection
        if (fileInput.files.length > 0) {
            formData.append('answerFile', fileInput.files[0]);
        } else {
            // Handle case where no file is selected, if required
            console.error("No file selected!");
            alert("Please upload an answer sheet.");
            return;
        }

        // --- Example: How to send this data with Axios ---
        
        console.log('FormData object created. Ready to send.');

        // For demonstration, let's log the key-value pairs
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        const url = '/upload'; // Your backend API endpoint

        try {
            /*
            // 4. Make the POST request using Axios
            // The 'formData' object is passed directly as the request body.
            // Axios will automatically set the correct 'Content-Type' header to 'multipart/form-data'.
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Server response:', response.data);
            alert('File uploaded and evaluation started successfully!');
            */
           
           alert('FormData is ready! Check the console to see the data that would be sent.');

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('There was an error uploading the file.');
        }
    });
});
