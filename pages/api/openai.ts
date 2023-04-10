import { getFixingPromptPrompt, getGPT3Prompt, getPlaylistPrompt, getPrompt } from '@/util/prompt';
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

  // handling errors are currently the same for every mode
  function handleErrors(error: any) {
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

  if (req.body.mode == "gpt3") {
    const prompt = getGPT3Prompt();
    const text = req.body.texts.join(' ');

    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${prompt}${text} -> `,
        temperature: .7,
        max_tokens: 256
      });
      res.status(200).json({ result: completion.data.choices[0].text });
    } catch (error: any) {
      handleErrors(error);
      return;
    }
    return;
  }

  let chatHistory = req.body.texts.map((message: string) => {
    return { "role": "user", "content": `${message}` }
  })

  let prompt = "";
  if (req.body.mode == "suggest") {
    prompt = getPrompt();
  }
  if (req.body.mode == "fix prompt") {
    prompt = getFixingPromptPrompt();
  }
  if (req.body.mode == "playlist") {
    chatHistory = [];
    prompt = getPlaylistPrompt(req.body.texts);
  }

  const messages = [{ "role": "system", "content": `${prompt}` }, ...chatHistory];

  if (prompt == "") {
    throw "Could not load the prompt to give to ChatGPT"
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 256
    });
    if (completion.data.choices[0].message) {
      res.status(200).json({ result: completion.data.choices[0].message.content });
    } else {
      throw 'completion.data.choices[0].message is undefined'
    }
  } catch (error: any) {
    handleErrors(error);
  }
}
