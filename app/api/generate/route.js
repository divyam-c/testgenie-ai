export async function POST(req) {
  try {
    const body = await req.json();
    const input = body.input;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `You are a QA expert. Generate structured test cases for: ${input}.
            
Include:
- Test Case ID
- Title
- Steps
- Expected Result
- Type (Positive/Negative)`,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("OPENROUTER RESPONSE:", data);

    if (!response.ok) {
      return Response.json({
        result: "API Error: " + JSON.stringify(data),
      });
    }

    const result = data.choices?.[0]?.message?.content || "No response";

    return Response.json({ result });

  } catch (error) {
    return Response.json({
      result: "Server Error: " + error.message,
    });
  }
}