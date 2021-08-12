import {Article, ARTICLE_ARTICLE_TYPE} from '@sdk/node';
import {sdk} from '@tests/utils';
import {generateRandomName} from '@tests/functions/utils/generateRandomName';

export const createArticle = async (additionalProperties?: {procurementLeadDays?: number, articleType?: ARTICLE_ARTICLE_TYPE}): Promise<Article> => {
    const unit = await sdk.unit.create({
        name: generateRandomName()
    });

    return await sdk.article.create({
        name: generateRandomName(),
        articleNumber: generateRandomName(),
        articleType: additionalProperties?.articleType,
        unitId: unit.id,
        procurementLeadDays: additionalProperties?.procurementLeadDays
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
