const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Configure storage client using environment variables
const projectId = process.env.GCP_PROJECT_ID;
const keyFilename = process.env.GCP_KEY_FILE;
const bucketName = process.env.GCP_BUCKET_NAME;

if (!bucketName) {
	console.warn('GCP_BUCKET_NAME is not set. GCP uploads will fail until configured.');
}

const storage = new Storage({
	projectId,
	keyFilename,
});

const bucket = bucketName ? storage.bucket(bucketName) : null;

/**
 * Upload a file to GCP Storage.
 * Accepts either a Multer `file` with a `buffer` or a local `path` (disk storage).
 * Returns the public URL of the uploaded file (if `makePublic` true) or the gs:// path.
 *
 * @param {Object} file - Multer file object (with `buffer`) or an object with `path`.
 * @param {string} [folder='uploads'] - Optional folder name inside the bucket.
 * @param {boolean} [makePublic=true] - Whether to make the uploaded file public.
 * @returns {Promise<string>} public URL or gs:// URL
 */
async function uploadFileToBucket(file, folder = 'uploads', makePublic = true) {
    if (!bucket) throw new Error('GCP_BUCKET_NAME is not configured');
    if (!file) throw new Error('No file provided');

    const timestamp = Date.now();
    const originalName = (file.originalname || path.basename(file.path || 'file')).replace(/\s+/g, '_');
    const filename = `${timestamp}-${originalName}`;
    const destination = folder ? `${folder}/${filename}` : filename;

    try {
        const gcpFile = bucket.file(destination);

        if (file.buffer) {
            await gcpFile.save(file.buffer, {
                resumable: false,
                metadata: {
                    contentType: file.mimetype || 'application/octet-stream',
                },
            });
        } else if (file.path) {
            await bucket.upload(file.path, {
                destination,
                metadata: {
                    contentType: file.mimetype || 'application/octet-stream',
                },
            });
        } else {
            throw new Error('File object must contain `buffer` or `path`');
        }

        if (makePublic) {
            // Generate a signed URL instead of making public
			//Temporary workaround until proper public access is set up, currently blocked by org policy
            const [signedUrl] = await gcpFile.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 24 hours
            });
            return signedUrl;
        }

        return `gs://${bucketName}/${destination}`;
    } catch (err) {
        console.error('uploadFileToBucket error:', err);
        throw err;
    }
}


/**
 * Delete a file from the GCP bucket.
 * @param {string} filePath - Path inside the bucket (e.g., 'uploads/12345-file.png')
 */
async function deleteFileFromBucket(filePath) {
	if (!bucket) throw new Error('GCP_BUCKET_NAME is not configured');
	if (!filePath) throw new Error('filePath is required');

	try {
		const gcpFile = bucket.file(filePath);
		await gcpFile.delete();
	} catch (err) {
		console.error('deleteFileFromBucket error:', err);
		throw err;
	}
}

/**
 * Return the public HTTPS URL for a file in the bucket.
 * Note: file must be public for this URL to be accessible.
 */
function getPublicUrl(filePath) {
	if (!bucketName) throw new Error('GCP_BUCKET_NAME is not configured');
	return `https://storage.googleapis.com/${bucketName}/${filePath}`;
}

module.exports = {
	uploadFileToBucket,
	deleteFileFromBucket,
	getPublicUrl,
};

