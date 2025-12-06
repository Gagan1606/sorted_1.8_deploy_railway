const express = require('express');
const app = express();
const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/1_4_db";
const mongoURI=process.env.MONGO_URI
const multer = require('multer');
const upload = multer();
const session = require('express-session');
const { RekognitionClient, CreateCollectionCommand, IndexFacesCommand, SearchFacesByImageCommand, DetectFacesCommand } = require('@aws-sdk/client-rekognition');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
// const { Facenet } = require('facenet');
const axios = require('axios');
const FormData = require('form-data');

// app.use(session({
//     secret: 'Gagan',
//     resave: false,
//     saveUninitialized: false
// }));


app.use(session({
    secret: 'Gagan',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'none',  // allow cross-site
        secure: false       // required for sameSite:none; backend must be HTTPS
    }
}));

app.use('/css1', express.static(path.join(__dirname, '../frontend/css1')));
const cors = require('cors');

const FRONTEND_ORIGIN = 'https://Gagan1606.github.io'; // adjust to your GH pages base

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));


const client = new RekognitionClient({ region: process.env.AWS_REGION });
async function createCollection() {
    try {
        const out = await client.send(
            new CreateCollectionCommand({ CollectionId: '1.4_collection' })
        );
        console.log('Collection creation output:', out);
    } catch (err) {
        console.error('Error creating collection:', err);
    }
}

createCollection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
// app.listen(3000, () => console.log(`listening on http://localhost:3000/login`));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server on", PORT));
console.log(`listening on http://localhost:3000/login`);

const loginFilePath = '../frontend/login.html';
const indexFilePath = '../frontend/index.html';
const signUpFilePath = '../frontend/signUp.html';
// import path from 'path';
// const path = require('path');

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', () => { console.log('connected'); });

const Image = require('./models/imageSchema.js');
const User = require('./models/userSchema.js');
const Group = require('./models/groupSchema.js');
const groupSchema = require('./models/groupSchema.js');

// import Image from '../models/imageSchema.js';
// import User from '../models/userSchema.js';
// import Group from '../models/groupSchema.js';


// app.post('/uploadToBackend', upload.array('image', 10), async (req, res) => {
//     try {
//         for (let file of req.files) {
//             let faceListObj = (await client.send(new SearchFacesByImageCommand({
//                 CollectionId: '1.4_collection',
//                 Image: { 'Bytes': file.buffer },
//                 MaxFaces: 20,
//                 FaceMatchThreshold: 50
//             })
//             ));
//             let faceList = faceListObj.FaceMatches.map(person => person.Face.ExternalImageId);
//             for (let face of faceList) console.log(`${face}`);

//             const tempForm = new Image({
//                 photoName: file.originalname,
//                 photoData: file.buffer,
//                 photoType: file.mimetype,
//                 userId: req.body.userId,
//                 grpId: req.body.grpId,
//                 uploadedAt: new Date(),
//                 usersPresent: faceList
//             });
//             await tempForm.save();
//         }
//         console.log('saved');
//         res.json('uploaded');
//     } catch (err) {
//         console.error(err);
//         res.status(500).json('upload failed');
//     }
// });



app.get('/view/:currentUser/:groupName', async (req, res) => {
    if (req.session.userId) {
        let images = await Image.find({ grpId: req.params.groupName });
        let base64Array = images.map(image => ({
            photoName: image.photoName,
            photoData: image.photoData.toString('base64'),
            photoType: image.photoType,
            userId: image.userId,
            uploadedAt: image.uploadedAt,
            grpId: image.grpId,
            usersPresent: image.usersPresent,
            contentType: image.photoType
        }))
        res.json(base64Array);
    }
});


app.post('/login', async (req, res) => {
    console.log('entered login post route');
    const { userId, password } = req.body;
    let user = (await User.findOne({ userId: `${userId}` }));
    if (user && password == user.password) {
        // console.log('entered if');
        req.session.userId = userId;
        console.log(userId)
        res.json({ success: true })
        // .then(x => redirect('/index')).catch(err=>console.log(err));
    }
    else {
        res.json({ success: false });
    };
});

app.get('/login', async (req, res) => {
    console.log('entered /login get route');
    res.sendFile(path.join(__dirname, loginFilePath));
});

app.get("/currentUserId", (req, res) => {
    console.log('entered /currentUserId');
    if (req.session.userId) {
        // console.log({ currentUserId: req.session.userId })
        res.json({ currentUserId: req.session.userId });
    } else
        res.status(401).json({ error: "Not logged in" });
});

