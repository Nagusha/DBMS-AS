
interface Student {
  name: string;
  age: number;
  email: string;
  grade: string;
}

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyStudent = MyReadonly<Student>;

const nagusha: ReadonlyStudent = {
  name: "Nagu",
  age: 22,
  email : "nagumadasu70@gmail.com",
  grade: "A"

};
console.log(nagusha);

