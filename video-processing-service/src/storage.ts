// 1. GCS flie interactions
// 2. Local file interactions
import { Storage } from "@google-cloud/storage";
import fs from 'fs'; // File system lib
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage()

const rawVideoBucketName = 'rith-yt-raw-video';
const processedVideoBucketName = 'rith-yt-processed-video';


const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 *  Creates the local directories for raw and processed videos.
 * 
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}


/**
 * @param rawVideoName - The name of the file to convert form {@link localRawVideoPath}
 * @param processedVideoName - The name of the fiel to convert to {@link localProcessedVidoePath}
 * @returns A promise that resolves when the video has been converted.
 */

export function convertVideo(rawVideoName: String, processedVideoName: String) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions('-vf', 'scale=-1:360') // 360p
            .on('end', function () {
                console.log('Processing finished successfully');
                resolve();
            })
            .on('error', function (err: any) {
                console.log('An error occurred: ' + err.message);
                reject(err)
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });

}

/**
 * @param filename - The name os the file to downloand from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 * 
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` })

    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`)
}

/**
 * @param fileName - The name of the fiel to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {

    const bucket = storage.bucket(processedVideoBucketName);

    bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });
    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`)

    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the 
 * {@link localRawVideoPath} folder.
 * @returns A promise the resolves when the file has been deleted.
 */

export function deleteRawVideo(filename: String) {
    return deleteFile(`${localRawVideoPath}/${filename}`);
}

/**
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise the resolves when the file has been deleted.
 */

export function deleteProcessedVideo(filename: String) {
    return deleteFile(`${localProcessedVideoPath}/${filename}`);
}


/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted. 
 */

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err)
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}`)
            resolve();
        }
    });
}


/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
*/
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}