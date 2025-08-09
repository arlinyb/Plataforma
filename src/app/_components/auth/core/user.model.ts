export class FirebaseUserModel {
    image: string;
    name: string;
    email: string;
    phone: string;
    provider: string;
    uid:string;

  
    
    constructor() {
        this.image = "";
        this.name = "";
        this.email = "";
        this.provider = "";
        this.phone = "";
        this.uid = "";
    }
}
