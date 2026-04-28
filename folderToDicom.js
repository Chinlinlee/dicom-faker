const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const dayjs = require("dayjs");
const dcmjs = require("dcmjs");
const { faker } = require("@faker-js/faker");
const sharp = require("sharp");
const { GlobalArgs } = require("./globalArgs");
const { InstanceGenerator } = require("./instanceGenerator");

const { DicomMetaDictionary } = dcmjs.data;

function collectJpegFiles(inputFolder) {
    const entries = fs.readdirSync(inputFolder, { withFileTypes: true });
    const imageFiles = [];

    for (const entry of entries) {
        const fullPath = path.join(inputFolder, entry.name);
        if (entry.isDirectory()) {
            imageFiles.push(...collectJpegFiles(fullPath));
            continue;
        }

        if (/\.(jpe?g)$/i.test(entry.name)) {
            imageFiles.push(fullPath);
        }
    }

    return imageFiles.sort((left, right) => left.localeCompare(right));
}

function createPatient() {
    return {
        birthDate: dayjs(faker.date.birthdate({ min: 18, max: 90, mode: "age" })).format("YYYYMMDD"),
        patientID: faker.string.alphanumeric(6).toUpperCase(),
        patientName: `${faker.person.firstName().toUpperCase()}^${faker.person.lastName().toUpperCase()}`,
        sex: "O",
    };
}

function createStudy(patient) {
    return {
        patient,
        studyInstanceUID: DicomMetaDictionary.uid(),
        studyID: faker.string.alphanumeric(6).toUpperCase(),
        studyDate: dayjs().format("YYYYMMDD"),
        studyTime: dayjs().format("HHmmss"),
        accessionNumber: faker.string.alphanumeric(6).toUpperCase(),
        referringPhysicianName: `${faker.person.fullName().toUpperCase()}^${faker.person.fullName().toUpperCase()}`,
    };
}

function createSeries(study) {
    return {
        study,
        modality: "CT",
        seriesInstanceUID: DicomMetaDictionary.uid(),
        seriesNumber: 1,
    };
}

async function generateDicomFromFolder(inputFolder) {
    const imageFiles = collectJpegFiles(inputFolder);

    if (!imageFiles.length) {
        throw new Error(`No JPG files found in folder: ${inputFolder}`);
    }

    const patient = createPatient();
    const study = createStudy(patient);
    const series = createSeries(study);

    for (let index = 0; index < imageFiles.length; index++) {
        const imageFile = imageFiles[index];
        const sourceBuffer = await fs.promises.readFile(imageFile);
        const image = sharp(sourceBuffer, { failOn: "none" });
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error(`Unable to determine image dimensions: ${imageFile}`);
        }

        const imageBuffer = await image
            .jpeg()
            .toBuffer();

        const instanceGenerator = new InstanceGenerator(series, index + 1, {
            frameBuffers: [imageBuffer],
            rows: metadata.height,
            columns: metadata.width,
        });

        await instanceGenerator.generate();
    }
}

const program = new Command();

program
    .argument("<input>", "folder containing jpg images")
    .argument("[output]", "output path", "./dicom")
    .parse(process.argv);

const [inputFolderArg, outputFolderArg] = program.args;
const inputFolder = path.resolve(inputFolderArg);

if (!fs.existsSync(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
    throw new Error(`Input folder does not exist or is not a directory: ${inputFolder}`);
}

GlobalArgs.output = outputFolderArg;
GlobalArgs.useLoremImage = false;
GlobalArgs.numberOfFrames = 1;

(async () => {
    await generateDicomFromFolder(inputFolder);
})();