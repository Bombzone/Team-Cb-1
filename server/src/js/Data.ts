import { Card } from "./Cards";
import { UserStory } from "./UserStory";

const cards: Card[] = [
    new Card(1),
    new Card(2),
    new Card(3),
    new Card(5),
    new Card(8),
    new Card(13),
    new Card(20),
    new Card(40),
    new Card(100)
]
let getCards = (): Card[] => {
    return cards;
}
let getCard = (id: number): Card | undefined => {
    return cards.find((card) => card.getValue() === id);
}
const storyQueue: UserStory[] = [
    new UserStory("User Story #1"),
    new UserStory("User Story #2"),
    new UserStory("User Story #3"),
    new UserStory("User Story #4"),
    new UserStory("User Story #5"),
    new UserStory("User Story #6"),

]
let getStoryQueue = (): UserStory[] => {
    return storyQueue;
}
const estimations: UserStory[] = [
    new UserStory("US", 1),
    new UserStory("US", 2),
    new UserStory("US", 3),
    new UserStory("US", 5),
    new UserStory("US", 8),
    new UserStory("US", 13),
    new UserStory("US", 20),
    new UserStory("US", 40),
    new UserStory("US", 100)
]
let getEstimations = (): UserStory[] => {
    return estimations;
}
export { getCards, getCard, getStoryQueue, getEstimations };