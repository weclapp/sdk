import {Article, Unit} from '@sdk/node';
import {sdk} from '@tests/utils';
import {generateRandomName} from '@tests/functions/utils/generateRandomName';

export const createArticle = async (): Promise<Article> => {
    const unit = await sdk.unit.create({
        name: generateRandomName()
    }) as Unit;

    return  await sdk.article.create({
        name: generateRandomName(),
        articleNumber: generateRandomName(),
        unitId: unit.id
    }) as Article;
};

export const deleteArticle = async (articleId: string, unitId?: string): Promise<void> => {
    await sdk.article.delete(articleId);
    if (unitId) {
        await sdk.unit.delete(unitId);
    }
};
