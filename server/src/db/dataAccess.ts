import DataStore from "@seald-io/nedb";
import * as path from "path";
import { UserStory } from "../js/UserStory";
import { Card } from "../js/Cards";

class StoryDataAccess {
    private db: DataStore;
    private static dataAccess: StoryDataAccess;
    private constructor() {
        this.db = new DataStore({
            filename: path.join(__dirname, "stories.db"),
            autoload: true
        });
    }

    public static getDataAccess(): StoryDataAccess {
        if (StoryDataAccess.dataAccess === undefined) {
            this.dataAccess = new StoryDataAccess();
        }
        return StoryDataAccess.dataAccess;
    }

    public async addStory(story: UserStory): Promise<UserStory> {
        return await this.db.insertAsync(story);
    }


    public async getStory(ID: number): Promise<UserStory> {
        return await this.db.findOneAsync({ id: ID });
    }
    public async getStories(): Promise<UserStory[]> {
        return await this.db.findAsync({});
    }

    public async updateID(prevID: number, ID: number): Promise<UserStory> {
        let currentStory: UserStory;
        currentStory = await this.db.findOneAsync({ id: prevID })
        if (currentStory === null) {
            console.log("unable to find userstory");
            return await new UserStory();
        }
        currentStory = new UserStory(currentStory.name, currentStory.description, currentStory.id)
        
        if (ID > prevID) {
            currentStory.setID(ID + "");
            for (let currentID = ID; currentID > prevID; (currentID--)) {                
                let newStory: UserStory = await this.db.findOneAsync({ id: currentID + "" });
                if (newStory) {
                    newStory = new UserStory(newStory.name, newStory.description, newStory.id)
                    newStory.setID("" + (Number.parseInt(currentID + "") - 1));
                    await this.saveStory(newStory);
                }
            }
        } else if (ID < prevID) {
            currentStory.setID(ID + "");
            for (let currentID = ID; currentID <= prevID; (currentID++)) {
                let newStory: UserStory = await this.db.findOneAsync({ id: currentID + "" });
                if (newStory) {
                    newStory = new UserStory(newStory.name, newStory.description, newStory.id)
                    newStory.setID("" +( Number.parseInt(currentID + "") + 1));
                    await this.saveStory(newStory);
                }
            }
        }
        
        return await this.saveStory(currentStory);

    }

    public async saveStory(story: UserStory): Promise<UserStory> {
        return await this.db
            .updateAsync({id: story.id}, story).then(() => {
                return story;
            });
    }


    public async removeStory(story: UserStory): Promise<number> {
        return await this.db.removeAsync({ id: story.id }, {});
    }
}
class CardDataAccess {
    private db: DataStore;
    private static dataAccess: CardDataAccess;
    private constructor() {
        this.db = new DataStore({
            filename: path.join(__dirname, "cards.db"),
            autoload: true
        });
    }

    public static getDataAccess(): CardDataAccess {
        if (CardDataAccess.dataAccess === undefined) {
            this.dataAccess = new CardDataAccess();
        }
        return CardDataAccess.dataAccess;
    }

    public async addCard(card: Card): Promise<Card> {
        return await this.db.insertAsync(card);
    }


    public async getCard(ID: string): Promise<Card> {
        return await this.db.findOneAsync({ _id: ID });
    }
    public async getCards(): Promise<Card[]> {
        return await this.db.findAsync({});
    }


    public async saveCard(card: Card): Promise<Card> {
        return await this.db
            .updateAsync({ _id: card._id }, card).then(() => {
                return card;
            });
    }


    public async removeCard(card: Card): Promise<number> {
        return await this.db.removeAsync({ _id: card._id }, {});
    }
}

class EstimatedStoryDataAccess {
    private db: DataStore;
    private static dataAccess: EstimatedStoryDataAccess;
    private constructor() {
        this.db = new DataStore({
            filename: path.join(__dirname, "estimations.db"),
            autoload: true
        });
    }

    public static getDataAccess(): EstimatedStoryDataAccess {
        if (EstimatedStoryDataAccess.dataAccess === undefined) {
            this.dataAccess = new EstimatedStoryDataAccess();
        }
        return EstimatedStoryDataAccess.dataAccess;
    }

    public async addStory(story: UserStory): Promise<UserStory> {
        return await this.db.insertAsync(story);
    }


    public async getStory(ID: string): Promise<UserStory> {
        return await this.db.findOneAsync({ _id: ID });
    }
    public async getStories(): Promise<UserStory[]> {
        return await this.db.findAsync({});
    }


    public async saveStory(story: UserStory): Promise<UserStory> {
        return await this.db
            .updateAsync({ _id: story._id }, story).then(() => {
                return story;
            });
    }


    public async removeStory(story: UserStory): Promise<number> {
        return await this.db.removeAsync({ _id: story._id }, {});
    }
}

export { StoryDataAccess, CardDataAccess, EstimatedStoryDataAccess };