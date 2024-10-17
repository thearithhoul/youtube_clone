import express from 'express';

import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from './storage';


// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());

app.post('/proces-video', async function (req, res) {
    // Ge the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }

    } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request: missing filename.');
        return;
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);
    try {
        // convert the video to 360p
        await convertVideo(inputFileName, outputFileName);

    } catch (error) {
        await Promise.all([deleteRawVideo(inputFileName),
        deleteProcessedVideo(inputFileName)]);

        console.error(error);
        res.status(500).send('Internal Server Error: video processing failed.');
        return;
    }
    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    await Promise.all([deleteRawVideo(inputFileName),
    deleteProcessedVideo(inputFileName)]);

    res.status(200).send('Processing finished successfully');
    return;


});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});