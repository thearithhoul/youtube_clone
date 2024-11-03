import express from 'express';

import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from './storage';
import { isVideoNew, setVideo } from './firestore';


// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());

app.post('/process-video', async (req, res): Promise<any> => {

    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];

    // Download the raw video from Cloud Storage
    downloadVideo(outputFileName, inputFileName, videoId, res)

    // Process the video into 360p
    try {
        await convertVideo(inputFileName, outputFileName)
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        return res.status(500).send('Processing failed');
    }

    // Upload the processed video to Cloud Storage
    uploadVideo(outputFileName, inputFileName, videoId);

    return res.status(200).send('Processing finished successfully');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


async function downloadVideo(outputFileName: string, inputFileName: string, videoId: string, res: any) {

    if (!isVideoNew(videoId)) {
        return res.status(400).send('Bad Request: video already processing or processed');
    } else {
        await setVideo(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: 'processing'

        })
    }


    await downloadRawVideo(inputFileName);

}

async function uploadVideo(outputFileName: string, inputFileName: string, videoId: string) {

    await uploadProcessedVideo(outputFileName);

    await setVideo(videoId, {
        status: 'done',
        filename: outputFileName
    })

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);
}