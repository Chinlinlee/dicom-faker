const dayjs = require("dayjs");
const { faker } = require("@faker-js/faker");
const { StudyGenerator } = require("./studyGenerator");

class PatientGenerator {
    constructor(studiesNum = 1, seriesNum = 1, instancesNum = 1) {
        this.birthDate = dayjs(faker.date.between({ from: '1900-01-01', to: '2024-01-01' })).format('YYYYMMDD');
        this.patientID = faker.string.alphanumeric(6).toUpperCase();
        this.patientName = `${faker.person.firstName().toUpperCase()}^${faker.person.lastName().toUpperCase()}`
        this.sex = "O";

        this.studiesNum = studiesNum;
        this.seriesNum = seriesNum;
        this.instancesNum = instancesNum;
    }

    generate() {
        for (let i = 0; i < this.studiesNum; i++) {
            let studyGenerator = new StudyGenerator(this, this.seriesNum, this.instancesNum);
            studyGenerator.generate();
        }
    }
}

module.exports = {
    PatientGenerator
};