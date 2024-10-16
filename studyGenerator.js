const dayjs = require("dayjs");
const dcmjs = require("dcmjs");
const { DicomMetaDictionary } = dcmjs.data;
const { faker } = require("@faker-js/faker");
const { SeriesGenerator } = require("./seriesGenerator");

class StudyGenerator {
    /**
     * 
     * @param {import("./patientGenerator").PatientGenerator} patient 
     * @param {number} [seriesNum]
     * @param {number} [instancesNum=1] 
     */
    constructor(patient, seriesNum = 1, instancesNum = 1) {
        this.patient = patient;
        this.studyInstanceUID = DicomMetaDictionary.uid();
        this.studyID = faker.string.alphanumeric(6).toUpperCase();
        this.studyDate = dayjs(faker.date.between({ from: '1900-01-01', to: '2024-01-01' })).format('YYYYMMDD');
        this.studyTime = dayjs(faker.date.between({ from: '1900-01-01', to: '2024-01-01' })).format('hhmmss');
        this.accessionNumber = faker.string.alphanumeric(6).toUpperCase();
        this.referringPhysicianName = `${faker.person.fullName().toUpperCase()}^${faker.person.fullName().toUpperCase()}`;
        this.studyDescription = faker.lorem.sentence();

        this.seriesNum = seriesNum;
        this.instancesNum = instancesNum;
    }

    async generate() {
        for (let i = 0; i < this.seriesNum; i++) {
            let seriesGenerator = new SeriesGenerator(this, i+1, this.instancesNum);
            await seriesGenerator.generate();
        }
    }
}

module.exports = {
    StudyGenerator
};