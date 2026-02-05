// Test script to send a submission directly to the API
// This bypasses the Optima Spray Foam form so no email is sent to the client

const testSubmission = {
    websiteName: "Optima Spray Foam",
    websiteUrl: "https://www.optimasprayfoam.com",
    formData: {
        name: "Test User",
        email: "test@example.com",
        phone: "555-1234",
        service: "Residential Spray Foam",
        message: "This is a test submission to verify the API works"
    }
};

fetch('https://submissions-lovat.vercel.app/api/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testSubmission)
})
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (data.success) {
            console.log('✅ Submission saved! Check https://submissions-lovat.vercel.app/');
        } else {
            console.log('❌ Failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