app.get('/index', (req, res) => {
    console.log('entered index route');
    console.log(req.session.userId);
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, indexFilePath));
    }
    else {
        res.redirect('/login');
    };
});

app.get('/signUp', (req, res) => {
    console.log('entered /signUp get');
    res.sendFile(path.join(__dirname, signUpFilePath));
});

// const facenet = new Facenet();

// app.post('/face-embed', async (req, res) => {
//     const imageBuffer = req.files.image.data; // Buffer from upload
//     const tempPath = path.join(__dirname, 'temp', `img_${Date.now()}.jpg`);
//     await fs.writeFile(tempPath, imageBuffer);

//     try {
//         const faceList = await facenet.align(tempPath);
//         for (const face of faceList) {
//             face.embedding = await facenet.embedding(face);
//         }
//         res.json({ embeddings: faceList.map(f => f.embedding) });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

app.post('/face-embed', upload.single('userProfileImage'), async (req, res) => {

    const faceIdObj = await client.send(new IndexFacesCommand({
        CollectionId: '1.4_collection',
        Image: { Bytes: req.file.buffer },
        ExternalImageId: req.body.userId
    }));
    const embedding = faceIdObj.FaceRecords[0].Face.FaceId;

    // const form = new FormData();
    // form.append('file', req.file.buffer, 'image.jpg');

    // const response = await axios.post('http://localhost:8000/face-embed', form, {
    //     headers: form.getHeaders()
    // });

    // const embedding = response.data.embedding;

    // Store/index embedding with your threshold logic
    console.log('got embedding', embedding);
    res.json({ embedding });
});

app.post('/signUp', upload.single('userProfileImage'), async (req, res) => {
    console.log('entered /signUp post');
    const { userId, password, faceEmbeddings } = req.body;
    // console.log('type of file:', req.file.mimetype);

    await User.create({
        userId,
        password,
        faceEmbedding: faceEmbeddings
    });

    // const faces = await getFaceEmbeddingsFromBuffer(req.file.buffer);

    // const base64=req.file.buffer.toString('base64');
    // const faces = await getFaceEmbeddingsFromBuffer(base64);

    // if (faces.length !== 1) {
    //     return res.status(400).json({ error: 'Please upload a clear photo with exactly one face.' });
    // }

    // const embedding = faces[0].embedding; // 128‑D array

    // const faceIdObj = await client.send(new IndexFacesCommand({
    //     CollectionId: '1.4_collection',
    //     Image: { Bytes: tempForm.buffer },
    //     ExternalImageId: userId
    // }));
    // const faceId = faceIdObj.FaceRecords[0].Face.FaceId;
    // await User.create({ userId, password, faceId });



    // const tempForm = req.file
    // const detectFaceObj = await client.send(new DetectFacesCommand({
    //     Image: { Bytes: tempForm.buffer },
    //     Attributes: ["ALL"]
    // }))
    // if (detectFaceObj.FaceDetails.sharpness >) {

    // }


    // // console.log(`created ${userId, password, faceId}`)
    // console.log('indexing successful');
    // console.log(`faceId:${faceIdObj.FaceRecords[0].Face.FaceId}`);
    // console.log(`userId:${userId}`);

    console.log('crted user');
    res.json({ success: true });

});

app.get('/crtGrp', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/crtGrp.html'));
});

app.post('/crtGrp', upload.array('image', 50), async (req, res) => {
    console.log('entered /crtGrp post');
    let faceList = [];
    for (let i of req.files) {
        let faceListObj = await client.send(new SearchFacesByImageCommand({
            CollectionId: '1.4_collection',
            Image: { 'Bytes': i.buffer },
            MaxFaces: 50,
            FaceMatchThreshold: 50
        }));
        let tempFaceList = faceListObj.FaceMatches.map(person => person.Face.ExternalImageId);
        // let tempFaceList = await mySearchFacesByImageCommand(i.buffer);

        console.log(`${tempFaceList}`);
        for (let x of tempFaceList) {
            if (!faceList.includes(x)) { faceList.push(x) };
        };
        await Image.create({
            photoName: i.originalname,
            photoData: i.buffer,
            photoType: i.mimetype,
            userId: req.session.userId,
            uploadedAt: new Date(),
            grpId: req.body.groupName,
            usersPresent: faceList
        });
        console.log('image uploaded');
    };
    await Group.create({
        groupName: req.body.groupName,
        userIds: faceList
    });
    console.log('group created');
    for (let user of faceList) {
        let temp = await User.findOne({ userId: user });
        temp.groups.push(req.body.groupName);
        temp.save();
    };
    console.log(`user's groups saved`);
    console.log(req.session.userId);
    console.log(req.body.groupName);
    // res.redirect(`/view/${req.session.userId}/${req.body.groupName}`);
    res.redirect('/index');
});


