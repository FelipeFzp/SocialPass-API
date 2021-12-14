import { CardCategoriesController } from "./controllers/card-categories.controller";
import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { CardsController } from "./controllers/cards.controller";
import { SocialNetworksController } from "./controllers/social-networks.controller";
import { UsersController } from "./controllers/users.controller";
import { VERSION } from "./version";
import { TrendsController } from "./controllers/trends.controller";
import { CardCollectionsController } from "./controllers/card-collections.controller";

const routes = Router();

routes.get('/', (req, res) => {
    res.json({
        name: 'X-Pass API',
        key: 'xpass.api',
        version: VERSION
    });
});

routes.use('/auth', AuthController);
routes.use('/users', UsersController);
routes.use('/cards', CardsController);
routes.use('/socialNetworks', SocialNetworksController);
routes.use('/cardCategories', CardCategoriesController);
routes.use('/trends', TrendsController);
routes.use('/cardCollections', CardCollectionsController);

export { routes };