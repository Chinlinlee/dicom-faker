const path = require("path");
const dcmjs = require("dcmjs");
const { DicomMetaDictionary, DicomDict } = dcmjs.data;
const { faker } = require("@faker-js/faker");
const { JpegGenerator } = require("./jpegGenerator");
const { DicomUID } = require("dicom-uid");
const mkdirp = require("mkdirp");
const fs = require("fs");
const { GlobalArgs } = require("./globalArgs");

const NUMBER_OF_FRAMES = 3;
const FRAMES_PER_SEC = 10;

class InstanceGenerator {
    /**
     * 
     * @param {import("./seriesGenerator").SeriesGenerator} series 
     * @param {number} num 
     */
    constructor(series, num = 1) {
        this.series = series;
        this.instanceNumber = num.toString();
    }

    #getFrames() {
        const frameBuffers = [];

        for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
            let frameBuffer = JpegGenerator.generate(i.toString());
            if (frameBuffer.length & 1) {
                frameBuffer = Buffer.concat([frameBuffer, Buffer.from([0x00])]);
            }

            frameBuffers.push(frameBuffer.buffer);
        }

        return frameBuffers;
    }

    generate() {
        let sopInstanceUID = DicomMetaDictionary.uid();

        const dataset = {
            _vrMap: {
                PixelData: 'OB',
            },
            _meta: {
                _vrMap: {},
                FileMetaInformationVersion: new Uint8Array([0, 1]).buffer,
                MediaStorageSOPClassUID: DicomUID.MultiframeTrueColorSecondaryCaptureSopClassUid,
                MediaStorageSOPInstanceUID: sopInstanceUID,
                TransferSyntaxUID: DicomUID.JPEGBaseline8Bit,
                ImplementationClassUID: '1.3.6.1.4.1.30071.8',
            },
            // Patient Module Attributes
            PatientID: this.series.study.patient.patientID,
            PatientName: this.series.study.patient.patientName,
            PatientBirthDate: this.series.study.patient.birthDate,
            PatientSex: 'O',

            // General Study Module Attributes
            StudyInstanceUID: this.series.study.studyInstanceUID,
            StudyDate: this.series.study.studyDate,
            StudyTime: this.series.study.studyTime,
            StudyID: this.series.study.studyID,
            AccessionNumber: this.series.study.accessionNumber,
            ReferringPhysicianName: this.series.study.referringPhysicianName,

            // General Series Module Attributes
            Modality: this.series.modality,
            SeriesInstanceUID: this.series.seriesInstanceUID,
            SeriesNumber: this.series.seriesNumber,
            Laterality: '',

            // General/SC Equipment Module Attributes
            Manufacturer: `${faker.company.name().toUpperCase()}`,
            ManufacturerModelName: `${faker.commerce.productName().toUpperCase()}`,
            DeviceSerialNumber: `${faker.string.alphanumeric(6).toUpperCase()}`,
            SoftwareVersions: `${faker.string.alphanumeric(1).toUpperCase()}.${faker.string
                .alphanumeric(2)
                .toUpperCase()}`,
            ConversionType: 'SYN',

            // General/SC Image Module Attributes
            InstanceNumber: this.instanceNumber,
            AcquisitionDateTime: `${this.series.study.studyDate}${this.series.study.studyTime}`,
            ContentDate: this.series.study.studyDate,
            ContentTime: this.series.study.studyTime,
            BurnedInAnnotation: 'NO',
            PatientOrientation: '',

            // Image Pixel Module Attributes
            SamplesPerPixel: 3,
            PhotometricInterpretation: 'YBR_FULL_422',
            PlanarConfiguration: 0,
            NumberOfFrames: `${NUMBER_OF_FRAMES}`,
            Rows: 512,
            Columns: 512,
            BitsAllocated: 8,
            BitsStored: 8,
            HighBit: 7,
            PixelRepresentation: 0,
            PixelData: this.#getFrames(),

            FrameIncrementPointer: attributeNameToIdentifier('FrameTime'),

            // Cine Module Attributes
            FrameTime: `${NUMBER_OF_FRAMES === 1 ? '0' : 1000 / FRAMES_PER_SEC}`,
            FrameDelay: '0.0',

            // SOP Common Module Attributes
            SOPClassUID: DicomUID.MultiframeTrueColorSecondaryCaptureSopClassUid,
            SOPInstanceUID: sopInstanceUID,
            SpecificCharacterSet: 'ISO_IR 100',
        };

        const denaturalizedMetaHeader = DicomMetaDictionary.denaturalizeDataset(dataset._meta);
        const dicomDict = new DicomDict(denaturalizedMetaHeader);
        dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(dataset);

        let dicomBuffer = Buffer.from(dicomDict.write({ fragmentMultiframe: false }));
        
        let output = path.join(
            GlobalArgs.output,
            this.series.study.studyInstanceUID,
            this.series.seriesInstanceUID,
            `${this.instanceNumber}.dcm`
        );
        mkdirp.sync(path.resolve(path.dirname(output)), 0o755);

        fs.writeFileSync(output, dicomBuffer);
    }
}

/**
 * Get the attribute identifier from name.
 * @method
 * @param {string} text - Attribute name.
 * @returns {number} Attribute identifier.
 */
function attributeNameToIdentifier(attributeName) {
    let identifier = undefined;
    Object.keys(DicomMetaDictionary.dictionary).forEach((tag) => {
        const dictionaryEntry = DicomMetaDictionary.dictionary[tag];
        if (dictionaryEntry.version === 'DICOM' && attributeName === dictionaryEntry.name) {
            const group = Number(`0x${dictionaryEntry.tag.substring(1, 5)}`);
            const element = Number(`0x${dictionaryEntry.tag.substring(6, 10)}`);
            identifier = (group << 16) | (element & 0xffff);
        }
    });

    return identifier;
}

module.exports = {
    InstanceGenerator
};