app.get('/grpList', async (req, res) => {
    console.log('entered /grpList get');
    let allGroups = await Group.find();
    let userGroups = [];
    for (let grp of allGroups) {
        if (grp.userIds.some(x => x == (req.session.userId))) {
            userGroups.push(grp);
        };
    }
    // console.log(userGroups);
    res.json(userGroups);

})

app.get('/exit', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

function getFaceEmbeddingsFromBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const py = spawn('python', [path.join(__dirname, 'face_embed.py')]);

        let out = '';
        let err = '';

        py.stdout.on('data', d => out += d.toString());
        py.stderr.on('data', d => err += d.toString());

        py.on('close', code => {
            if (code !== 0) {
                console.error('face_embed error:', err);
                return reject(new Error('face_embed failed'));
            }
            try {
                const faces = JSON.parse(out);
                resolve(faces);
            } catch (e) {
                reject(e);
            }
        });

        const b64 = buffer.toString('base64');
        py.stdin.write(b64);
        py.stdin.end();
    });
}

let myThreshold = 0.6;

function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum) < myThreshold;
}

async function mySearchFacesByImageCommand(image) {
    const faces = await getFaceEmbeddingsFromBuffer(image);
    let result = []
    for (let face of faces) {
        tempEmbedding = face.embedding;
        let users = await User.find();
        let user = users.find(u => euclideanDistance(u.faceEmbedding, tempEmbedding));
        // let user = (await User.find({ faceEmbedding: tempEmbedding })).userId
        result.push(user);
    };
    return result;
}
app.post('/uploadToBackend', upload.array('image', 10), async (req, res) => {
    try {
        console.log('entered /uploadToBackend');
        const uploadDir = path.join(__dirname, 'uploads', Date.now().toString());
        await fs.mkdir(uploadDir, { recursive: true });

        const filePaths = [];
        for (let i = 0; i < req.files.length; i++) {
            const filePath = path.join(uploadDir, `${i}_${req.files[i].originalname}`);
            await fs.writeFile(filePath, req.files[i].buffer);
            filePaths.push(filePath);
        }
        console.log('created temporary file paths');

        //DEDUP
        const pythonProcess = spawn('python', [path.join(__dirname, 'image-dedup.py'), uploadDir]);
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error('Deduplication failed with code', code);
                return res.status(500).json('upload failed');
            }
            console.log('entered pythonProcess')

            const duplicates = JSON.parse(output);
            console.log('duplicates from python:', duplicates);

            const keepFiles = new Set();
            const seen = new Set();

            // For each original and its duplicate list
            for (let [original, dups] of Object.entries(duplicates)) {
                // If we have already decided to keep or skip this original, skip processing it again
                if (seen.has(original)) continue;

                // Mark everything in this group as seen
                seen.add(original);
                dups.forEach(d => seen.add(d));

                keepFiles.add(original);
            }

            // Add files that are not mentioned in duplicates at all (completely unique)
            filePaths.forEach(fp => {
                const filename = path.basename(fp);
                if (!duplicates.hasOwnProperty(filename) && !seen.has(filename)) {
                    keepFiles.add(filename);
                }
            });

            console.log('keepFiles after dedup:', keepFiles);

            const uniqueImages = [];
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const filename = `${i}_${file.originalname}`;
                if (keepFiles.has(filename)) {
                    let faceListObj = await client.send(new SearchFacesByImageCommand({
                        CollectionId: '1.4_collection',
                        Image: { 'Bytes': file.buffer },
                        MaxFaces: 20,
                        FaceMatchThreshold: 50
                    }));
                    let faceList = faceListObj.FaceMatches.map(person => person.Face.ExternalImageId);

                    // console.log('face_embed buffer length:', file.photoData.length);
                    // let faceList = await mySearchFacesByImageCommand(file.buffer);

                    const tempForm = new Image({
                        photoName: file.originalname,
                        photoData: file.buffer,
                        photoType: file.mimetype,
                        userId: req.body.userId,
                        grpId: req.body.grpId,
                        uploadedAt: new Date(),
                        usersPresent: faceList
                    });
                    await tempForm.save();
                    console.log('saved image');
                    uniqueImages.push(tempForm);
                }
            }

            await fs.rm(uploadDir, { recursive: true });
            res.json({ uploaded: uniqueImages.length, total: req.files.length });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json('upload failed');
    }
});



// app.post('/uploadToBackend', upload.array('image', 10), async (req, res) => {
//     try {
//         console.log('entered /uploadToBackend');
//         const uploadDir = path.join(__dirname, 'uploads', Date.now().toString());
//         await fs.mkdir(uploadDir, { recursive: true });

