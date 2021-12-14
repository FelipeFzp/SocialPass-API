import { Container } from 'inversify';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { FileService } from './services/file.service';
import { CardService } from './services/card.service';
import { SocialNetworkService } from './services/social-network.service';
import { CardAccessService } from './services/card-access.service';
import { CardCategoryService } from './services/card-category.service';
import { TrendsService } from './services/trends.service';
import { CardCollectionService } from './services/card-collection.service';

const ServicesCollection = new Container();

ServicesCollection.bind(AuthService).toSelf();
ServicesCollection.bind(UserService).toSelf();
ServicesCollection.bind(FileService).toSelf();
ServicesCollection.bind(CardService).toSelf();
ServicesCollection.bind(SocialNetworkService).toSelf();
ServicesCollection.bind(CardAccessService).toSelf();
ServicesCollection.bind(CardCategoryService).toSelf();
ServicesCollection.bind(TrendsService).toSelf();
ServicesCollection.bind(CardCollectionService).toSelf();

export { ServicesCollection };