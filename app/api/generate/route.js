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
                model: "stepfun/step-3.5-flash:free",
                max_tokens: 500,
                messages: [
                    {
                        role: "user",
                        content: `You are a QA expert.

Generate test cases for the following requirement:
"${input}"

Return in clean table format with columns:
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
                result: "⚠️ AI is busy. Please try again.",
            });
        }

        const result =
            data.choices?.[0]?.message?.content || "⚠️ No response generated. Try again.";

        return Response.json({ result });

    } catch (error) {
        return Response.json({
            result: "⚠️ Server error. Please try again later.",
        });
    }
}