//         const filePaths = [];
//         for (let i = 0; i < req.files.length; i++) {
//             const filePath = path.join(uploadDir, `${i}_${req.files[i].originalname}`);
//             await fs.writeFile(filePath, req.files[i].buffer);
//             filePaths.push(filePath);
//         }
//         console.log('created temporary file paths');

//         //DEDUP
//         const pythonProcess = spawn('python', [path.join(__dirname, 'image-dedup.py'), uploadDir]);
//         let output = '';
//         pythonProcess.stdout.on('data', (data) => {
//             output += data.toString();
//         });

//         pythonProcess.on('close', async (code) => {
//             if (code !== 0) {
//                 console.error('Deduplication failed with code', code);
//                 return res.status(500).json('upload failed');
//             }
//             console.log('entered pythonProcess')
//             //console.log('entered pythonProcess');

//             // const duplicates = JSON.parse(output);
//             // console.log(duplicates);
//             // const keepFiles = new Set();

//             // for (let [original, dups] of Object.entries(duplicates)) {
//             //     keepFiles.add(original);
//             // }

//             // filePaths.forEach(fp => {
//             //     const filename = path.basename(fp);
//             //     if (!Object.keys(duplicates).some(
//             //         key => key === filename || (duplicates[key] && duplicates[key].includes(filename))
//             //     )) {
//             //         keepFiles.add(filename);
//             //     }
//             // });

//             // const duplicates = JSON.parse(output);
//             // console.log(duplicates);

//             // const keepFiles = new Set();
//             // const skipFiles = new Set();

//             // // 1. For every duplicate group, keep the first key, skip its duplicates
//             // for (let [original, dups] of Object.entries(duplicates)) {
//             //     if (dups && dups.length > 0) {
//             //         keepFiles.add(original);        // keep one representative
//             //         dups.forEach(dup => skipFiles.add(dup)); // mark others to skip
//             //     }
//             // }

//             // // 2. Add files that are not mentioned in duplicates at all
//             // filePaths.forEach(fp => {
//             //     const filename = path.basename(fp);
//             //     if (!duplicates.hasOwnProperty(filename)) {
//             //         keepFiles.add(filename);
//             //     }
//             // });

//             // // 3. Make sure none of the “skip” ones stay in keepFiles
//             // skipFiles.forEach(f => keepFiles.delete(f));

//             const duplicates = JSON.parse(output);
//             console.log('duplicates from python:', duplicates);

//             const keepFiles = new Set();
//             const seen = new Set();

//             // For each original and its duplicate list
//             for (let [original, dups] of Object.entries(duplicates)) {
//                 // If we have already decided to keep or skip this original, skip processing it again
//                 if (seen.has(original)) continue;

//                 // Mark everything in this group as seen
//                 seen.add(original);
//                 dups.forEach(d => seen.add(d));

//                 // Decide which one to keep for this group.
//                 // Example: keep the first one (original).
//                 keepFiles.add(original);
//             }

//             // Add files that are not mentioned in duplicates at all (completely unique)
//             filePaths.forEach(fp => {
//                 const filename = path.basename(fp);
//                 if (!duplicates.hasOwnProperty(filename) && !seen.has(filename)) {
//                     keepFiles.add(filename);
//                 }
//             });

//             console.log('keepFiles after dedup:', keepFiles);

//             const uniqueImages = [];
//             for (let i = 0; i < req.files.length; i++) {
//                 const file = req.files[i];
//                 const filename = `${i}_${file.originalname}`;
//                 if (keepFiles.has(filename)) {
//                     let faceListObj = await client.send(new SearchFacesByImageCommand({
//                         CollectionId: '1.4_collection',
//                         Image: { 'Bytes': file.buffer },
//                         MaxFaces: 20,
//                         FaceMatchThreshold: 50
//                     }));
//                     let faceList = faceListObj.FaceMatches.map(person => person.Face.ExternalImageId);

//                     const tempForm = new Image({
//                         photoName: file.originalname,
//                         photoData: file.buffer,
//                         photoType: file.mimetype,
//                         userId: req.body.userId,
//                         grpId: req.body.grpId,
//                         uploadedAt: new Date(),
//                         usersPresent: faceList
//                     });
//                     await tempForm.save();
//                     uniqueImages.push(tempForm);
//                 }
//             }

//             await fs.rm(uploadDir, { recursive: true });
//             res.json({ uploaded: uniqueImages.length, total: req.files.length });
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json('upload failed');
//     }
// });

