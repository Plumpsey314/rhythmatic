import { getFixingPromptPrompt, getGPT3Prompt, getPrompt, getLangchainPromt } from '@/util/prompt';
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorDBQAChain } from "langchain/chains";

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

  // This is the default versions
  if (req.body.mode = 'langchain') {
    try{
      // Set up Pinecone
      const pinecone = new PineconeClient();
      const pineconeKey: string = process.env.PINECONE_API_KEY?process.env.PINECONE_API_KEY:'';
      await pinecone.init({
        environment: "us-west1-gcp-free",
        //TODO: Change so not public on github
        apiKey: pineconeKey,
      });
      const indexName = "new-songs";

      // Set up Open AI
      const embeddings = new OpenAIEmbeddings();
      const llm = new ChatOpenAI({temperature: 0.4, modelName: "gpt-3.5-turbo"})

      const prompt = getLangchainPromt();
      const text = req.body.texts.join(' ');
      const pineconeIndex = pinecone.Index(indexName)
      const vectorDocs = await PineconeStore.fromExistingIndex(
        embeddings,
        { pineconeIndex }
      );

      // Question Answering
      const qa = VectorDBQAChain.fromLLM(llm, vectorDocs, {
        k: 6, // This is the number of embedings suggested.
        returnSourceDocuments: true,
      });
      const answer = await qa.call({query: text, prompt: prompt});
      // console.log(answer.text);
      res.status(200).json({ result: answer.text });
      return;
    } catch (error: any) {
      handleErrors(error);
    }
    return;
  }

  let prompt = "";
  // suggest is the old version of suggesting songs
  if (req.body.mode == "suggest") {
    prompt = getPrompt();
  }
  if (req.body.mode == "fix prompt") {
    prompt = getFixingPromptPrompt();
  }

  const chatHistory = req.body.texts.map((message: string) => {
    return { "role": "user", "content": `${message}` }
  })

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
