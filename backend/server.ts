import express, { Express, Request, Response } from "express";
import cors from "cors";
import * as path from "path";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";

dotenv.config();

import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const buildPath = path.join(__dirname, "../dist");
const app: Express = express();
const port = 5001;

app.use(express.static(buildPath));
app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
});
const openai = new OpenAIApi(configuration);

// gets the static files from the build folder
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.post("/test", (req: Request, res: Response) => {
  const requestData = req.body.prompt;
  console.log(requestData);
  const response = JSON.parse('{"name":"John", "age":30, "city":"New York"}');
  res.send(response);
});

app.post("/palette", async (req: Request, res: Response) => {
  const prompt = req.body.prompt;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          // content: `Provide six hex codes that best summarize the following text: ${prompt}. Respond with a JSON object {"colors": [#hex1, #hex2, ...]}. ONLY OUTPUT VALID. DO NOT OUPUT ANY TEXT.`,
          content: `Turn the following prompt into a six color palette: "${prompt}". Respond with a JSON object {"colors": ["hsl(275,100%,50%)", "hsl(275,100%,63%)", ...]}. ONLY OUTPUT VALID JSON. DO NOT OUPUT ANY TEXT.`,
          // content: `Turn the following prompt into a six color palette: "${prompt}". Respond with a JSON object {"colors": ["#hex1", "#hex2", ...]}. ONLY OUTPUT VALID JSON. DO NOT OUPUT ANY TEXT.`,
        },
      ],
    });
    res.send(completion.data.choices[0].message);
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
});
