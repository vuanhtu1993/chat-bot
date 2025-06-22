import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, config } = await request.json();

    const completion = await openai.chat.completions.create({
      model: config.model || 'gpt-4',
      messages,
      temperature: config.temperature || 0.7,
      functions: config.functions,
      function_call: 'auto',
    });

    const responseMessage = completion.choices[0].message;

    // Handle function calling if present
    if (responseMessage.function_call) {
      const functionCall = responseMessage.function_call;

      if (functionCall.name === 'search_google' && process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
        const args = JSON.parse(functionCall.arguments);

        const searchResponse = await axios.get(
          'https://www.googleapis.com/customsearch/v1',
          {
            params: {
              key: process.env.GOOGLE_API_KEY,
              cx: process.env.GOOGLE_CX,
              q: args.query,
            },
          }
        );

        const functionResponse = {
          results: searchResponse.data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })) || [],
          totalResults: searchResponse.data.searchInformation?.totalResults || 0,
        };

        // Get final response with search results
        const secondCompletion = await openai.chat.completions.create({
          model: config.model || 'gpt-4',
          messages: [
            ...messages,
            responseMessage,
            {
              role: 'function',
              name: functionCall.name,
              content: JSON.stringify(functionResponse),
            },
          ],
          temperature: config.temperature || 0.7,
        });

        return NextResponse.json({
          response: secondCompletion.choices[0].message.content,
          functionCall: {
            name: functionCall.name,
            args: JSON.parse(functionCall.arguments),
            result: functionResponse,
          },
        });
      }
    }

    return NextResponse.json({
      response: responseMessage.content
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
