const dayjs = require("dayjs");
const dcmjs = require("dcmjs");
const { DicomMetaDictionary } = dcmjs.data;
const { faker } = require("@faker-js/faker");
const { InstanceGenerator } = require("./instanceGenerator");

class SeriesGenerator {
    /**
     * 
     * @param {import("./studyGenerator").StudyGenerator} study
     * @param {number} [seriesNum=1] 
     * @param {number} [instancesNum=1] 
     */
    constructor(study, seriesNum = 1, instancesNum = 1) {
        this.study = study;
        this.modality = 'CT';
        this.seriesInstanceUID = DicomMetaDictionary.uid();
        this.seriesNumber = seriesNum;
        this.seriesDate = dayjs(faker.date.between({ from: '1900-01-01', to: '2024-01-01' })).format('YYYYMMDD');
        this.seriesTime = dayjs(faker.date.between({ from: '1900-01-01', to: '2024-01-01' })).format('hhmmss');
        this.seriesDescription = faker.lorem.sentence();
        this.laterality = '';

        this.instancesNum = instancesNum;
    }

    async generate() {
        for (let i = 0; i < this.instancesNum; i++) {
            let instanceGenerator = new InstanceGenerator(this, i + 1);
            await instanceGenerator.generate();
        }
    }
}

module.exports = {
    SeriesGenerator
};