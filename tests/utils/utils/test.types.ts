export interface Address {
    city: string;
    zipcode: string;
}

export interface Contact {
    firstName: string;
    lastName: string;
    addresses: Address[];
}

export interface Company {
    name: string;
    address: Address;
}

export enum EmploymentStatus {
    EMPLOYED = 'EMPLOYED',
    UNEMPLOYED = 'UNEMPLOYED'
}

export interface User {
    id: string;
    age: number;
    username: string;
    contacts: Contact[];
    company: Company;
    employmentStatus: EmploymentStatus;
    professionId: string;
}

export type RelatedEntities_Profession = undefined;

export enum SkillLevel {
    JUNIOR,
    MIDLEVEL,
    SENIOR,
    LEAD
}

export interface Profession {
    id: string;
    name: string;
    level: SkillLevel;
}

export type RelatedEntities_User = {
    readonly professionId: {
        entity: Profession,
        relatedEntity: RelatedEntities_Profession,
        sortAndFilterProperty: 'profession'
    }
};
