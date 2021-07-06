import {Article} from '@sdk/node';
import {sdk} from '@tests/utils';
import {generateRandomName} from '@tests/functions/utils/generateRandomName';

export const createArticle = async (procurementLeadDays?: number): Promise<Article> => {
    const unit = await sdk.unit.create({
        name: generateRandomName()
    });

    return await sdk.article.create({
        name: generateRandomName(),
        articleNumber: generateRandomName(),
        unitId: unit.id,
        procurementLeadDays
    });
};

export const deleteArticle = async (articleId: string, unitId?: string): Promise<void> => {
    await sdk.article.delete(articleId);
    if (unitId) {
        await sdk.unit.delete(unitId);
    }
};

export const deleteArticles = async (articleIds: string[], unitIds?: string[]): Promise<void> => {
    await Promise.all(
      articleIds.map(v => sdk.article.delete(v))
    );
    if (unitIds?.length) {
        await Promise.all(
          unitIds.map(v => sdk.unit.delete(v))
        );
    }
};
