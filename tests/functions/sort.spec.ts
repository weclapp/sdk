import 'jest-extended';
import {sdk} from '../utils';
import {createArticle, deleteArticles} from '@tests/functions/utils/article';
import {Article} from '@sdk/node';

describe('sort entities', () => {
    const createdArticles: Article[] = [];
    beforeAll(async () => {
        createdArticles.push(await createArticle(5));
        createdArticles.push(await createArticle(3));
        createdArticles.push(await createArticle(8));
    });
    afterAll(async () => {
        await deleteArticles(createdArticles.map(v => v.id) as string[], createdArticles.map(v => v.unitId) as string[]);
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
        expect(articles[0].unitId! <= articles[1].unitId!).toBeTrue();
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
        expect(articles[0].unitId! >= articles[1].unitId!).toBeTrue();
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
        expect(articles[0].procurementLeadDays! <= articles[1].procurementLeadDays! && articles[0].unitId! >= articles[1].unitId!).toBeTrue();
    });
});
