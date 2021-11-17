import 'jest-extended';
import {sdk} from '../utils';
import {createArticle, deleteArticles} from '@tests/functions/utils/article';
import {Article} from '@sdk/node';

describe('sort entities', () => {
    const createdArticles: Article[] = [];
    beforeAll(async () => {
        createdArticles.push(await createArticle({procurementLeadDays: 5}));
        createdArticles.push(await createArticle({procurementLeadDays: 3}));
        createdArticles.push(await createArticle({procurementLeadDays: 8}));
    });
    afterAll(async () => {
        await deleteArticles(createdArticles.map(v => v.id) as string[], createdArticles.map(v => v.unitId));
    });

    it('Should sort the articles ascending by unitId', async () => {
        const articles = await sdk.article.some({
            sort: {
                unitId: 'asc'
            },
            filter: {
                id: {
                    IN: createdArticles.map(v => v.id).filter(Boolean) as string[]
                }
            }
        });

        const article1 = articles[0];
        const article2 = articles[1];
        expect(article1.unitId && article2.unitId && article1.unitId <= article2.unitId).toBeTrue();
    });

    it('Should sort the articles decending by unitId', async () => {
        const articles = await sdk.article.some({
            sort: {
                unitId: 'desc'
            },
            filter: {
                id: {
                    IN: createdArticles.map(v => v.id).filter(Boolean) as string[]
                }
            }
        });

        const article1 = articles[0];
        const article2 = articles[1];
        expect(article1.unitId && article2.unitId && article1.unitId >= article2.unitId).toBeTrue();
    });

    it('Should sort the articles ascending by procurementLeadDays', async () => {
        const articles = await sdk.article.some({
            sort: {
                procurementLeadDays: 'asc'
            },
            filter: {
                id: {
                    IN: createdArticles.map(v => v.id).filter(Boolean) as string[]
                }
            }
        });
        expect(articles[0].procurementLeadDays! <= articles[1].procurementLeadDays!).toBeTrue();
    });

    it('Should sort the articles ascending by procurementLeadDays and descending by unitId', async () => {
        const articles = await sdk.article.some({
            sort: {
                procurementLeadDays: 'asc',
                unitId: 'desc'
            },
            filter: {
                id: {
                    IN: createdArticles.map(v => v.id).filter(Boolean) as string[]
                }
            }
        });

        const article1 = articles[0];
        const article2 = articles[1];
        expect(article1.unitId && article2.unitId && article1.procurementLeadDays! <= article2.procurementLeadDays! && article1.unitId >= article2.unitId).toBeTrue();
    });

    it('Should sort the articles ascending by procurementLeadDays and descending by nested unit.id', async () => {
        const articles = await sdk.article.some({
            sort: {
                procurementLeadDays: 'asc',
                unit: {id: 'desc'}
            },
            filter: {
                id: {
                    IN: createdArticles.map(v => v.id).filter(Boolean) as string[]
                }
            }
        });

        const article1 = articles[0];
        const article2 = articles[1];
        expect(article1.unitId && article2.unitId && article1.procurementLeadDays! <= article2.procurementLeadDays! && article1.unitId >= article2.unitId).toBeTrue();
    });
});
