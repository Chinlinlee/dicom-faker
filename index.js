const { Command } = require("commander");
const parseInt = require("parse-int");
const { GlobalArgs } = require("./globalArgs");


const program = new Command();

program
.option('-p, --patients <number>', 'number of patients', '1')
.option('-st, --studies <number>', 'number of studies', '1')
.option('-se, --series <number>', 'number of series', '1')
.option('-in, --instances <number>', 'number of instances', '1')
.option('-l, --lorem', 'use lorem ipsum image', false)
.option('-o, --output <path>', 'output path', './dicom')
.parse(process.argv);

const options = program.opts();

let patientsNum = parseInt(options.patients);
GlobalArgs.output = options.output;
GlobalArgs.useLoremImage = options.lorem;

(async () => {
    const { PatientGenerator } = require("./patientGenerator");
    for (let i =  0 ; i < patientsNum; i++) {
        const patientGenerator = new PatientGenerator(
            parseInt(options.studies),
            parseInt(options.series),
            parseInt(options.instances)
        );
    
        await patientGenerator.generate();
    }
})();
