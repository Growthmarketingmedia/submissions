// Test script to send another submission to verify count increases

const testSubmission = {
    websiteName: "Optima Spray Foam",
    websiteUrl: "https://www.optimasprayfoam.com",
    formData: {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "555-5678",
        service: "Commercial Spray Foam",
        message: "Testing count increment - submission #3"
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
        console.log('Submission Response:', data);
        if (data.success) {
            console.log('✅ Submission #3 saved! ID:', data.submissionId);
            console.log('Now check the dashboard - should show 3 total submissions');
        } else {
            console.log('❌ Failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
