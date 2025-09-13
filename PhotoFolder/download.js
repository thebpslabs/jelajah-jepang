const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- 1. YOUR CONFIGURATION ---
const ACCESS_KEY = "3T59bhojEzkqAu8J6SSl89JwS5vd7WrvjCGlXTE2Hs0";
const SEARCH_QUERY = "Restaurant Japan";
const NUM_PHOTOS = 30;
const DOWNLOAD_FOLDER = "Unsplash_JS_Download";
const FILENAME_PREFIX = "restoran1";

// --- 2. CHANGE THESE FOR EACH RUN ---
const PAGE_NUMBER = 2;
const STARTING_FILE_NUMBER = 31;

// --- 3. THE SCRIPT ---

async function downloadImage(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function main() {
    if (ACCESS_KEY === "PASTE_YOUR_UNSPLASH_ACCESS_KEY_HERE") {
        console.error("ERROR: Please paste your Unsplash Access Key into the script.");
        return;
    }
    if (!fs.existsSync(DOWNLOAD_FOLDER)) {
        fs.mkdirSync(DOWNLOAD_FOLDER);
    }

    const unsplash = axios.create({
        baseURL: "https://api.unsplash.com",
        headers: { "Authorization": `Client-ID ${ACCESS_KEY}` }
    });

    console.log(`Starting download for page ${PAGE_NUMBER} of '${SEARCH_QUERY}'...`);

    try {
        const searchResponse = await unsplash.get("/search/photos", {
            params: { query: SEARCH_QUERY, per_page: NUM_PHOTOS, page: PAGE_NUMBER }
        });

        const photos = searchResponse.data.results;
        console.log(`Found ${photos.length} photos. Starting download...`);

        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            
            // ** THIS IS THE CORRECT LINE THAT FIXES THE ERROR **
            const actualImageUrl = photo.urls.raw;

            if (!actualImageUrl) {
                console.error(`ERROR: Could not find a download URL for photo ID: ${photo.id}. Skipping.`);
                continue;
            }

            const fileNumber = STARTING_FILE_NUMBER + i;
            const filenameBase = `${FILENAME_PREFIX}-${String(fileNumber).padStart(2, '0')}`;
            const imageFilepath = path.join(DOWNLOAD_FOLDER, `${filenameBase}.jpg`);
            
            await downloadImage(actualImageUrl, imageFilepath);
            console.log(`  Downloaded: ${filenameBase}.jpg`);

            const creditFilepath = path.join(DOWNLOAD_FOLDER, `${filenameBase}.txt`);
            const photographerName = photo.user.name;
            const photographerLink = photo.user.links.html;
            const creditText = `Photo by ${photographerName} on Unsplash.\nProfile: ${photographerLink}`;
            fs.writeFileSync(creditFilepath, creditText);
            console.log(`  Saved credit: ${filenameBase}.txt`);
        }
        console.log("\nDownload complete!");

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

main();