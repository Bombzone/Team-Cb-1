import path from "path";
import express, { Express, NextFunction, Request, Response } from "express"
import { getCards, getCard, getStoryQueue, getEstimations } from "./Data";
const port = 8080;
const app: Express = express();
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use((inRequest: Request, inResponse: Response, inNext: NextFunction) => {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin, X-Requested-With.Content-Type,Accept");
    inNext();
});
app.get("/api/cards", (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    inResponse.json(getCards());
});
app.get("/api/cards/:id", (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const id = parseInt(inRequest.params.id);
    inResponse.json(getCard(id));
});
app.get("/api/storyQueue", (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    inResponse.json(getStoryQueue());
});
app.get("/api/estimations", (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    inResponse.json(getEstimations());
})
app.get("/02beb6f43de7e44d0a24.ttf", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/02beb6f43de7e44d0a24.ttf"));
});
app.get("/main.js", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/main.js"));
});
app.post("/api/estimations", (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    inResponse.json(inRequest.body);
    console.log(inRequest.body);
});
app.get("/*", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/index.html"));
});

app.listen(port, () => { console.log("Server listening on port: " + port) });
