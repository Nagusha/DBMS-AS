
interface Studentname{
    name : string;
    age : number;
    email : string;
    course_List: "javascript" | "typescript";
    address: Address;
};
interface Address{
    city : string;
    state : string;
    pincode : number;

};
let Studentname:Studentname = {
    name : "Nagu",
    age : 22,
    email : "nagumadasu70@gmail.com",
    course_List: "javascript",
    address:{
        city : "warangal",
    state : "Telangana",
    pincode : 506164

    }

}


    




