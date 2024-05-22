class Student{
    Name: string;
    Age: number;
    Subject: string;
    Courses: string[];

constructor(Name: string, Age: number, Subject: string, Courses: string[])
{
    this.Name = Name;
    this.Age = Age;
    this.Subject = Subject;
    this.Courses = Courses;

    }

     getDetails(): void {

        console.log('Student Details:');
        console.log('Name: ' + this.Name);
        console.log('Age: ' + this.Age);
        console.log('Subject: ' + this.Subject);
        console.log('Courses: ' + this.Courses.join(','));
     }
    }
    

const student = new Student("Nagulu", 22, "Maths", ['typescript']);
student.getDetails();

