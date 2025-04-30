// restful server
import path from "path";
import express, { Express, NextFunction, Request, Response } from "express"
import { UserStory } from "../js/UserStory";
import { CardDataAccess, EstimatedStoryDataAccess, StoryDataAccess } from "../db/dataAccess";
import { Card } from "../js/Cards";
import { HttpStatusCode } from "axios";
import WebSocket from "ws";
import User from "../js/User";

const app: Express = express();

//WebSocket server
const WSPort = 3030;
const RESTfulPort = 8080;

const wsServer = new WebSocket.Server({ port: WSPort }, () => {
    console.log("This sever is servething! Huzzah!");
});


let users: User[] = new Array();
let consensus = (index: number) => {
    let isConsensus = true;
    let firstPoints = users.at(0)?.getPoints();
    if (index > 0) {
        firstPoints = users.at(index)?.getPoints()
    } else if (index < users.length) { index = 0 }
    if (firstPoints == undefined) { } else if (firstPoints >= 0) {
        users.forEach((user) => {
            isConsensus = ((user.getPoints() == firstPoints) || user.getPoints() == -1)
        })
    } else {
        consensus(index + 1)
    }
    if (isConsensus) {
        return firstPoints;
    };
}



// Observer Pattern
wsServer.on("connection", (socket: WebSocket) => {
    const voted = async () => {
        let hasEveryoneVoted = true;
        users.forEach((person) => {
            if (hasEveryoneVoted) {
                hasEveryoneVoted = person.getPoints() != -2;
                console.log(person.getName() + (person.getPoints() != -2 ? " has voted" : " hasn't voted"));

            }
        })

        if (hasEveryoneVoted) {
            let consensusVal = consensus(0)
            if (consensusVal) {
                const stories = await StoryDataAccess.getDataAccess().getStories();
                stories.sort((a, b) => parseInt(a.id!) - parseInt(b.id!));
                const story: UserStory = stories[0];
                if (story != null) {
                    story.storyValues = (consensusVal);
                    EstimatedStoryDataAccess.getDataAccess().addStory(story);
                    StoryDataAccess.getDataAccess().removeStory(story);
                }
            }
            console.log("Everyone voted!")
            wsServer.clients.forEach((client) => {
                client.send("allVoted");
            });
            users.forEach((user) => {
                user.resetPoints();
            })
        }
    }
    console.log("Client connected...");
    const uid: string = `uid${new Date().getTime()}`;
    socket.on("message", (inMessage: string) => {
        console.log(`Message received: ${inMessage}`);
        const messageParts: string[] = String(inMessage).split("_");

        const messageType = messageParts[0];
        const uid = messageParts[1];

        switch (messageType) {
            case "voted":
                const voteValue = messageParts[2];
                console.log(uid);
                console.log(voteValue);
                // update user's status to have voted and thier vote number
                users.forEach(user => {
                    if (user.getUID() === uid) {
                        user.setPoints(parseInt(voteValue));
                    }
                });
                voted();
                break;
            case "addUser":
                //if everyone clicked the same card then that value should be returned to all users
                let name = messageParts[2];
                users.push(new User(uid, name));
                wsServer.clients.forEach((inClient: WebSocket) => {
                    inClient.send(`new-user_${name}`);
                });
                break;
            case "close":
                users.forEach((user, i) => {
                    if (user.getUID() == uid) {
                        users.splice(i, 1);
                    }
                })
                break;
        }
    })

    // Create unique identifier to the client
    // construct connection message and return generated pid
    const message = `connected_${uid}`;
    console.log(message);

    // Send message to client through socket
    socket.send(message);
});






let storyCount = 0; app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use((inRequest: Request, inResponse: Response, inNext: NextFunction) => {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin, X-Requested-With.Content-Type,Accept");
    inNext();
});
app.get("/api/cards", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const cards: Card[] = await CardDataAccess.getDataAccess().getCards();
    inResponse.json(cards);
});

app.get("/api/storyQueue", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const stories: UserStory[] = await StoryDataAccess.getDataAccess().getStories();
    stories.forEach(story => { if (parseInt(story.id!) > storyCount) storyCount = parseInt(story.id!) + 1 })
    inResponse.json(stories);
});
app.get("/api/estimations", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const stories: UserStory[] = await EstimatedStoryDataAccess.getDataAccess().getStories();
    stories.forEach(story => { if (parseInt(story.id!) > storyCount) storyCount = parseInt(story.id!) + 1 })
    inResponse.json(stories);
})
app.post("/api/deleteStory", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const story: UserStory = inRequest.body;
    const numberRemoved: number = await StoryDataAccess.getDataAccess().removeStory(story);
})
app.get("/02beb6f43de7e44d0a24.ttf", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/02beb6f43de7e44d0a24.ttf"));
});
app.get("/main.js", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/main.js"));
});
app.get("/*", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/index.html"));
});

app.post("/api/storyQueue/", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const initStory: UserStory = inRequest.body;
    const story: UserStory = await StoryDataAccess.getDataAccess().addStory(new UserStory(initStory.name, initStory.description, storyCount + ""))
    storyCount++;
    inResponse.json(story);
});
app.post("/api/setStoryID", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const initID: number = inRequest.body[0];
    const newID: number = inRequest.body[1];
    const story: UserStory | undefined = await StoryDataAccess.getDataAccess().updateID(initID, newID);
    inResponse.json(story);
})
app.listen(RESTfulPort, () => { console.log("Server at: http://localhost:" + RESTfulPort) });
