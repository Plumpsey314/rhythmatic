import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const text = req.body.text || '';
  if (text.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text",
      }
    });
    return;
  }

  const { prompt } = req.body;

  try {
    console.log(text);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
            {"role": "system", "content": `
            Even when you do not understand the request, your responce is always a javascript array of ten songs on spotify. Each Element of the array should have the song title then "\\n" then the artist. Always include square brackets [] encapsulating the suggestions.
            An example good responce is: 
            ["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", etc].
            An example bad responce is:
            "Here are some recommendations for happy songs:\\n 1. "Happy" - Pharrell Williams\\n2. "Can't Stop the Feeling!" - ustin Timberlake\\n3. "Shut Up and Dance" - Walk the Moon"
            `},
            {"role": "user", "content": `${text}`},
        ]
    });
    if(completion.data.choices[0].message){
      console.log("The data:")
      console.log(completion.data.choices[0].message.content);
      res.status(200).json({ result: completion.data.choices[0].message.content });
    }else{
      throw 'completion.data.choices[0].message is undefined'
    }
  } catch (error: any) {
    console.log("BRUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUVY")
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
