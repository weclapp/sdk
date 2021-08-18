import {indent} from '@utils/indent';
import {pascalCase} from 'change-case';

export interface RelatedEntityProperty {
    property: string;
    relatedEntity: string
}

export const relatedEntityPropertyDefinition = (relatedEntities: RelatedEntityProperty[], indentLevel?: number): string => {
    const str = relatedEntities.map(v => `readonly ${v.property}: ${pascalCase(v.relatedEntity)};`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};

export const relatedEntitiesName = (entityName: string): string => {
    return 'Weclapp__RelatedEntities_' + pascalCase(entityName);
};
