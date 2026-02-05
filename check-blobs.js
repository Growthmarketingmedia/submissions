// Check how many blobs exist in storage

fetch('https://submissions-lovat.vercel.app/api/test-blob-list')
    .then(response => response.json())
    .then(data => {
        console.log('Blob Storage Status:');
        console.log(`Total blobs: ${data.blobCount}`);
        console.log(`\nAll blobs:`);
        data.blobs.forEach((blob, index) => {
            console.log(`${index + 1}. ${blob.pathname}`);
        });

        if (data.blobCount === 3) {
            console.log('\n✅ All 3 submissions are in blob storage');
            console.log('❌ But API is only counting 2 - deployment issue');
        } else {
            console.log(`\n❌ Only ${data.blobCount} blobs found - third submission may have failed`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
