import {indent} from '@utils/indent';
import {pascalCase} from 'change-case';

export interface RelatedEntityProperty {
    property: string;
    relatedEntity: string
}

export const relatedEntitiesName = (entityName: string): string => {
    return 'Weclapp__RelatedEntities_' + pascalCase(entityName);
};

const resolveReferencesForRelatedEntity = ({property, relatedEntity}: RelatedEntityProperty): string => {
    return `
        entity: ${pascalCase(relatedEntity)},
        relatedEntity: ${relatedEntitiesName(pascalCase(relatedEntity))},
        sortAndFilterProperty: '${property.endsWith('Id') ? property.slice(0, -2) : property}',
    `;
};

export const relatedEntityPropertyDefinition = (relatedEntities: RelatedEntityProperty[], indentLevel?: number): string => {
    const str = relatedEntities.map(v => `readonly ${v.property}: {${resolveReferencesForRelatedEntity(v)}};`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};
