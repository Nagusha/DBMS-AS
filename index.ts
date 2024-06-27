
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';

interface SubjectData {
  SubjectName: string;
  TotalMarks: number;
  PassPercentage: number;
}

interface StudentMark {
  StudentName: string;
  SubjectName: string;
  MarksObtained: number;
}

const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

function generateStudentReport(
  masterData: SubjectData[],
  studentMarks: StudentMark[]
): { 
  report: string; 
  failedStudents: string[]; 
  highestMarksBySubject: Record<string, string[]>; 

  subjectPassPercentages: { 
    highest: string; 
    lowest: string 
  } 
} 
{
  let report = 'Exam Report:\n\n';

  const studentTotalMarks: Record<string, { 
    totalMarks: number; 
    totalPercentage: number; 
    subjectCounts: number; 
    pass: boolean }> = {};

  const highestMarksBySubject: Record<string, { 
    studentName: string; 
    marks: number }> = {};

  const subjectPassRates: Record<string, { 
    passCount: number; 
    totalCount: number 
  }> = {};

  studentMarks.forEach((studentMark) => {
    const subject = masterData.find((subject) => subject.SubjectName === studentMark.SubjectName);
    if (subject) {
      const passMarks = (subject.TotalMarks * subject.PassPercentage) / 100;
      const result = studentMark.MarksObtained >= passMarks ? 'Pass' : 'Fail';

      if (!studentTotalMarks[studentMark.StudentName]) {
        studentTotalMarks[studentMark.StudentName] = { 
          totalMarks: 0, 
          totalPercentage: 0, 
          subjectCounts: 0, 
          pass: true 
        };
      }

      studentTotalMarks[studentMark.StudentName].totalMarks += studentMark.MarksObtained;
      studentTotalMarks[studentMark.StudentName].subjectCounts += 1;
      studentTotalMarks[studentMark.StudentName].pass = studentTotalMarks[studentMark.StudentName].pass && result === 'Pass';

      if (!highestMarksBySubject[studentMark.SubjectName] || highestMarksBySubject[studentMark.SubjectName].marks < studentMark.MarksObtained) {
        highestMarksBySubject[studentMark.SubjectName] = { 
          studentName: studentMark.StudentName, 
          marks: studentMark.MarksObtained 
        };
      }

      if (!subjectPassRates[studentMark.SubjectName]) {
        subjectPassRates[studentMark.SubjectName] = { passCount: 0, totalCount: 0 };
      }

      subjectPassRates[studentMark.SubjectName].totalCount += 1;
      if (result === 'Pass') {
        subjectPassRates[studentMark.SubjectName].passCount += 1;
      }
    }
  });

  Object.keys(studentTotalMarks).forEach((studentName) => {
    const studentData = studentTotalMarks[studentName];
    studentData.totalPercentage = (studentData.totalMarks / (studentData.subjectCounts * 100)) * 100;
    if (studentData.subjectCounts >= 5 && studentData.totalPercentage >= 40 && studentData.pass) {
      report += `Student: ${studentName}, 
      Total Marks: ${studentData.totalMarks}, 
      Total Percentage: ${studentData.totalPercentage.toFixed(2)}%, 
      Result: Pass\n`;

    } 
    else {
      report += `Student: ${studentName}, 
      Total Marks: ${studentData.totalMarks}, 
      Total Percentage: ${studentData.totalPercentage.toFixed(2)}%, 
      Result: Fail\n`;
    }
  });

  const failedStudents = Object.keys(studentTotalMarks).filter((studentName) => {
    const studentData = studentTotalMarks[studentName];
    return studentData.subjectCounts < 5 || studentData.totalPercentage < 40 || !studentData.pass;
  });

  const highestMarksBySubjectReport: Record<string, string[]> = {};
  Object.keys(highestMarksBySubject).forEach((subjectName) => {
    highestMarksBySubjectReport[subjectName] = [highestMarksBySubject[subjectName].studentName];
  });

  const subjectPassPercentages: { 
    highest: string; 
    lowest: string 
  } = { 
    highest: '', 
    lowest: '' 
  };

  let highestPassRate = -1;
  let lowestPassRate = 101;

  Object.keys(subjectPassRates).forEach((subjectName) => {
    const passRate = (subjectPassRates[subjectName].passCount / subjectPassRates[subjectName].totalCount) * 100;
    if (passRate > highestPassRate) {
      highestPassRate = passRate;
      subjectPassPercentages.highest = subjectName;
    }
    if (passRate < lowestPassRate) {
      lowestPassRate = passRate;
      subjectPassPercentages.lowest = subjectName;
    }
  });

  return { 
    report, 
    failedStudents, 
    highestMarksBySubject: highestMarksBySubjectReport, 
    subjectPassPercentages 
  };
}

async function readMasterData(filePath: string): Promise<SubjectData[]> {
  try {
    const masterData: SubjectData[] = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        masterData.push({
          SubjectName: row.SubjectName,
          TotalMarks: parseInt(row.TotalMarks),
          PassPercentage: parseFloat(row.PassPercentage)
        });
      });

    await new Promise((resolve, reject) => {
      stream.on('end', () => resolve(masterData));
      stream.on('error', reject);
    });

    return masterData;
  } catch (error) {
    throw new Error(`Error reading master data from ${filePath}: ${error.message}`);
  }
}

async function readStudentMarks(filePath: string): Promise<StudentMark[]> {
  const studentMarks: StudentMark[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        studentMarks.push({
          StudentName: row.StudentName,
          SubjectName: row.SubjectName,
          MarksObtained: parseInt(row.MarksObtained)
        });
      })
      .on('end', () => {
        resolve(studentMarks);
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
}

async function main() {
  try {
    const masterDataFilePath = path.resolve(__dirname, config.masterDataFilePath);
    const studentMarksFilePath = path.resolve(__dirname, config.studentMarksFilePath);
    const reportOutputPath = path.resolve(__dirname, config.reportOutputPath);

    const [masterData, studentMarks] = await Promise.all([
      readMasterData(masterDataFilePath),
      readStudentMarks(studentMarksFilePath)
    ]);

    const { report, 
      failedStudents, 
      highestMarksBySubject, 
      subjectPassPercentages 
    } = generateStudentReport(masterData, studentMarks);

    fs.writeFileSync(reportOutputPath, report);
    console.log(`Report generated successfully at: ${reportOutputPath}`);
    console.log(`Failed Students: ${failedStudents.join(', ')}`);
    console.log(`Highest Marks by Subject: ${JSON.stringify(highestMarksBySubject, null, 2)}`);
    console.log(`Subject with Highest Pass Percentage: ${subjectPassPercentages.highest}`);
    console.log(`Subject with Lowest Pass Percentage: ${subjectPassPercentages.lowest}`);
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

main();
