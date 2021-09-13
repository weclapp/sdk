import {indent} from '@utils/indent';
import {pascalCase} from 'change-case';
import {tsInterfaceProperties} from '@ts/interfaces';

export interface RelatedEntityProperty {
    property: string;
    relatedEntity: string
}

export const relatedEntitiesName = (entityName: string): string => {
    return 'Weclapp__RelatedEntities_' + pascalCase(entityName);
};

const resolveReferencesForRelatedEntity = ({property, relatedEntity}: RelatedEntityProperty): string => {
    return tsInterfaceProperties([
        {
            name: 'entity',
            value: pascalCase(relatedEntity),
            required: true
        },
        {
            name: 'relatedEntity',
            value: relatedEntitiesName(pascalCase(relatedEntity)),
            required: true
        },
        {
            name: 'sortAndFilterProperty',
            value: `'${property.endsWith('Id') ? property.slice(0, -2) : property}'`,
            required: true
        }
    ], 1);
};

export const relatedEntityPropertyDefinition = (relatedEntities: RelatedEntityProperty[], indentLevel?: number): string => {
    const str = relatedEntities.map(v => `readonly ${v.property}: {\n${resolveReferencesForRelatedEntity(v)}\n};`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};
