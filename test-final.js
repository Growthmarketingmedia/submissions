// Test submission #4 to verify count increases to 3

const testSubmission = {
    websiteName: "Optima Spray Foam",
    websiteUrl: "https://www.optimasprayfoam.com",
    formData: {
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "555-9999",
        service: "Attic Insulation",
        message: "Final test to verify count increases correctly"
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
            console.log('✅ Submission saved! ID:', data.submissionId);

            // Wait 2 seconds then check the count
            setTimeout(() => {
                fetch('https://submissions-lovat.vercel.app/api/websites')
                    .then(r => r.json())
                    .then(websites => {
                        const optima = websites.data.find(w => w.name === 'Optima Spray Foam');
                        console.log(`\n📊 Current count: ${optima.submissionCount}`);
                        console.log(`Expected: 3`);
                        console.log(optima.submissionCount === 3 ? '✅ COUNT IS CORRECT!' : '❌ Still showing wrong count');
                    });
            }, 2000);
        } else {
            console.log('❌ Failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
