export interface Address {
    city: string;
    zipcode: string;
}

export interface Contact {
    firstName: string;
    lastName: string;
    address: Address[];
}

export interface User {
    id: string;
    age: number;
    username: string;
    contact: Contact[];
}
