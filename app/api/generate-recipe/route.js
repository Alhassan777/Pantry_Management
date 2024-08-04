import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { ingredients, mealType, difficulty, time } = await req.json();

    let prompt = `Create a ${difficulty} ${mealType} recipe that takes ${time} using the following ingredients: ${ingredients.join(", ")}. 
                  Please format the recipe into sections: Ingredients, Instructions, and Serving Suggestions.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LLAMA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          {"role": "user", "content": prompt},
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    let generatedText = result.choices[0].message.content;

    // Post-process the generated text to enhance readability
    generatedText = generatedText.replace(/\n\n/g, '\n'); // Reduce excessive newlines
    generatedText = generatedText.split('\n').map(line => line.trim()).join('\n'); // Trim spaces around lines

    // Optional: further formatting can be added here

    return NextResponse.json({ recipe: generatedText });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
