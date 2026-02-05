// Test script to check if the websites API is working

fetch('https://submissions-lovat.vercel.app/api/websites')
    .then(response => response.json())
    .then(data => {
        console.log('Websites API Response:', JSON.stringify(data, null, 2));
        if (data.success) {
            console.log(`✅ Found ${data.count} websites`);
            if (data.count === 0) {
                console.log('⚠️ No websites found - checking if getWebsites() is reading from Blob correctly');
            }
        } else {
            console.log('❌ API Error:', data.message);
        }
    })
    .catch(error => {
        console.error('❌ Fetch Error:', error);
    });
