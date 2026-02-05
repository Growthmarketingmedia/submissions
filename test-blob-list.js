// Test script to check if we can list blobs directly

fetch('https://submissions-lovat.vercel.app/api/test-blob-list')
    .then(response => response.json())
    .then(data => {
        console.log('Blob List Test:', JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error);
    });
