// Send another test submission

const testSubmission = {
    websiteName: "Optima Spray Foam",
    websiteUrl: "https://www.optimasprayfoam.com",
    formData: {
        name: "Sarah Williams",
        email: "sarah@example.com",
        phone: "555-7777",
        service: "Wall Insulation",
        message: "Testing after cache fix"
    }
};

console.log('Sending test submission...');

fetch('https://submissions-lovat.vercel.app/api/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testSubmission)
})
    .then(response => response.json())
    .then(data => {
        console.log('✅ Submission Response:', data);

        // Wait 3 seconds then check the count
        console.log('\nWaiting 3 seconds for deployment...');
        setTimeout(() => {
            console.log('Checking website count...\n');
            fetch('https://submissions-lovat.vercel.app/api/websites')
                .then(r => r.json())
                .then(websites => {
                    const optima = websites.data.find(w => w.name === 'Optima Spray Foam');
                    console.log(`📊 Optima Spray Foam count: ${optima.submissionCount}`);
                    console.log(`\nNow refresh the dashboard homepage to see if it shows the correct count!`);
                });
        }, 3000);
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
