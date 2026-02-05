// Test what the websites API is returning

fetch('https://submissions-lovat.vercel.app/api/websites')
    .then(response => response.json())
    .then(data => {
        console.log('API Response:', JSON.stringify(data, null, 2));
        if (data.success && data.data.length > 0) {
            const optima = data.data.find(w => w.name === 'Optima Spray Foam');
            if (optima) {
                console.log(`\nOptima Spray Foam count: ${optima.submissionCount}`);
                console.log(`Expected: 3`);
                console.log(`Match: ${optima.submissionCount === 3 ? '✅' : '❌'}`);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
